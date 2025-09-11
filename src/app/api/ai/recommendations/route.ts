import { NextResponse } from 'next/server';
import { getPersonalizedLearningPathForUser } from '@/ai/flows/personalized-learning-paths';
import { z } from 'zod';

// A simple schema for the request body
const goalsSchema = z.object({
  goals: z.string().min(5, 'Goals must be at least 5 characters long.').optional().default('総合的な学力向上'),
});

// This is a placeholder for getting the authenticated user's ID
// In a real app, this would come from a verified session/token.
async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  // Placeholder: In a real app, you'd verify a JWT from the Authorization header.
  // For this hackathon, we'll use a mock user ID.
  // const userId = await verifyAuthToken(request);
  // return userId;
  return 'test-user-id-001'; // MOCK USER ID
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let goals = '総合的な学力向上';
    try {
      const json = await request.json();
      const parsed = goalsSchema.parse(json);
      goals = parsed.goals;
    } catch (e) {
      // Ignore body parsing errors and use default goals
    }

    const recommendation = await getPersonalizedLearningPathForUser(userId, goals);

    return NextResponse.json(recommendation);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error getting AI recommendation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
