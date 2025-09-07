import { NextResponse } from 'next/server'

export async function GET() {
  const today = new Date()
  const points = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - 6 + i)
    return { date: d.toISOString().slice(0, 10), acc: 60 + Math.round(Math.random() * 30), flow: 50 + Math.round(Math.random() * 40) }
  })
  const avgAcc = Math.round(points.reduce((a, p) => a + p.acc, 0) / points.length)
  const avgFlow = Math.round(points.reduce((a, p) => a + p.flow, 0) / points.length)
  return NextResponse.json({ points, avg: { acc: avgAcc, flow: avgFlow } })
}

