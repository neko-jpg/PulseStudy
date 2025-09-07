import { NextResponse } from 'next/server';

const getMockProgress = (challengeId: string) => {
    // This is mock data. In a real app, you'd query a database.
    const MOCK_FRIENDS = [
        { name: '健太', rank: 1, score: 1500 },
        { name: 'さくら', rank: 3, score: 1100 },
        { name: '涼太', rank: 5, score: 950 },
    ];

    return {
        rank: 2,
        you: {
            name: 'あなた',
            score: 1200,
        },
        friends: MOCK_FRIENDS,
    };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challengeId = searchParams.get('challengeId');

  if (!challengeId) {
    return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
  }

  await new Promise(resolve => setTimeout(resolve, 450));

  const progressData = getMockProgress(challengeId);

  return NextResponse.json(progressData);
}
