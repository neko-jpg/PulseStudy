import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').toLowerCase()
  // Mock search: return a couple items if q present
  const items = q
    ? [
        { id: 'room-demo', name: 'デモルーム', host: 'Host A', headcount: 1 },
        { id: 'room-study', name: '自習室', host: 'Host B', headcount: 2 },
      ]
    : []
  return NextResponse.json({ items })
}

