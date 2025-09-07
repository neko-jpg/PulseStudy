import { NextResponse } from 'next/server'
import { getItems } from './state'

export async function GET() {
  await new Promise((r) => setTimeout(r, 200))
  return NextResponse.json({ items: getItems() }, { headers: { 'Cache-Control': 'no-store' } })
}
