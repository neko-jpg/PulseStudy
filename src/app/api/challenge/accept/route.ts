import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { challengeId } = body;

  if (!challengeId) {
    return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
  }

  // Simulate database operation
  console.log(`Mock API: User accepted challenge ${challengeId}`);
  await new Promise(resolve => setTimeout(resolve, 250));

  return new NextResponse(null, { status: 204 });
}
