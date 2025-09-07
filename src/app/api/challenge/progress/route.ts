import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id') || 'd1'
  await new Promise((r) => setTimeout(r, 200))
  return NextResponse.json({
    id,
    rank: 5,
    you: 12,
    friends: [
      { name: '健太', value: 15 },
      { name: 'さくら', value: 10 },
      { name: '葵', value: 12 },
    ],
  })
}

