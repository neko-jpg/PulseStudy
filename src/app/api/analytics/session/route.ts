import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

// In-memory demo state (shared per process, non-persistent)
type DemoState = { lastAvgFocus?: number }
// @ts-ignore - attach on globalThis lazily without widening types elsewhere
const __state = (globalThis as any).__DEMO_STATE__ || ((globalThis as any).__DEMO_STATE__ = {})
const demoState: DemoState = __state as DemoState

const sessionSchema = z.object({
  sessionId: z.string().min(8),
  moduleId: z.string().nullable().optional(),
  startedAtMs: z.number().int().nonnegative(),
  durationSec: z.number().int().nonnegative(),
  sumFocus: z.number().int().nonnegative(),
  countFocus: z.number().int().nonnegative(),
  avgFocus: z.number().int().min(0).max(100),
  status: z.enum(['completed', 'aborted']),
  // optional dev hint; ignored in production
  ownerUid: z.string().optional(),
})

export async function POST(req: Request) {
  // DEMO: accept and record avgFocus without auth/DB
  if (process.env.NEXT_PUBLIC_DEMO === '1') {
    try {
      const body = await req.json()
      const input = sessionSchema.partial({ ownerUid: true }).parse(body)
      if (Number.isFinite(input.avgFocus)) {
        demoState.lastAvgFocus = Number(input.avgFocus)
      }
      // Optionally accumulate minutes/focus if needed later
      return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
    } catch (e) {
      // be permissive in demo
      return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
    }
  }

  // 1) Authenticate via Firebase ID token; allow dev fallback
  let uid: string | null = null
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''
    if (token) {
      const decoded = await getAdminAuth().verifyIdToken(token)
      uid = decoded.uid
    } else if (process.env.NODE_ENV !== 'production') {
      uid = req.headers.get('x-dev-uid') || new URL(req.url).searchParams.get('devUid')
    }
  } catch (e) {
    console.error('verifyIdToken failed', e)
  }
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2) Validate input
  let input: z.infer<typeof sessionSchema>
  try {
    input = sessionSchema.parse(await req.json())
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // 3) Persist to Firestore under sessions/{uid}/items/{sessionId}
  try {
    const db = getAdminDb()
    const ref = db.doc(`sessions/${uid}/items/${input.sessionId}`)
    await ref.set({
      ownerUid: uid,
      moduleId: input.moduleId ?? null,
      startedAt: new Date(input.startedAtMs),
      endedAt: FieldValue.serverTimestamp(),
      durationSec: input.durationSec,
      sumFocus: input.sumFocus,
      countFocus: input.countFocus,
      avgFocus: input.avgFocus,
      status: input.status,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('failed_to_save_session', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
