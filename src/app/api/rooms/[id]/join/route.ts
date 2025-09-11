import { NextResponse } from 'next/server'
import { getRoom, joinRoom, validateToken } from '../../../rooms/state'
import { z } from 'zod'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return NextResponse.json({ ok: false }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const schema = z.object({
    name: z.string().min(1).max(64).optional(),
    code: z.string().min(1).max(64).optional(),
    t: z.string().min(1).max(128).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })
  const { name, code, t } = parsed.data

  // Approval mode: if not invited via valid token/code, pend join
  const invited = !!code || (!!t && validateToken(id, t))
  if (room.privacy === 'approval' && !invited) {
    const me = { id: `u-${Math.random().toString(36).slice(2, 6)}`, name: name || 'ゲスト' }
    room.pendingJoins = room.pendingJoins || []
    room.pendingJoins.push(me)
    return NextResponse.json({ pending: true, me }, { status: 202 })
  }

  const { me } = joinRoom(id, { name: name || 'ゲスト' })!
  const role = room.solverId === me.id ? 'solver' : 'viewer'
  return NextResponse.json({ role, me }, { status: 200 })
}

