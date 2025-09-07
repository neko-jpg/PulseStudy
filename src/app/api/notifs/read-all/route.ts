import { NextResponse } from 'next/server';

export async function POST() {
    // In a real application, you would update all notifications for the user to 'unread: false'.
    console.log('Mock API: Marking all notifications as read.');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return a 204 No Content response to indicate success without a body.
    return new NextResponse(null, { status: 204 });
}
