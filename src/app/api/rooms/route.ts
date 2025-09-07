import { NextResponse } from 'next/server'
import { createRoom } from './state'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const topic = body?.topic as string | undefined
  const room = createRoom(topic)
  return NextResponse.json({ id: room.id })
}

