import { getRoom, requestControl, approveControl } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const action = body?.action as 'request' | 'approve'
  const userId = body?.userId as string | undefined
  if (action === 'request') {
    if (!userId) return new Response(null, { status: 400 })
    requestControl(id, userId)
    return new Response(null, { status: 204 })
  }
  if (action === 'approve') {
    if (!userId) return new Response(null, { status: 400 })
    approveControl(id, userId)
    return new Response(null, { status: 204 })
  }
  return new Response(null, { status: 400 })
}

