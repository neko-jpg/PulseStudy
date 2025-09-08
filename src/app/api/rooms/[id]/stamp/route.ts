import { addStampForUser, getRoom } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const type = body?.type as 'like' | 'ask' | 'idea'
  const userId = body?.userId as string | undefined
  if (!type || !userId) return new Response(null, { status: 400 })
  const res = addStampForUser(id, userId, type)
  return new Response(null, { status: res.code })
}
