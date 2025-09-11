import { NextRequest, NextResponse } from 'next/server'
import type { ModuleDoc } from '@/lib/types'
import { quadBasic } from '@/lib/banks/quad-basic'
import { enIrregs } from '@/lib/banks/en-irregs'

const BANKS: Record<string, ModuleDoc> = {
  'quad-basic': quadBasic,
  'en-irregs': enIrregs,
  // map learn-top style IDs to banks as a convenience
  'math-quad-1': quadBasic,
  'eng-infinitive-1': enIrregs,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const moduleId: string = body?.moduleId || 'quad-basic'
    const doc = BANKS[moduleId] || quadBasic
    const sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const summary = {
      title: doc.title,
      subject: doc.subject || '',
      points: doc.explain || [],
    }
    const questions = (doc.items || []).map((it, idx) => ({
      id: `${idx}`,
      text: it.q,
      choices: it.choices,
    }))

    return NextResponse.json({ sessionId, moduleId: doc.id, summary, questions })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

