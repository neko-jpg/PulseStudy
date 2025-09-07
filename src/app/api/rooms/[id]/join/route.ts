import { NextResponse } from 'next/server'
import { getRoom, joinRoom } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return NextResponse.json({ ok: false }, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const name = body?.name as string | undefined
  joinRoom(id, name)
  return new Response(null, { status: 204 })
}
