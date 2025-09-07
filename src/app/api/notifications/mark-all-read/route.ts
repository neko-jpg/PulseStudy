import { NextResponse } from 'next/server'
import { setAllRead, getItems } from '../state'

export async function POST() {
  setAllRead()
  return NextResponse.json({ ok: true, items: getItems() }, { headers: { 'Cache-Control': 'no-store' } })
}

