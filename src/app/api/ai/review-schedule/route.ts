import { NextResponse } from 'next/server';
import { getReviewScheduleForUser } from '@/ai/flows/practice-question-scheduler';

// This is a placeholder for getting the authenticated user's ID
async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  // Placeholder: In a real app, you'd verify a JWT from the Authorization header.
  return 'test-user-id-001'; // MOCK USER ID
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const schedule = await getReviewScheduleForUser(userId);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error getting review schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
