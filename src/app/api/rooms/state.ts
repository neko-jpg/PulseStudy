import type { RoomSession, BoardState, BoardStroke, StampType } from '@/lib/types';

declare global {
  // eslint-disable-next-line no-var
  var __roomState: Map<string, RoomSession> | undefined;
}

function ensureStore(): Map<string, RoomSession> {
  if (!globalThis.__roomState) {
    globalThis.__roomState = new Map<string, RoomSession>();
  }
  return globalThis.__roomState;
}

function seedRoom(id: string): RoomSession {
    return {
        id,
        topic: 'Test Room',
        members: [{id: 'user1', name: 'Alice'}],
        stamps: { like: 0, ask: 0, idea: 0 },
        pendingJoins: [{id: 'user2', name: 'Bob'}],
        hostId: 'user1',
    };
}

export function getRoom(id: string): RoomSession | undefined {
  const store = ensureStore();
  if (!store.has(id)) {
      store.set(id, seedRoom(id));
  }
  return store.get(id);
}

export function approveJoin(roomId: string, userId: string): void {
  const room = getRoom(roomId);
  if (room && room.pendingJoins) {
    const user = room.pendingJoins.find(u => u.id === userId);
    if (user) {
      room.pendingJoins = room.pendingJoins.filter(u => u.id !== userId);
      room.members.push(user);
    }
  }
}

export function denyJoin(roomId: string, userId: string): void {
    const room = getRoom(roomId);
    if (room && room.pendingJoins) {
        room.pendingJoins = room.pendingJoins.filter(u => u.id !== userId);
    }
}

// Mock implementations for missing functions
export function addStroke(id: string, stroke: BoardStroke) {}
export function setBoard(id: string, board: BoardState) {}
export function startLiveStroke(id: string, stroke: any) {}
export function appendLivePoints(id: string, data: any) {}
export function endLiveStroke(id: string, data: any) {}
export function setCursor(id: string, data: any) {}
export function requestControl(id: string, userId: string) {}
export function approveControl(id: string, userId: string) {}
export function addInviteToken(id: string): string { return 'mock_token'; }
export function validateToken(id: string, token: string): boolean { return true; }
export function joinRoom(id: string, user: { name: string }): { me: any } { return { me: { id: 'mock_id' } }; }
export function leaveRoom(id: string, userId: string) {}
export function setPrivacy(id: string, privacy: 'open' | 'approval') {}
export function askQuiz(id: string): any { return { q: 'mock question?', choices: ['a', 'b'] }; }
export function answerQuiz(id: string, choice: number): any { return { result: { correct: true } }; }
export function addStampForUser(id: string, type: StampType, userId: string) {}
