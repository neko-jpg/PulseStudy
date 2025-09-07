import { NextRequest, NextResponse } from 'next/server'
import { getPersonalizedFeedback } from '@/ai/flows/personalized-feedback-on-mistakes'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, userAnswer, subject = '学習', difficulty = 'medium', hintsUsed = 0 } = body || {}
    if (!question || !userAnswer) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }
    const out = await getPersonalizedFeedback({ question, userAnswer, subject, difficulty, hintsUsed })
    return NextResponse.json({ feedback: out.feedback })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

