import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ logs: [
    { date: '2025-09-06', mins: 20, acc: 0.6, flow: 55 },
    { date: '2025-09-07', mins: 22, acc: 0.75, flow: 68 },
  ] })
}

