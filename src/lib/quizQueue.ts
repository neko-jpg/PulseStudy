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

export async function flush() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return
  const arr = read()
  if (!arr.length) return
  const remain: Attempt[] = []
  for (const a of arr) {
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(a),
      })
      if (!res.ok) throw new Error('fail')
    } catch {
      remain.push(a)
    }
    // Write back after each item to minimize duplication on crashes
    write(remain)
  }
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
