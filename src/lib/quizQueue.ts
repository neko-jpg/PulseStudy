type Attempt = {
  moduleId: string
  idx: number
  selected: number
  correct: boolean
  ts: number
}

const KEY = 'quizQueue:v1'
const MAX = 200

function read(): Attempt[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function write(arr: Attempt[]) {
  try { localStorage.setItem(KEY, JSON.stringify(arr.slice(-MAX))) } catch {}
}

export function enqueue(attempt: Attempt) {
  const arr = read()
  arr.push(attempt)
  write(arr)
}

export function clearAll() { write([]) }

export async function flush() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return
  const arr = read()
  if (!arr.length) return
  const chunk = (xs: Attempt[], n: number) => xs.length <= n ? [xs] : Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i*n, (i+1)*n))
  const batches = chunk(arr, 400) // keep margin for Firestore batch limits
  for (const items of batches) {
    try {
      const res = await fetch('/api/analytics/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error('attempts_batch_failed')
    } catch {
      // Stop on first failure; keep remaining for next retry
      return
    }
  }
  clearAll()
}

export function setupFlushListeners() {
  if (typeof window === 'undefined') return
  const onOnline = () => { flush() }
  const onVis = () => { if (document.visibilityState === 'visible') flush() }
  window.addEventListener('online', onOnline)
  window.addEventListener('visibilitychange', onVis)
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('visibilitychange', onVis)
  }
}
