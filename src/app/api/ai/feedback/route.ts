import { NextRequest, NextResponse } from 'next/server'
import { getPersonalizedFeedback } from '@/ai/flows/personalized-feedback-on-mistakes'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      question,
      userAnswer,
      subject = '一般',
      difficulty = 'medium',
      hintsUsed = 0,
    } = body || {}

    if (!question || !userAnswer) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }

    const useMock =
      process.env.AI_MODE === 'mock' ||
      process.env.NEXT_PUBLIC_USE_MOCK_AI === '1' ||
      (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY)

    if (useMock) {
      const feedback = `ポイント: ${subject}の要点をもう一度整理しましょう。間違えやすい箇所を短く確認してから再挑戦してみてください。`
      return NextResponse.json({ feedback })
    }

    const out = await getPersonalizedFeedback({ question, userAnswer, subject, difficulty, hintsUsed })
    return NextResponse.json({ feedback: out.feedback })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

