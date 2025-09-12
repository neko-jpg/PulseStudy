import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc, serverTimestamp, query as fsQuery, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { listRooms, createRoomEphemeral } from './state';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Note: In a real app, you'd get the user's UID from an auth session.
// For now, we'll require it in the request body.
// This should be replaced with actual authentication logic.
async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // Dev fallback: allow UID via header/query when not in production
  try {
    const url = new URL(request.url);
    const devUid = request.headers.get('x-dev-uid') || url.searchParams.get('devUid');
    if (process.env.NODE_ENV !== 'production' && devUid) return devUid;
  } catch {}

  // Placeholder: Replace with your actual auth logic (e.g., parsing a JWT)
  const authHeader = request.headers.get('Authorization');
  const authToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;
  if (!authToken) return null;

  try {
    // This is a placeholder for server-side token verification
    // In a real scenario, you would use Firebase Admin SDK
    // const decodedToken = await auth().verifyIdToken(authToken);
    // return decodedToken.uid;
    return "mock-user-id"; // Replace with real UID from token
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}


const createRoomSchema = z.object({
  name: z.string().min(3, 'Room name must be at least 3 characters long.').max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  // createdBy should be handled by the server from the user's session
});

/**
 * GET /api/rooms
 * Fetches all public rooms from Firestore.
 */
export async function GET() {
  try {
    const useMem = !db || process.env.DEMO_MODE === '1'
    if (useMem) {
      // Optionally ensure a demo room exists
      if (process.env.DEMO_MODE === '1') {
        const { getRoom } = await import('./state')
        // create a stable demo room id
        getRoom('public-demo')
      }
      const rooms = listRooms().filter(r => r.isPublic !== false).map(r => ({
        id: r.id,
        name: r.name || r.topic || 'ルーム',
        description: r.description || '',
        members: r.members?.map(m => m.id) || [],
        isPublic: r.isPublic !== false,
      }))
      return NextResponse.json(rooms, { headers: { 'Cache-Control': 'no-store' } })
    }
    // Prefer server (admin) for reliable filtering and to avoid rules pitfalls
    try {
      const adb = getAdminDb()
      const snap = await adb.collection('rooms').where('isPublic', '==', true).get()
      const rooms = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      return NextResponse.json(rooms, { headers: { 'Cache-Control': 'no-store' } })
    } catch {
      // Fallback to client SDK with explicit isPublic filter (requires rules to allow read)
      const q = fsQuery(collection(db as any, 'rooms') as any, where('isPublic', '==', true) as any)
      const querySnapshot = await getDocs(q as any)
      const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))
      return NextResponse.json(rooms, { headers: { 'Cache-Control': 'no-store' } })
    }
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST /api/rooms
 * Creates a new room in Firestore.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}))
    const data = createRoomSchema.parse(json)
    const useMem = !db || process.env.DEMO_MODE === '1'
    if (useMem) {
      const { id } = createRoomEphemeral({ name: data.name, description: data.description, isPublic: data.isPublic })
      return NextResponse.json({ id, name: data.name, isPublic: data.isPublic }, { status: 201 })
    }
    // Prefer Admin SDK; on failure, fall back to in-memory room to keep UX unblocked
    try {
      const adb = getAdminDb()
      const newRoomData = {
        name: data.name,
        description: data.description || '',
        isPublic: data.isPublic,
        members: [] as string[],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }
      const docRef = await adb.collection('rooms').add(newRoomData)
      return NextResponse.json({ id: docRef.id, ...newRoomData }, { status: 201 })
    } catch (e) {
      // Admin init or write failed; create ephemeral room as a safe fallback
      const { id } = createRoomEphemeral({ name: data.name, description: data.description, isPublic: data.isPublic })
      return NextResponse.json({ id, name: data.name, isPublic: data.isPublic, source: 'ephemeral' }, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    console.error('Error creating room:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
