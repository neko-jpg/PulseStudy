import { NextResponse } from 'next/server';
import { approveJoin, denyJoin, getRoom } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const room = await getRoom(id);
  if (!room) {
    return new Response(null, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body?.action as 'approve'|'deny';
  const userId = body?.userId as string | undefined;

  if (!action || !userId) {
    return new Response('Bad request: action and userId are required.', { status: 400 });
  }

  if (action === 'approve') {
    await approveJoin(id, userId);
  } else if (action === 'deny') {
    await denyJoin(id, userId);
  }

  return new Response(null, { status: 204 });
}
