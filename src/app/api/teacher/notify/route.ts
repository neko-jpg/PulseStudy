import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { classId = 'c1', assignmentId = 'a1' } = body || {}
  const url = `/notifications?tab=learning&class=${classId}&assignment=${assignmentId}`
  return NextResponse.json({ url })
}

