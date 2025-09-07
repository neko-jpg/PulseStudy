import { NextResponse } from 'next/server'

export async function GET() {
  // Simple suggestion mock
  return NextResponse.json({ slot: '07:00-08:00', score: 0.82, reason: '朝の没入度が最も高い傾向です。通知をこの時間に最適化しましょう。' })
}

