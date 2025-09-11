import { addStampForUser, getRoom } from '../../../rooms/state'
import { z } from 'zod'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const schema = z.object({ type: z.enum(['like','ask','idea']), userId: z.string().min(1).max(64) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })
  // light per-user throttle in addition to server-side cooldown
  type RateKey = string
  const now = Date.now()
  const RATE_MAP: any = (globalThis as any).__stampRateMap || ((globalThis as any).__stampRateMap = new Map<RateKey, number>())
  const key: RateKey = `${id}:${parsed.data.userId}:${parsed.data.type}`
  const last = RATE_MAP.get(key) || 0
  if (now - last < 200) return new Response(null, { status: 204 })
  RATE_MAP.set(key, now)
  addStampForUser(id, parsed.data.type, parsed.data.userId)
  return new Response(null, { status: 204 })
}
