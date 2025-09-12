import { NextResponse } from 'next/server'
import { quadBasic } from '@/lib/banks/quad-basic'
import { enIrregs } from '@/lib/banks/en-irregs'
import { toApiId } from '@/lib/modules'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await new Promise((r) => setTimeout(r, 200))
  const { id } = await params
  const apiId = toApiId(id)
  const doc = apiId === 'en-irregs' ? enIrregs : quadBasic
  return NextResponse.json(doc, { headers: { 'Cache-Control': 'no-store' } })
}
