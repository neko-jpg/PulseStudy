import type {
  BoardState,
  LiveBoard,
  LiveStroke,
  RoomMember,
  RoomSession,
  StampType,
} from '@/lib/types'
import { promises as fs } from 'fs'
import path from 'path'

declare global {
  // eslint-disable-next-line no-var
  var __rooms: Map<string, RoomSession> | undefined
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'rooms.json')
let persistTimer: any = null

function ensure(): Map<string, RoomSession> {
  if (!globalThis.__rooms) {
    globalThis.__rooms = new Map()
    try { void loadPersisted() } catch {}
  }
  return globalThis.__rooms
}

async function loadPersisted() {
  try {
    const txt = await fs.readFile(DATA_FILE, 'utf-8')
    const raw = JSON.parse(txt) as Record<string, RoomSession>
    const map = ensure()
    for (const id of Object.keys(raw || {})) map.set(id, raw[id])
  } catch {}
}

function schedulePersist() {
  if (persistTimer) return
  persistTimer = setTimeout(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true })
      const obj: Record<string, RoomSession> = {}
      for (const [k, v] of ensure().entries()) obj[k] = v
      await fs.writeFile(DATA_FILE, JSON.stringify(obj), 'utf-8')
    } catch {}
    finally { persistTimer = null }
  }, 500)
}

export function createRoom(topic?: string): RoomSession {
  const id = `room-${Math.random().toString(36).slice(2, 8)}`
  const room: RoomSession = {
    id,
    topic,
    members: [],
    stamps: { like: 0, ask: 0, idea: 0 },
    privacy: 'open',
    pendingControlRequests: [],
    pendingJoins: [],
    inviteTokens: [],
    lastStampAt: {},
    board: { strokes: [], shapes: [], texts: [], notes: [], rev: 0 },
    boardLastClientId: undefined,
    live: { strokes: {} },
  }
  ensure().set(id, room)
  schedulePersist()
  return room
}

export function getRoom(id: string): RoomSession | undefined {
  return ensure().get(id)
}

export function joinRoom(id: string, name?: string) {
  const room = getRoom(id)
  if (!room) return
  const member: RoomMember = { id: `u-${Math.random().toString(36).slice(2, 6)}`, name: name || 'ゲスト' }
  room.members.push(member)
  if (!room.hostId) room.hostId = member.id
  schedulePersist()
  return member
}

export function leaveRoom(id: string) {
  const room = getRoom(id)
  if (!room) return
  // MVP: no-op for now
  schedulePersist()
}

export function addStampForUser(id: string, userId: string, type: StampType): { ok: boolean; code: number } {
  const room = getRoom(id)
  if (!room) return { ok: false, code: 404 }
  if (!room.members.find((m) => m.id === userId)) return { ok: false, code: 403 }
  if (room.solverId && room.solverId === userId) return { ok: false, code: 403 }
  const now = Date.now()
  const last = room.lastStampAt?.[userId] || 0
  if (now - last < 500) return { ok: false, code: 429 }
  room.lastStampAt = room.lastStampAt || {}
  room.lastStampAt[userId] = now
  room.stamps[type]++
  schedulePersist()
  return { ok: true, code: 204 }
}

export function askQuiz(id: string) {
  const room = getRoom(id)
  if (!room) return
  const idx = (room.quiz?.idx ?? 0) + 1
  room.quiz = {
    idx,
    q: 'What is the vertex of y = 2x^2 - 4x + 1?',
    choices: ['(1,-1)', '(2,1)', '(1,2)', '(-1,2)'],
  }
  schedulePersist()
}

export function answerQuiz(id: string, choice: number) {
  const room = getRoom(id)
  if (!room || !room.quiz) return { correct: false }
  const correct = choice === 0
  room.quiz = { ...room.quiz, result: { correct } }
  schedulePersist()
  return { correct }
}

// Privacy / Invite tokens
export function setPrivacy(id: string, privacy: 'open'|'approval') {
  const room = getRoom(id)
  if (!room) return
  room.privacy = privacy
  schedulePersist()
}

