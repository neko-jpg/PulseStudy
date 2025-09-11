import { NextResponse } from 'next/server'
import { createRoom } from './state'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    const roomsCollection = collection(db, 'rooms');
    const q = query(roomsCollection, where("privacy", "==", "open"));

    const querySnapshot = await getDocs(q);
    const rooms = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const topic = body?.topic as string | undefined
  const room = await createRoom(topic)
  return NextResponse.json({ id: room.id })
}
