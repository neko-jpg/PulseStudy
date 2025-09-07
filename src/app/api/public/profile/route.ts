import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const handle = url.searchParams.get('handle') || '@neko_jpg'
  // In a real app, respect privacy. Here we always return a public-friendly payload.
  return NextResponse.json({
    user: { name: 'Teppei', handle },
    summary: { mins: 124, acc: 0.74, streak: 7, badges: 2 },
    badges: [
      { id: 'b1', name: '朝活スター' },
      { id: 'b3', name: '集中マスター' },
    ],
  }, { headers: { 'Cache-Control': 'no-store' } })
}

