import { NextResponse } from 'next/server'
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin'

export async function GET(req: Request) {
  try {
    // Identify user: prefer Authorization; allow dev header or query in non-prod
    let uid: string | null = null
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : ''
    if (token) {
      try { const decoded = await getAdminAuth().verifyIdToken(token); uid = decoded.uid } catch {}
    }
    if (!uid && process.env.NODE_ENV !== 'production') {
      uid = req.headers.get('x-dev-uid') || new URL(req.url).searchParams.get('devUid') || 'demo-uid'
    }

    // If no uid, return safe empty
    if (!uid) {
      return NextResponse.json({
        summary: { mins: 0, acc: 0.0, avgFocus: 0 },
        heatmap: [],
      }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const db = getAdminDb()

    // Helper: JST handling
    const JST_OFFSET_MS = 9 * 60 * 60 * 1000
    const toDateKeyJST = (d: Date) => {
      const t = new Date(d.getTime() + JST_OFFSET_MS)
      t.setHours(0,0,0,0)
      const k = new Date(t.getTime()).toISOString().slice(0,10)
      return k
    }
    const jstMidnightUTC = () => {
      const now = new Date()
      const j = new Date(now.getTime() + JST_OFFSET_MS)
      j.setHours(0,0,0,0)
      return new Date(j.getTime() - JST_OFFSET_MS)
    }

    // Sessions aggregation (last 28 days, JST window)
    const since = jstMidnightUTC(); since.setDate(since.getDate() - 27)
    const ssnap = await db.collection('sessions').doc(uid).collection('items')
      .where('startedAt', '>=', since)
      .orderBy('startedAt')
      .get()

    let totalSec = 0, wFocus = 0
    const minsByDay = new Map<string, number>()
    ssnap.forEach(doc => {
      const d = doc.data() as any
      const sec = Number(d.durationSec || 0)
      const focus = Number(d.avgFocus || 0)
      totalSec += sec
      wFocus += focus * sec
      const started: Date = d.startedAt?.toDate?.() ?? new Date()
      const day = toDateKeyJST(started)
      minsByDay.set(day, (minsByDay.get(day) || 0) + Math.round(sec/60))
    })

    // Attempts aggregation (support both new and legacy paths)
    const asince = since
    const a1 = await db.collection('attempts').doc(uid).collection('items').where('ts', '>=', asince).orderBy('ts').get().catch(() => null)
    const a2 = await db.collection(`users/${uid}/quiz_attempts`).where('submittedAt', '>=', asince).orderBy('submittedAt').get().catch(() => null)
    let correct = 0, total = 0
    if (a1) a1.forEach(d => { const x = d.data() as any; total += 1; if (x.correct) correct += 1 })
    if (a2) a2.forEach(d => { const x = d.data() as any; total += 1; if (x.isCorrect) correct += 1 })

    // Build 28-day heatmap with zero-fill
    const heatmap: Array<{ date: string; value: number }> = []
    for (let i=0;i<28;i++) {
      const d = new Date(since); d.setDate(since.getDate()+i)
      const key = toDateKeyJST(d)
      heatmap.push({ date: key, value: minsByDay.get(key) || 0 })
    }

    const avgFocus = totalSec > 0 ? Math.round(wFocus/totalSec) : 0
    const acc = total > 0 ? correct/total : 0
    return NextResponse.json({
      summary: { mins: Math.round(totalSec/60), acc, avgFocus },
      heatmap,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('analytics_summary_error', e)
    return NextResponse.json({
      summary: { mins: 0, acc: 0.0, avgFocus: 0 },
      heatmap: [],
    }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
