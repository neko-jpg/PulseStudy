import { NextResponse } from 'next/server'
import { getRoom } from '../../../rooms/state'
import { z } from 'zod'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ userId: z.string().min(1), text: z.string().min(1).max(1000) }).safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })
  room.messages = room.messages || []
  room.messages.push({ id: `m-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, userId: parsed.data.userId, text: parsed.data.text, ts: Date.now() })
  if (room.messages.length > 500) room.messages.splice(0, room.messages.length - 500)
  return NextResponse.json({ ok: true })
}

