import { getRoom, addStroke, setBoard, startLiveStroke, appendLivePoints, endLiveStroke } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({} as any))
  const action = body?.action as string

  if (action === 'add_stroke') {
    const stroke = body?.stroke
    if (!stroke || !Array.isArray(stroke?.points)) return new Response(null, { status: 400 })
    addStroke(id, stroke)
    return new Response(null, { status: 204 })
  }

  if (action === 'set_board') {
    const board = body?.board
    const baseRev = Number(body?.baseRev ?? -1)
    const clientId = String(body?.clientId || '')
    if (!board || typeof board !== 'object') return new Response(null, { status: 400 })
    const room = getRoom(id)!
    const currRev = room.board?.rev ?? 0
    if (baseRev >= 0 && clientId && currRev > baseRev && clientId !== (room.boardLastClientId || '')) {
      return new Response(null, { status: 409 })
    }
    setBoard(id, { ...(board as any), clientId })
    return new Response(JSON.stringify({ rev: (getRoom(id)?.board?.rev ?? 0) }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  if (action === 'clear') {
    setBoard(id, { strokes: [], shapes: [], texts: [], notes: [] })
    return new Response(null, { status: 204 })
  }

  if (action === 'start_live') {
    const strokeId = String(body?.strokeId || '')
    const clientId = String(body?.clientId || '')
    const color = String(body?.color || '#111827')
    const size = Number(body?.size ?? 2)
    if (!strokeId || !clientId) return new Response(null, { status: 400 })
    startLiveStroke(id, strokeId, clientId, color, size)
    return new Response(null, { status: 204 })
  }
  if (action === 'live_points') {
    const strokeId = String(body?.strokeId || '')
    const points = Array.isArray(body?.points) ? body.points : []
    if (!strokeId || points.length === 0) return new Response(null, { status: 400 })
    appendLivePoints(id, strokeId, points)
    return new Response(null, { status: 204 })
  }
  if (action === 'end_live') {
    const strokeId = String(body?.strokeId || '')
    if (!strokeId) return new Response(null, { status: 400 })
    endLiveStroke(id, strokeId)
    return new Response(JSON.stringify({ rev: (getRoom(id)?.board?.rev ?? 0) }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  return new Response(null, { status: 400 })
}
