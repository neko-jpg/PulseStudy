import type {
  BoardState,
  RoomMember,
  RoomSession,
  StampType,
} from '@/lib/types'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

/**
 * Creates a new room in Firestore.
 */
export async function createRoom(topic?: string): Promise<RoomSession> {
  const newRoomData = {
    topic: topic || 'New Room',
    members: [],
    stamps: { like: 0, ask: 0, idea: 0 },
    privacy: 'open' as 'open' | 'approval',
    pendingJoins: [],
    lastStrokeSeq: 0,
    createdAt: serverTimestamp(),
  }
  const docRef = await addDoc(collection(db, 'rooms'), newRoomData)
  // Reconstruct a full RoomSession object for API compatibility, even though
  // board and live data will be handled by subcollections on the client.
  return { id: docRef.id, ...newRoomData, board: { strokes: [], shapes: [], texts: [], notes: [], rev: 0 }, live: { strokes: {}, cursors: {} } } as RoomSession
}

/**
 * Fetches a room's main data from Firestore.
 */
export async function getRoom(id: string): Promise<RoomSession | undefined> {
  const roomDocRef = doc(db, 'rooms', id);
  const roomSnapshot = await getDoc(roomDocRef);
  if (!roomSnapshot.exists()) return undefined;
  const data = roomSnapshot.data();
  // Reconstruct a full RoomSession object for API compatibility
  return { id: roomSnapshot.id, ...data, board: { strokes: [], shapes: [], texts: [], notes: [], rev: 0 }, live: { strokes: {}, cursors: {} } } as RoomSession;
}

/**
 * Adds a member directly to a public room.
 */
export async function joinRoom(id: string, name?: string): Promise<RoomMember> {
  const roomRef = doc(db, 'rooms', id);
  const newMember: RoomMember = { id: `u-${Math.random().toString(36).slice(2, 8)}`, name: name || 'ゲスト' };
  const roomSnap = await getDoc(roomRef);
  const roomData = roomSnap.data();
  const payload: any = { members: arrayUnion(newMember) };
  if (!roomData?.hostId) {
    payload.hostId = newMember.id;
  }
  await updateDoc(roomRef, payload);
  return newMember;
}

/**
 * Adds a member to the pending list for private rooms.
 */
export async function requestToJoin(id:string, name?:string): Promise<RoomMember> {
    const roomRef = doc(db, 'rooms', id);
    const newMember: RoomMember = { id: `u-${Math.random().toString(36).slice(2, 8)}`, name: name || 'ゲスト' };
    await updateDoc(roomRef, { pendingJoins: arrayUnion(newMember) });
    return newMember;
}

/**
 * Approves a pending member, moving them to the members list.
 */
export async function approveJoin(id: string, userId: string) {
  const roomRef = doc(db, 'rooms', id);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const roomData = roomSnap.data();
  const pendingMember = (roomData.pendingJoins || []).find((m: RoomMember) => m.id === userId);
  if (pendingMember) {
    await updateDoc(roomRef, {
      members: arrayUnion(pendingMember),
      pendingJoins: arrayRemove(pendingMember)
    });
  }
}

/**
 * Denies a pending member, removing them from the pending list.
 */
export async function denyJoin(id: string, userId: string) {
  const roomRef = doc(db, 'rooms', id);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const roomData = roomSnap.data();
  const pendingMember = (roomData.pendingJoins || []).find((m: RoomMember) => m.id === userId);
  if (pendingMember) {
    await updateDoc(roomRef, { pendingJoins: arrayRemove(pendingMember) });
  }
}

/**
 * Sets the privacy level of a room.
 */
export async function setPrivacy(id: string, privacy: 'open'|'approval') {
  const roomRef = doc(db, 'rooms', id);
  await updateDoc(roomRef, { privacy });
}

// Note: The following functions are intentionally left as stubs or are no-ops,
// as the client-side will be responsible for direct interaction with Firestore subcollections
// for a truly real-time experience. These server-side stubs are for ensuring API routes
// that use them don't break, but they don't perform actions.

export function addStroke(id: string, stroke: any) {
  // No-op: Client writes directly to subcollection
}
export function addShape(id: string, shape: any) {
  // No-op: Client writes directly to subcollection
}
export function addText(id: string, text: any) {
  // No-op: Client writes directly to subcollection
}
export function addNote(id: string, note: any) {
  // No-op: Client writes directly to subcollection
}
export function setBoard(id: string, board: Partial<BoardState> & { clientId?: string }) {
  // No-op: Client writes directly to subcollection
}

// TODO: Implement other functions as needed for full functionality
// e.g., leaveRoom, addStampForUser, token validation, etc.
// These are less critical for the core whiteboard experience.
