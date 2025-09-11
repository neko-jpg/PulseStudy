import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { auth } from 'firebase-admin';

// Note: In a real app, you'd get the user's UID from an auth session.
// For now, we'll require it in the request body.
// This should be replaced with actual authentication logic.
async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // Placeholder: Replace with your actual auth logic (e.g., parsing a JWT)
  const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];
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
    const q = collection(db, 'rooms'); // In a real app, you might query only public rooms
    const querySnapshot = await getDocs(q);
    const rooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/rooms
 * Creates a new room in Firestore.
 */
export async function POST(request: Request) {
  const createdBy = await getUserIdFromRequest(request);
  if (!createdBy) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    // Do not allow user to set createdBy
    const { createdBy: _, ...dataToParse } = json;
    const data = createRoomSchema.parse(dataToParse);

    const newRoomData = {
      ...data,
      createdBy, // Add the server-verified user ID
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      members: [createdBy], // Creator is the first member
    };

    const docRef = await addDoc(collection(db, 'rooms'), newRoomData);

    return NextResponse.json({ id: docRef.id, ...newRoomData }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error creating room:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
