import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const notificationId = params.id;

    if (!notificationId) {
        return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // In a real application, you would update the notification's 'unread' status in your database.
    console.log(`Mock API: Marking notification ${notificationId} as read.`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Return a 204 No Content response to indicate success without a body.
    return new NextResponse(null, { status: 204 });
}
