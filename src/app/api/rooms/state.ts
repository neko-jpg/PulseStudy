import type { RoomMember, RoomSession, StampType } from '@/lib/types'

declare global {
  // eslint-disable-next-line no-var
  var __rooms: Map<string, RoomSession> | undefined
}

function ensure(): Map<string, RoomSession> {
  if (!globalThis.__rooms) globalThis.__rooms = new Map()
  return globalThis.__rooms
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
  }
  ensure().set(id, room)
  return room
}

export function getRoom(id: string): RoomSession | undefined {
  return ensure().get(id)
}

export function joinRoom(id: string, name?: string) {
  const room = getRoom(id)
  if (!room) return
  const member = { id: `u-${Math.random().toString(36).slice(2, 6)}`, name: name || 'ゲスト' }
  room.members.push(member)
  if (!room.hostId) room.hostId = member.id
  return member
}

export function leaveRoom(id: string) {
  const room = getRoom(id)
  if (!room) return
  // MVP: no-op. Could trim members by ID later.
}

export function addStampForUser(id: string, userId: string, type: StampType): { ok: boolean; code: number } {
  const room = getRoom(id)
  if (!room) return { ok: false, code: 404 }
  // must be member
  if (!room.members.find((m) => m.id === userId)) return { ok: false, code: 403 }
  // viewer only: solver cannot stamp
  if (room.solverId && room.solverId === userId) return { ok: false, code: 403 }
  // cooldown 500ms per user
  const now = Date.now()
  const last = room.lastStampAt?.[userId] || 0
  if (now - last < 500) return { ok: false, code: 429 }
  room.lastStampAt = room.lastStampAt || {}
  room.lastStampAt[userId] = now
  room.stamps[type]++
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
}

export function answerQuiz(id: string, choice: number) {
  const room = getRoom(id)
  if (!room || !room.quiz) return { correct: false }
  const correct = choice === 0
  room.quiz = { ...room.quiz, result: { correct } }
  return { correct }
}

// Privacy / Invite tokens
export function setPrivacy(id: string, privacy: 'open'|'approval') {
  const room = getRoom(id)
  if (!room) return
  room.privacy = privacy
}

export function addInviteToken(id: string, token: string, exp: number) {
  const room = getRoom(id)
  if (!room) return
  room.inviteTokens = room.inviteTokens || []
  room.inviteTokens.push({ token, exp })
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
}

export function approveControl(id: string, userId: string) {
  const room = getRoom(id)
  if (!room) return
  room.solverId = userId
  room.pendingControlRequests = (room.pendingControlRequests || []).filter((x) => x !== userId)
}

// Join approvals
export function approveJoin(id: string, userId: string) {
  const room = getRoom(id)
  if (!room) return
  room.pendingJoins = room.pendingJoins || []
  const idx = room.pendingJoins.findIndex((m) => m.id === userId)
  if (idx >= 0) {
    const m = room.pendingJoins.splice(idx, 1)[0]
    // add to members if not already
    if (!room.members.find((mm) => mm.id === m.id)) room.members.push(m)
    if (!room.hostId) room.hostId = m.id
  }
}

export function denyJoin(id: string, userId: string) {
  const room = getRoom(id)
  if (!room) return
  room.pendingJoins = (room.pendingJoins || []).filter((m) => m.id !== userId)
}
