// Simple polling-based realtime abstraction with backoff and visibility pause

export type Unsubscribe = () => void
type Options = { transport?: 'poll'|'sse' }

export function subscribeRoomState(roomId: string, onState: (s: any) => void, opts: Options = {}): Unsubscribe {
  const transport = opts.transport || 'sse'
  if (transport === 'sse' && typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      const es = new EventSource(`/api/rooms/${roomId}/sse`)
      const onMsg = (ev: MessageEvent) => {
        try { const js = JSON.parse(ev.data); onState(js) } catch {}
      }
      const onError = () => { es.close(); /* fallback to poll */ subscribeRoomState(roomId, onState, { transport: 'poll' }) }
      es.addEventListener('message', onMsg)
      es.addEventListener('error', onError)
      return () => { es.removeEventListener('message', onMsg); es.removeEventListener('error', onError); es.close() }
    } catch {
      // fall back to poll
    }
  }
  let active = true
  let timer: any = null
  let delay = 2000
  const maxDelay = 10000

  const schedule = () => {
    if (!active) return
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    timer = setTimeout(loop, delay)
  }
  const loop = async () => {
    try {
      const r = await fetch(`/api/rooms/${roomId}/state`, { cache: 'no-store' })
      if (r.ok) {
        const js = await r.json(); onState(js)
        delay = 2000
      } else {
        delay = Math.min(maxDelay, Math.floor(delay * 1.5))
      }
    } catch {
      delay = Math.min(maxDelay, Math.floor(delay * 1.5))
    }
    schedule()
  }

  const onVis = () => {
    if (document.visibilityState === 'visible') {
      clearTimeout(timer)
      delay = Math.min(delay, 2000)
      loop()
    } else {
      clearTimeout(timer)
    }
  }

  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis)
  loop()

  return () => {
    active = false
    clearTimeout(timer)
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis)
  }
}
