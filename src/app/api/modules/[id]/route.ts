import { NextResponse } from 'next/server'
import { quadBasic } from '@/lib/banks/quad-basic'
import { enIrregs } from '@/lib/banks/en-irregs'

const map: Record<string, any> = {
  'quad-basic': quadBasic,
  'en-irregs': enIrregs,
  // Homeや通知の既存IDを学習モジュールにフォールバック
  'm101': quadBasic,
  'm201': enIrregs,
  'm202': quadBasic,
  'm203': enIrregs,
  'last': quadBasic,
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await new Promise((r) => setTimeout(r, 200))
  const { id } = await params
  const doc = map[id] ?? quadBasic
  return NextResponse.json(doc, { headers: { 'Cache-Control': 'no-store' } })
}
