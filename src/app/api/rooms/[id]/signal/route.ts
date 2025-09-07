import { NextResponse } from 'next/server';

// This single endpoint mimics a websocket or other real-time messaging backend.
// It receives all signals/events for a given room.
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const roomId = params.id;
    const body = await request.json();
    const { type, ...payload } = body;

    if (!type) {
        return NextResponse.json({ error: 'Signal type is required' }, { status: 400 });
    }

    // In a real app, you'd broadcast this message to other clients in the room.
    console.log(`Mock API: Received signal in room ${roomId}`);
    console.log(`  - Type: ${type}`);
    console.log(`  - Payload:`, payload);

    // For certain types, we can return a specific response if needed,
    // but for most signaling, a simple success is enough.
    return NextResponse.json({ success: true, message: `Signal '${type}' received.` });
}
