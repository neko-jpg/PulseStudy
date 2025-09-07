import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ shareUrl: 'https://pulse.local/share/abc123' })
}

