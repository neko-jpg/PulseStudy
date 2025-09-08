import { getRoom } from '../../../rooms/state'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  const body = await _req.json().catch(() => ({} as any))
  const text = typeof body?.text === 'string' ? body.text : ''
  const authorId = typeof body?.authorId === 'string' ? body.authorId : undefined
  ;(room as any).takeaways = Array.isArray((room as any).takeaways) ? (room as any).takeaways : []
  if (text) (room as any).takeaways.push({ ts: Date.now(), text, authorId })
  return new Response(null, { status: 204 })
}
