import { NextResponse } from 'next/server'
import { getRoom } from '../../../rooms/state'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  return NextResponse.json(room, { headers: { 'Cache-Control': 'no-store' } })
}
