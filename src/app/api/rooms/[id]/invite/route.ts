import { NextResponse } from 'next/server'
import { addInviteToken } from '../../../rooms/state'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = addInviteToken(id)
  const code = '' + Math.floor(100000 + Math.random() * 900000)
  const origin = process.env.NEXT_PUBLIC_SITE_URL || ''
  const url = `${origin || ''}/collab/room/${id}?t=${token}`
  return NextResponse.json({ url, code, token })
}
