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
    const useMock = process.env.NEXT_PUBLIC_DEMO === '1' || process.env.NEXT_PUBLIC_USE_MOCK_AI === '1' || !process.env.GOOGLE_API_KEY;
    if (useMock) {
      const schedule = {
        scheduledQuestions: [
          { subject: 'math-quad-1', question: '二次関数の頂点の求め方は？', answer: '平方完成または頂点公式で求める。' },
          { subject: 'math-quad-1', question: '軸と切片の関係を説明して。', answer: 'y=ax^2+bx+c の軸は x=-b/2a、切片は c。' },
          { subject: 'eng-gram-1', question: '不定詞の3用法は？', answer: '名詞用法・形容詞用法・副詞用法。' },
        ],
      };
      return NextResponse.json(schedule, { headers: { 'Cache-Control': 'no-store' } });
    }

    const schedule = await getReviewScheduleForUser(userId);
    return NextResponse.json(schedule, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error getting review schedule:', error);
    // Fallback mock on error as well
    const schedule = {
      scheduledQuestions: [
        { subject: 'math-quad-1', question: '平方完成の手順を説明して。', answer: 'x^2+bx を (x+b/2)^2 - (b/2)^2 に変形する。' },
      ],
    };
    return NextResponse.json(schedule, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
