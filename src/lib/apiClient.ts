export type HttpError = { status: number; message: string }

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw { status: res.status, message: msg || 'request_failed' } as HttpError
  }
  return res.json() as Promise<T>
}

export async function fetchQuizModule(moduleId: string) {
  const res = await fetch('/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId }),
    cache: 'no-store',
  })
  const payload = await handle<any>(res)
  return payload?.doc || payload
}

export async function submitQuizAttempt(input: { moduleId: string; idx: number; selected: number; correct: boolean }) {
  const res = await fetch('/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-dev-uid': 'demo-uid' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw { status: res.status, message: 'submit_failed' } as HttpError
}

export async function requestAIFeedback(body: { question: string; userAnswer: string; subject?: string; difficulty?: string; hintsUsed?: number }) {
  const res = await fetch('/api/ai/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  return handle<{ feedback: string }>(res)
}

