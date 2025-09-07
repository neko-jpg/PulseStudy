import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ items: [ { id: 'c1', name: '高1 数学A' }, { id: 'c2', name: '高1 英語' } ] })
}

