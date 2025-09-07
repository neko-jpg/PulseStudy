import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const date = q.get('date')
  if (date) {
    return NextResponse.json({
      logs: [
        { time: '07:10', moduleId: 'quad-basic', mins: 10, acc: 0.8, flow: 65 },
        { time: '20:30', moduleId: 'en-irregs', mins: 12, acc: 0.6, flow: 58 },
      ],
    }, { headers: { 'Cache-Control': 'no-store' } })
  }
  const today = new Date()
  const heat = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - 27 + i)
    return { date: d.toISOString().slice(0, 10), value: Math.floor(Math.random() * 100) }
  })
  return NextResponse.json({
    summary: { mins: 38, acc: 0.78, flow: 62 },
    heatmap: heat,
    trends: heat.map(h => ({ date: h.date, mins: Math.floor(h.value / 6), acc: 0.6 + Math.random() * 0.3, flow: h.value })),
    top3: ['quad-basic', 'en-irregs', 'm202'],
  }, { headers: { 'Cache-Control': 'no-store' } })
}

