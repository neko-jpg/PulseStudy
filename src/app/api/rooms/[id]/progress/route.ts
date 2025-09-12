import { NextResponse } from 'next/server'
import { getRoom } from '../../../rooms/state'
import { z } from 'zod'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ moduleId: z.string().min(1), idx: z.number().int().min(0) }).safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })
  room.moduleId = parsed.data.moduleId
  room.qIdx = parsed.data.idx
  return NextResponse.json({ ok: true })
}

