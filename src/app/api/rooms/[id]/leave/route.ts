import { getRoom, leaveRoom } from '../../../rooms/state'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return new Response(null, { status: 404 })
  leaveRoom(id)
  return new Response(null, { status: 204 })
}
