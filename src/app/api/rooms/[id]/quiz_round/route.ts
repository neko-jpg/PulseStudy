import { NextResponse } from 'next/server'
import { answerQuiz, askQuiz, getRoom } from '../../../rooms/state'
import { z } from 'zod'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getRoom(id)) return new Response(null, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const schema = z.object({ action: z.enum(['ask','answer']), choice: z.number().int().min(0).max(100).optional() })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })
  const { action, choice } = parsed.data
  if (action === 'ask') {
    askQuiz(id)
    const room = getRoom(id)!
    return NextResponse.json({ q: room.quiz!.q, choices: room.quiz!.choices })
  } else if (action === 'answer') {
    const result = answerQuiz(id, Number(choice ?? -1))
    return NextResponse.json({ result, answer: 0 })
  }
  return new Response(null, { status: 400 })
}
