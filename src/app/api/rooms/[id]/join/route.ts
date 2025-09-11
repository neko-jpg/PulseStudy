import { NextResponse } from 'next/server'
import { getRoom, joinRoom, requestToJoin } from '../../../rooms/state'
import { z } from 'zod'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const room = await getRoom(id);

  if (!room) {
    return NextResponse.json({ ok: false, message: 'Room not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const schema = z.object({
    name: z.string().min(1).max(64).optional(),
  });
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return new Response('Bad Request', { status: 400 });
  }
  const { name } = parsed.data;

  // This is a simplified logic. A full implementation would check invite tokens.
  if (room.privacy === 'approval') {
    const me = await requestToJoin(id, name);
    return NextResponse.json({ pending: true, me }, { status: 202 });
  }

  const me = await joinRoom(id, name);
  const role = room.hostId === me.id ? 'host' : 'viewer';
  return NextResponse.json({ role, me }, { status: 200 });
}
