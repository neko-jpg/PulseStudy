import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const handle = url.searchParams.get('handle') || '@neko_jpg'
  const token = url.searchParams.get('t')

  // Respect privacy mode from own profile API
  try {
    const meRes = await fetch(new URL('/api/profile', url), { cache: 'no-store' })
    if (meRes.ok) {
      const me = await meRes.json()
      const mode = me?.privacy?.mode || 'private'
      if (mode === 'private') {
        return NextResponse.json({ error: 'not_public' }, { status: 404 })
      }
      if (mode === 'link' && !token) {
        return NextResponse.json({ error: 'token_required' }, { status: 403 })
      }
    }
  } catch {}

  return NextResponse.json({
    user: { name: 'Teppei', handle },
    summary: { mins: 124, acc: 0.74, streak: 7, badges: 2 },
    badges: [
      { id: 'b1', name: '朝活スター' },
      { id: 'b3', name: '勉強マスター' },
    ],
  }, { headers: { 'Cache-Control': 'no-store' } })
}

