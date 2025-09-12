import { NextResponse } from 'next/server'
import type { ModuleDoc } from '@/lib/types'
import { quadBasic } from '@/lib/banks/quad-basic'
import { enIrregs } from '@/lib/banks/en-irregs'
import { toApiId } from '@/lib/modules'
import { generateQuizFlow } from '@/ai/flows/generate-quiz'

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

    let doc = BANKS[apiId] || quadBasic
    if (hasAiKey) {
      try {
        const topicMap: Record<string, { topic: string; subject?: string }> = {
          'quad-basic': { topic: '二次関数の基礎とグラフ', subject: '数学' },
          'en-irregs': { topic: '英語の不規則動詞の基礎', subject: '英語' },
        }
        const meta = topicMap[apiId] || { topic: uiId }
        const gen = await generateQuizFlow({ topic: meta.topic, id: apiId, subject: meta.subject })
        // Validate minimal shape
        if (gen?.items?.length >= 3) {
          doc = gen as any
        }
      } catch {
        // fall back to BANK below
      }
    }
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
