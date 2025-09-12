import { NextResponse } from 'next/server'
import type { ModuleDoc } from '@/lib/types'
import { quadBasic } from '@/lib/banks/quad-basic'
import { enIrregs } from '@/lib/banks/en-irregs'
import { toApiId } from '@/lib/modules'

// BANK source as a safe fallback
const BANKS: Record<string, ModuleDoc> = {
  'quad-basic': quadBasic,
  'en-irregs': enIrregs,
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const uiId: string = body?.moduleId || 'math-quad-1'
    const apiId = toApiId(uiId)

    const hasAiKey = !!process.env.GOOGLE_API_KEY

    // For hackathon/demo reliability, use BANK always; if AI is wired,
    // we could branch here to generate items dynamically.
    const doc = BANKS[apiId] || quadBasic
    const out: ModuleDoc = {
      id: doc.id,
      title: doc.title,
      subject: doc.subject,
      explain: Array.isArray(doc.explain) ? doc.explain : [],
      items: Array.isArray(doc.items) ? doc.items.slice(0, 10) : [],
    }

    const headers = { 'Cache-Control': 'no-store' }
    // Optionally annotate the source for debugging
    return NextResponse.json({ source: hasAiKey ? 'ai' : 'bank', doc: out }, { headers })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

