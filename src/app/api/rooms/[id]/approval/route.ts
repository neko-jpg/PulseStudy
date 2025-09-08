import { approveJoin, denyJoin, getRoom } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const action = body?.action as 'approve'|'deny'
  const userId = body?.userId as string | undefined
  if (!action || !userId) return new Response(null, { status: 400 })
  if (action === 'approve') approveJoin(id, userId)
  if (action === 'deny') denyJoin(id, userId)
  return new Response(null, { status: 204 })
}