export function addInviteToken(id: string, token: string, exp: number) {
  const room = getRoom(id)
  if (!room) return
  room.inviteTokens = room.inviteTokens || []
  room.inviteTokens.push({ token, exp })
  schedulePersist()
}

export function validateToken(id: string, token?: string | null) {
  if (!token) return false
  const room = getRoom(id)
  if (!room || !room.inviteTokens) return false
  const now = Date.now()
  const ok = room.inviteTokens.some((t) => t.token === token && t.exp > now)
  return ok
}

// Control flow
export function requestControl(id: string, userId: string) {
  const room = getRoom(id)
  if (!room) return
  const set = new Set(room.pendingControlRequests || [])
  set.add(userId)
  room.pendingControlRequests = Array.from(set)
  schedulePersist()
}

export function approveControl(id: string, userId: string) {
  const room = getRoom(id)
  if (!room) return
  room.solverId = userId
  room.pendingControlRequests = (room.pendingControlRequests || []).filter((x) => x !== userId)
  schedulePersist()
}

// Join approvals
export function approveJoin(id: string, userId: string) {
  const room = getRoom(id)
  if (!room) return
  room.pendingJoins = room.pendingJoins || []
  const idx = room.pendingJoins.findIndex((m) => m.id === userId)
  if (idx >= 0) {
    const m = room.pendingJoins.splice(idx, 1)[0]
    if (!room.members.find((mm) => mm.id === m.id)) room.members.push(m)
    if (!room.hostId) room.hostId = m.id
  }
  schedulePersist()
}

export function denyJoin(id: string, userId: string) {
  const room = getRoom(id)
  if (!room) return
  room.pendingJoins = (room.pendingJoins || []).filter((m) => m.id !== userId)
  schedulePersist()
}

// Whiteboard helpers
export function ensureBoard(id: string): BoardState | undefined {
  const room = getRoom(id)
  if (!room) return undefined
  if (!room.board) room.board = { strokes: [], shapes: [], texts: [], notes: [], rev: 0 }
  return room.board
}

export function addStroke(id: string, stroke: any) {
  const b = ensureBoard(id); if (!b) return
  try {
    const s = {
      color: typeof stroke?.color === 'string' ? stroke.color : '#111827',
      size: Number.isFinite(stroke?.size) ? stroke.size : 2,
      points: Array.isArray(stroke?.points) ? stroke.points.filter(Boolean) : [],
    }
    b.strokes.push(s as any)
    b.rev++
    const room = getRoom(id); if (room) room.boardLastClientId = (stroke as any)?.clientId || room.boardLastClientId
    schedulePersist()
  } catch {}
}

export function setBoard(id: string, board: Partial<BoardState> & { clientId?: string }) {
  const b = ensureBoard(id); if (!b) return
  if (Array.isArray(board.strokes)) b.strokes = board.strokes as any
  if (Array.isArray(board.shapes)) b.shapes = board.shapes as any
  if (Array.isArray(board.texts)) b.texts = board.texts as any
  if (Array.isArray(board.notes)) b.notes = board.notes as any
  b.rev++
  const room = getRoom(id); if (room) room.boardLastClientId = board.clientId || room.boardLastClientId
  schedulePersist()
}

// Live strokes (in-progress)
export function startLiveStroke(id: string, strokeId: string, clientId: string, color: string, size: number) {
  const room = getRoom(id); if (!room) return
  if (!room.live) room.live = { strokes: {} }
  const now = Date.now()
  room.live.strokes[strokeId] = { id: strokeId, clientId, color, size, points: [], updatedAt: now }
}
export function appendLivePoints(id: string, strokeId: string, points: { x:number; y:number }[]) {
  const room = getRoom(id); if (!room?.live?.strokes[strokeId]) return
  const s = room.live.strokes[strokeId]
  for (const p of points || []) { if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) s.points.push({ x:p.x, y:p.y }) }
  s.updatedAt = Date.now()
}
export function endLiveStroke(id: string, strokeId: string) {
  const room = getRoom(id); if (!room?.live?.strokes[strokeId]) return
  const s = room.live.strokes[strokeId]
  addStroke(id, { color: s.color, size: s.size, points: s.points, clientId: s.clientId })
  delete room.live!.strokes[strokeId]
}
