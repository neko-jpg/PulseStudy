import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const quizSubmitSchema = z.object({
    moduleId: z.string(),
    idx: z.number(), // This is the question index within the module
    correct: z.boolean(),
});

export async function POST(req: Request) {
  // 1) Verify Firebase ID token or allow dev fallback
  let userId: string | null = null;
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    if (token) {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;
    } else if (process.env.NODE_ENV !== 'production') {
      // Dev-mode fallback for hackathon/testing
      userId = req.headers.get('x-dev-uid') || new URL(req.url).searchParams.get('devUid');
    }
  } catch (e) {
    console.error('verifyIdToken failed', e);
  }
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = quizSubmitSchema.parse(body);

    const attemptData = {
      moduleId: data.moduleId,
      questionId: `${data.moduleId}-${data.idx}`,
      isCorrect: data.correct,
      submittedAt: FieldValue.serverTimestamp(),
    };

    // Save to user-specific subcollection per new rules
    const adminDb = getAdminDb();
    await adminDb.collection(`users/${userId}/quiz_attempts`).add(attemptData);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
        return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    console.error("Error saving quiz attempt:", e);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
