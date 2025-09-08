import { NextResponse } from 'next/server'
import { getRoom, joinRoom, validateToken } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return NextResponse.json({ ok: false }, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const name = body?.name as string | undefined
  const code = body?.code as string | undefined
  const t = body?.t as string | undefined

  // Approval mode: if not invited via valid token/code, pend join
  const invited = !!code || validateToken(id, t)
  if (room.privacy === 'approval' && !invited) {
    const me = { id: `u-${Math.random().toString(36).slice(2, 6)}`, name: name || 'ゲスト' }
    room.pendingJoins = room.pendingJoins || []
    room.pendingJoins.push(me)
    return NextResponse.json({ pending: true, me }, { status: 202 })
  }
  const me = joinRoom(id, name)!
  const role = room.solverId === me.id ? 'solver' : 'viewer'
  return NextResponse.json({ role, me }, { status: 200 })
}
