import { NextResponse } from 'next/server'
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin'
import { z } from 'zod'

const AttemptSchema = z.object({
  moduleId: z.string().min(1).max(128).optional(),
  idx: z.number().int().nonnegative().optional(),
  selected: z.number().int().optional(),
  correct: z.boolean().optional(),
  ts: z.number().int().optional(), // epoch ms
})

type AttemptIn = z.infer<typeof AttemptSchema>

export async function POST(req: Request) {
  const db = getAdminDb()

  // Resolve uid from Bearer token; allow dev fallback via x-dev-uid when not production
  let uid: string | null = null
  try {
    const ah = req.headers.get('authorization') || ''
    const token = ah.startsWith('Bearer ') ? ah.slice(7) : ''
    if (token) {
      uid = (await getAdminAuth().verifyIdToken(token)).uid
    }
  } catch {}
  if (!uid && process.env.NODE_ENV !== 'production') {
    uid = req.headers.get('x-dev-uid') || new URL(req.url).searchParams.get('devUid') || null
  }
  if (!uid) return NextResponse.json({ ok: false }, { status: 401 })

  let body: any = {}
  try { body = await req.json() } catch {}
  const raw = Array.isArray(body?.items) ? (body.items as AttemptIn[]) : []
  if (!raw.length) return NextResponse.json({ ok: true, count: 0 })
  // Validate and normalize
  const items = raw.map((it) => AttemptSchema.safeParse(it)).filter(r => r.success).map(r => (r as any).data as AttemptIn)
  if (!items.length) return NextResponse.json({ ok: true, count: 0 })

  try {
    const MAX_PER_BATCH = 400 // keep margin below 500 limit
    let written = 0
    for (let i = 0; i < items.length; i += MAX_PER_BATCH) {
      const slice = items.slice(i, i + MAX_PER_BATCH)
      const batch = db.batch()
      for (const it of slice) {
        const tsms = typeof it.ts === 'number' ? it.ts : Date.now()
        const ts = new Date(tsms)
        const sec = Math.round(tsms / 1000)
        const m = (it.moduleId || 'mod').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
        const idx = Number.isFinite(it.idx) ? (it.idx as number) : 0
        const sel = Number.isFinite(it.selected) ? (it.selected as number) : -1
        const idempotency = `${m}-${idx}-${sec}-${sel}`
        const ref = db.collection('attempts').doc(uid!).collection('items').doc(idempotency)
        batch.set(ref, { moduleId: m, idx, selected: sel, correct: !!it.correct, ts }, { merge: true })
      }
      await batch.commit()
      written += slice.length
    }
    return NextResponse.json({ ok: true, count: written })
  } catch (e) {
    console.error('attempts_batch_error', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
