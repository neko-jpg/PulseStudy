import type {
  RoomSession,
  BoardState,
  BoardStroke,
  StampType,
  LiveBoard,
  LiveStroke,
  BoardPoint,
} from '@/lib/types';

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

export function seedRoom(id: string): RoomSession {
  return {
    id,
    name: '公開デモルーム',
    description: '誰でも入室できます',
    topic: 'コラボ学習ルーム',
    members: [{ id: 'user1', name: 'Alice' }],
    stamps: { like: 0, ask: 0, idea: 0 },
    pendingJoins: [],
    hostId: 'user1',
    board: { strokes: [], shapes: [], texts: [], notes: [], rev: 0 },
    live: { strokes: {}, cursors: {} },
    privacy: 'open',
    isPublic: true,
  };
}

export function getRoom(id: string): RoomSession | undefined {
  const store = ensureStore();
  if (!store.has(id)) {
    // Avoid overwriting if another concurrent call seeded meanwhile
    store.set(id, store.get(id) ?? seedRoom(id));
  }
  return store.get(id);
}

export function listRooms(): RoomSession[] {
  const store = ensureStore();
  return Array.from(store.values());
}

export function createRoomEphemeral(input: { name?: string; description?: string; isPublic?: boolean }): { id: string } {
  const id = `r-${Math.random().toString(36).slice(2, 8)}`
  const room = seedRoom(id)
  if (input?.name) room.name = input.name
  if (input?.description) room.description = input.description
  room.isPublic = input?.isPublic ?? true
  room.topic = room.name || room.topic
  const store = ensureStore()
  store.set(id, room)
  return { id }
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

// Board operations
export function addStroke(id: string, stroke: BoardStroke) {
  const room = getRoom(id);
  if (!room) return;
  const b = room.board || { strokes: [], shapes: [], texts: [], notes: [], rev: 0 };
  b.strokes = [...(b.strokes || []), stroke];
  b.rev = (b.rev || 0) + 1;
  room.board = b;
}

export function setBoard(id: string, board: Partial<BoardState> & { clientId?: string }) {
  const room = getRoom(id);
  if (!room) return;
  const prev = room.board || { strokes: [], shapes: [], texts: [], notes: [], rev: 0 };
  const next: BoardState = {
    strokes: board.strokes ?? prev.strokes ?? [],
    shapes: board.shapes ?? prev.shapes ?? [],
    texts: board.texts ?? prev.texts ?? [],
    notes: board.notes ?? prev.notes ?? [],
    rev: (prev.rev ?? 0) + 1,
  };
  room.board = next;
  room.boardLastClientId = board.clientId || room.boardLastClientId;
}

export function startLiveStroke(id: string, stroke: { strokeId: string; clientId: string; color: string; size: number }) {
  const room = getRoom(id);
  if (!room) return;
  if (!room.live) room.live = { strokes: {}, cursors: {} } as LiveBoard;
  const s: LiveStroke = {
    id: stroke.strokeId,
    clientId: stroke.clientId,
    color: stroke.color,
    size: stroke.size,
    points: [],
    updatedAt: Date.now(),
  };
  room.live.strokes[stroke.strokeId] = s;
}

export function appendLivePoints(id: string, data: { strokeId: string; points: BoardPoint[] }) {
  const room = getRoom(id);
  if (!room?.live?.strokes[data.strokeId]) return;
  const s = room.live.strokes[data.strokeId];
  s.points.push(...data.points);
  s.updatedAt = Date.now();
}

export function endLiveStroke(id: string, strokeId: string) {
  const room = getRoom(id);
  if (!room?.live?.strokes[strokeId]) return;
  const s = room.live.strokes[strokeId];
  addStroke(id, { color: s.color, size: s.size, points: s.points });
  delete room.live!.strokes[strokeId];
}

export function setCursor(id: string, data: { clientId: string; x: number; y: number; color: string }) {
  const room = getRoom(id);
  if (!room) return;
  if (!room.live) room.live = { strokes: {}, cursors: {} } as LiveBoard;
  if (!room.live.cursors) room.live.cursors = {};
  room.live.cursors[data.clientId] = { x: data.x, y: data.y, color: data.color, updatedAt: Date.now() };
}

export function requestControl(_id: string, _userId: string) {}
export function approveControl(_id: string, _userId: string) {}

export function addInviteToken(id: string): string {
  const room = getRoom(id);
  if (!room) return 'token';
  const tok = Math.random().toString(36).slice(2, 10);
  const rec = { token: tok, exp: Date.now() + 60 * 60 * 1000 };
  room.inviteTokens = [...(room.inviteTokens || []), rec];
  return tok;
}

export function validateToken(id: string, token: string): boolean {
  const room = getRoom(id);
  if (!room?.inviteTokens) return true; // be permissive for hackathon
  const now = Date.now();
  return !!room.inviteTokens.find((t) => t.token === token && t.exp > now);
}

export function joinRoom(id: string, user: { name: string }): { me: { id: string; name: string } } | null {
  const room = getRoom(id);
  if (!room) return null;
  const me = { id: `u-${Math.random().toString(36).slice(2, 8)}`, name: user.name };
  room.members.push(me);
  if (!room.solverId) room.solverId = me.id;
  return { me };
}

export function leaveRoom(id: string, userId?: string) {
  const room = getRoom(id);
  if (!room || !userId) return;
  room.members = room.members.filter((m) => m.id !== userId);
  if (room.solverId === userId) room.solverId = room.members[0]?.id;
}

export function setPrivacy(id: string, privacy: 'open' | 'approval') {
  const room = getRoom(id);
  if (!room) return;
  room.privacy = privacy;
}

export function askQuiz(_id: string): any { return { q: 'mock question?', choices: ['a', 'b'] }; }
export function answerQuiz(_id: string, _choice: number): any { return { result: { correct: true } }; }

export function addStampForUser(id: string, type: StampType, userId: string) {
  const room = getRoom(id);
  if (!room) return;
  const now = Date.now();
  room.lastStampAt = room.lastStampAt || {};
  const last = room.lastStampAt[userId] || 0;
  if (now - last < 1000) return; // throttle per-user
  room.lastStampAt[userId] = now;
  room.stamps[type] = (room.stamps[type] || 0) + 1;
}

// Peek without creating a new in-memory room (used by server handlers)
export function peekRoom(id: string): RoomSession | undefined {
  const store = (globalThis as any).__roomState as Map<string, RoomSession> | undefined
  return store?.get(id)
}
