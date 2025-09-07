import { NextResponse } from 'next/server'
import { answerQuiz, askQuiz, getRoom } from '../../../rooms/state'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const action = body?.action as 'ask' | 'answer'
  if (action === 'ask') {
    askQuiz(id)
    const room = getRoom(id)!
    return NextResponse.json({ q: room.quiz!.q, choices: room.quiz!.choices })
  } else if (action === 'answer') {
    const result = answerQuiz(id, Number(body?.choice ?? -1))
    return NextResponse.json({ result, answer: 0 })
  }
  return new Response(null, { status: 400 })
}
