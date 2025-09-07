import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    await req.json().catch(() => ({}))
    // ここでは受信をACKするだけ（MVP）。
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

