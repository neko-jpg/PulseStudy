import { addStamp, getRoom } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const type = body?.type as 'like' | 'ask' | 'idea'
  if (!type) return new Response(null, { status: 400 })
  addStamp(id, type)
  return new Response(null, { status: 204 })
}
