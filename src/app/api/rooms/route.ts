import { NextResponse } from 'next/server';

export async function POST() {
  // In a real app, you'd create a new room in the database
  // and maybe use a more robust ID generation scheme.
  const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json({ roomId: newRoomId });
}
