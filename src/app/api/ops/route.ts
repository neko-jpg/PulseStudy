import { NextResponse } from 'next/server'
import { recentLogs } from '@/lib/server-logger'
import { getRoom } from '../rooms/state'

declare global {
  // eslint-disable-next-line no-var
  var __sseConns: Map<string, number> | undefined
}

export const runtime = 'nodejs'

export async function GET() {
  // Summarize rooms
  try {
    // Without a list API, return minimal metrics we can derive
    const logs = recentLogs(200)
    const sse = (globalThis.__sseConns && Array.from(globalThis.__sseConns.entries())) || []
    const sseConnections = sse.reduce((a, [, n]) => a + (n || 0), 0)
    return NextResponse.json({ ok: true, logs, metrics: { sseConnections, roomsWithSse: sse.length } })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 })
  }
}
