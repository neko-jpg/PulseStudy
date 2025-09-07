import { NextRequest, NextResponse } from 'next/server'
import { getPersonalizedFeedback } from '@/ai/flows/personalized-feedback-on-mistakes'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      question,
      userAnswer,
      subject = '学習',
      difficulty = 'medium',
      hintsUsed = 0,
    } = body || {}

    if (!question || !userAnswer) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }

    const useMock =
      process.env.AI_MODE === 'mock' ||
      process.env.NEXT_PUBLIC_USE_MOCK_AI === '1' ||
      (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY)

    if (useMock) {
      const feedback = `ヒント: ${subject} の考え方をもう一度整理しよう。間違えやすいポイントを軽く確認してから再挑戦してね。`
      return NextResponse.json({ feedback })
    }

    const out = await getPersonalizedFeedback({ question, userAnswer, subject, difficulty, hintsUsed })
    return NextResponse.json({ feedback: out.feedback })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

