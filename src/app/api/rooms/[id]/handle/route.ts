import { getRoom } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return new Response(null, { status: 404 })
  // MVP: accept and no-op
  await req.json().catch(() => ({}))
  return new Response(null, { status: 204 })
}

