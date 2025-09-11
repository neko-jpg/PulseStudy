import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

// This is a placeholder for getting the authenticated user's ID
// In a real app, this would come from a verified session/token.
async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  // Placeholder: In a real app, you'd verify a JWT from the Authorization header.
  return 'test-user-id-001'; // MOCK USER ID
}

const quizSubmitSchema = z.object({
    moduleId: z.string(),
    idx: z.number(), // This is the question index within the module
    correct: z.boolean(),
});

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = quizSubmitSchema.parse(body);

    const attemptData = {
        userId,
        moduleId: data.moduleId,
        questionId: `${data.moduleId}-${data.idx}`, // Create a unique question ID
        isCorrect: data.correct,
        submittedAt: serverTimestamp(),
    };

    // Save the quiz attempt to a new subcollection
    await addDoc(collection(db, 'quiz_attempts'), attemptData);

    // Also consider saving under a user-specific subcollection for easier querying
    // e.g., collection(db, `users/${userId}/quiz_attempts`)
    // For now, a root collection is simpler for this task.

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
        return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    console.error("Error saving quiz attempt:", e);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
