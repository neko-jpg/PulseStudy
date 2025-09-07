import { NextResponse } from 'next/server'
import { getUnreadCount } from '../state'

export async function GET() {
  return NextResponse.json({ unread: getUnreadCount() }, { headers: { 'Cache-Control': 'no-store' } })
}

