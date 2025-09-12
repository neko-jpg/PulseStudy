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

    // If no uid, return safe mock
    if (!uid) {
      return NextResponse.json({
        summary: { mins: 0, acc: 0.0, flow: 0 },
        heatmap: [],
      }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const db = getAdminDb()
    const col = db.collection(`users/${uid}/quiz_attempts`)
    const snap = await col.orderBy('submittedAt', 'desc').limit(500).get()
    const rows = snap.docs.map(d => ({ ...(d.data() as any), submittedAt: d.get('submittedAt')?.toDate?.() })) as any[]

    // Aggregate last 7 days accuracy and daily counts
    const byDay: Record<string, { total: number; correct: number }> = {}
    let total = 0, correct = 0
    const today = new Date()
    const start = new Date(today); start.setDate(start.getDate() - 6)

    for (const r of rows) {
      const ts: Date | undefined = r.submittedAt
      const d = ts ? new Date(ts) : null
      if (!d) continue
      if (d < start) continue
      const key = d.toISOString().slice(0, 10)
      byDay[key] = byDay[key] || { total: 0, correct: 0 }
      byDay[key].total += 1
      total += 1
      if (r.isCorrect) { byDay[key].correct += 1; correct += 1 }
    }

    const heat: Array<{ date: string; value: number }> = []
    for (let i=6;i>=0;i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0,10)
      const rec = byDay[key] || { total: 0, correct: 0 }
      heat.push({ date: key, value: rec.total })
    }

    const acc = total > 0 ? correct/total : 0
    return NextResponse.json({
      summary: { mins: Math.min(120, total*2), acc, flow: Math.round(acc*100) },
      heatmap: heat,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    // Safe mock on any error
    return NextResponse.json({
      summary: { mins: 0, acc: 0.0, flow: 0 },
      heatmap: [],
    }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
