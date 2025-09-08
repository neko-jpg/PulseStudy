import { getRoom, setPrivacy } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const privacy = body?.privacy as 'open'|'approval'
  if (!privacy) return new Response(null, { status: 400 })
  if (!getRoom(id)) return new Response(null, { status: 404 })
  setPrivacy(id, privacy)
  return new Response(null, { status: 204 })
}

