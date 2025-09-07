import type { RoomSession, StampType } from '@/lib/types'

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
}

export function leaveRoom(id: string) {
  const room = getRoom(id)
  if (!room) return
  // no-op for MVP; could trim members
}

export function addStamp(id: string, type: StampType) {
  const room = getRoom(id)
  if (!room) return
  room.stamps[type]++
}

export function askQuiz(id: string) {
  const room = getRoom(id)
  if (!room) return
  const idx = (room.quiz?.idx ?? 0) + 1
  room.quiz = {
    idx,
    q: 'y=2x²-4x+1 の頂点は？',
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

