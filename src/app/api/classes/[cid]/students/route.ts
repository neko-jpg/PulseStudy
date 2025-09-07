import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ items: [
    { id: 's1', name: '山田', mins: 42, acc: 0.72, flow: 63, progress: 80 },
    { id: 's2', name: '佐藤', mins: 28, acc: 0.55, flow: 48, progress: 40 },
  ] })
}

