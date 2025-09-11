export type StartSessionResponse = {
  sessionId: string
  moduleId: string
  summary: { title: string; subject: string; points: string[] }
  questions: Array<{ id: string; text: string; choices: string[] }>
}

export async function startSession({ moduleId }: { moduleId?: string }): Promise<StartSessionResponse> {
  const res = await fetch('/api/ai/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId }),
  })
  if (!res.ok) throw new Error('failed_to_start_session')
  return res.json()
}

