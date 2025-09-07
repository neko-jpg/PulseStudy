import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    items: [
      { id: 'b1', name: '朝活スター', desc: '朝7時までに学習', earned: true, earnedAt: Date.now() - 3*24*3600e3 },
      { id: 'b2', name: 'ストリーク王', desc: '7日連続学習', earned: false },
      { id: 'b3', name: '集中マスター', desc: '没入度80%以上', earned: true, earnedAt: Date.now() - 10*24*3600e3 },
    ],
  }, { headers: { 'Cache-Control': 'no-store' } })
}

