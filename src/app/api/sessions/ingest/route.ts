import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const {
      sessionId,
      ownerUid,
      moduleId,
      startedAt, // ms
      durationSec,
      sumFocus,
      countFocus,
      avgFocus,
      status,
    } = body || {}
    if (!sessionId || !ownerUid) return NextResponse.json({ error: 'invalid' }, { status: 400 })

    const db = getAdminDb()
    const ref = db.doc(`sessions/${ownerUid}/items/${sessionId}`)
    const payload: any = {
      ownerUid,
      moduleId: moduleId || null,
      startedAt: typeof startedAt === 'number' ? Timestamp.fromMillis(startedAt) : FieldValue.serverTimestamp(),
      endedAt: FieldValue.serverTimestamp(),
      durationSec: Number(durationSec || 0),
      sumFocus: Number(sumFocus || 0),
      countFocus: Number(countFocus || 0),
      avgFocus: Number.isFinite(avgFocus) ? Number(avgFocus) : 0,
      status: status || 'completed',
    }
    await ref.set(payload, { merge: true })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('sessions/ingest failed', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

