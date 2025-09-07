import { NextResponse } from 'next/server'
import { setRead, getItems } from '../state'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json()
    const unread = Boolean(body?.unread)
    const { id } = await params
    setRead(id, unread)
    return NextResponse.json({ ok: true, items: getItems() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
