import { getRoom, addStroke, setBoard, startLiveStroke, appendLivePoints, endLiveStroke, setCursor } from '../../../rooms/state'
import { log } from '@/lib/server-logger'
import { z } from 'zod'

const PointSchema = z.object({ x: z.number(), y: z.number() })
const StrokeSchema = z.object({ color: z.string(), size: z.number(), points: z.array(PointSchema) })
const ShapeSchema = z.object({ t: z.enum(['line','rect']), x: z.number(), y: z.number(), w: z.number(), h: z.number(), color: z.string(), size: z.number() })
const TextSchema = z.object({ x: z.number(), y: z.number(), text: z.string(), color: z.string(), size: z.number(), weight: z.enum(['normal','bold']) })
const NoteSchema = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number(), color: z.string(), text: z.string() })
const BoardSchema = z.object({
  strokes: z.array(StrokeSchema),
  shapes: z.array(ShapeSchema),
  texts: z.array(TextSchema),
  notes: z.array(NoteSchema),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = getRoom(id)
  if (!room) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({} as any))
  const action = body?.action as string

  // Lightweight in-memory rate limits for chatty actions
  type RateKey = string
  const now = Date.now()
  const RATE_MAP: any = (globalThis as any).__boardRateMap || ((globalThis as any).__boardRateMap = new Map<RateKey, number>())
  const tooSoon = (key: RateKey, ms: number) => { const last = RATE_MAP.get(key) || 0; if (now - last < ms) return true; RATE_MAP.set(key, now); return false }

  const clientId = typeof body?.clientId === 'string' ? body.clientId as string : (typeof body?.stroke?.clientId === 'string' ? body.stroke.clientId as string : '')
  const isPrivileged = !!clientId && (clientId === room.hostId || clientId === room.solverId)
  const boardLocked = !!room.boardLocked

  if (action === 'add_stroke') {
    if (boardLocked && !isPrivileged) return new Response(null, { status: 423 })
    const raw = body?.stroke ? { ...body.stroke } : undefined
    const parsed = StrokeSchema.safeParse(raw)
    if (!parsed.success) return new Response('Bad Request', { status: 400 })
    addStroke(id, parsed.data as any)
    log('board_add_stroke', 'info', { roomId: id, clientId })
    return new Response(null, { status: 204 })
  }

  if (action === 'set_board') {
    const baseRev = Number(body?.baseRev ?? -1)
    const clientId = String(body?.clientId || '')
    const parsed = BoardSchema.safeParse(body?.board)
    if (!parsed.success) return new Response('Bad Request', { status: 400 })
    if (boardLocked && !(clientId && (clientId === room.hostId || clientId === room.solverId))) return new Response(null, { status: 423 })
    const currRoom = getRoom(id)!
    const currRev = currRoom.board?.rev ?? 0
    if (baseRev >= 0 && clientId && currRev > baseRev && clientId !== (currRoom.boardLastClientId || '')) {
      return new Response(null, { status: 409 })
    }
    setBoard(id, { ...(parsed.data as any), clientId })
    log('board_set', 'info', { roomId: id, clientId, rev: (getRoom(id)?.board?.rev ?? 0) })
    return new Response(JSON.stringify({ rev: (getRoom(id)?.board?.rev ?? 0) }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  if (action === 'clear') {
    setBoard(id, { strokes: [], shapes: [], texts: [], notes: [], rev: 0 })
    return new Response(null, { status: 204 })
  }

  if (action === 'start_live') {
    const parsed = z.object({ strokeId: z.string().min(1), clientId: z.string().min(1), color: z.string(), size: z.number() }).safeParse(body)
    if (!parsed.success) return new Response('Bad Request', { status: 400 })
    if (boardLocked && !(parsed.data.clientId === room.hostId || parsed.data.clientId === room.solverId)) return new Response(null, { status: 423 })
    const { strokeId, clientId, color, size } = parsed.data
    startLiveStroke(id, { strokeId, clientId, color, size } as any)
    log('board_live_start', 'info', { roomId: id, clientId, strokeId })
    return new Response(null, { status: 204 })
  }
  if (action === 'live_points') {
    const parsed = z.object({ strokeId: z.string().min(1), points: z.array(PointSchema).min(1) }).safeParse(body)
    if (!parsed.success) return new Response('Bad Request', { status: 400 })
    // throttle per stroke to ~25ms granularity to reduce server load
    const key: RateKey = `${id}:live:${parsed.data.strokeId}`
    if (!tooSoon(key, 25)) appendLivePoints(id, { strokeId: parsed.data.strokeId, points: parsed.data.points } as any)
    return new Response(null, { status: 204 })
  }
  if (action === 'end_live') {
    const parsed = z.object({ strokeId: z.string().min(1) }).safeParse(body)
    if (!parsed.success) return new Response('Bad Request', { status: 400 })
    endLiveStroke(id, parsed.data.strokeId)
    log('board_live_end', 'info', { roomId: id, clientId, strokeId: parsed.data.strokeId, rev: (getRoom(id)?.board?.rev ?? 0) })
    return new Response(JSON.stringify({ rev: (getRoom(id)?.board?.rev ?? 0) }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  if (action === 'cursor') {
    const parsed = z.object({ clientId: z.string().min(1), x: z.number(), y: z.number(), color: z.string() }).safeParse(body)
    if (!parsed.success) return new Response('Bad Request', { status: 400 })
    const { clientId, x, y, color } = parsed.data
    // throttle cursor updates per client to ~60ms
    const key: RateKey = `${id}:cursor:${clientId}`
    if (!tooSoon(key, 60)) setCursor(id, clientId, x, y, color)
    return new Response(null, { status: 204 })
  }

  if (action === 'lock') {
    const parsed = z.object({ on: z.boolean(), clientId: z.string().min(1) }).safeParse(body)
    if (!parsed.success) return new Response('Bad Request', { status: 400 })
    const r2 = getRoom(id)!
    if (parsed.data.clientId !== r2.hostId) return new Response(null, { status: 403 })
    r2.boardLocked = parsed.data.on
    log('board_lock', 'info', { roomId: id, clientId: parsed.data.clientId, on: parsed.data.on })
    return new Response(JSON.stringify({ locked: !!r2.boardLocked }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  return new Response(null, { status: 400 })
}
