import { NextResponse } from 'next/server'
import { addInviteToken } from '../../../rooms/state'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = Math.random().toString(36).slice(2, 10)
  const code = ('' + Math.floor(100000 + Math.random() * 900000))
  const ttlMs = 30 * 60 * 1000 // 30 minutes
  addInviteToken(id, token, Date.now() + ttlMs)
  const origin = process.env.NEXT_PUBLIC_SITE_URL || ''
  const url = `${origin || ''}/collab/room/${id}?t=${token}`
  return NextResponse.json({ url, code, token })
}
