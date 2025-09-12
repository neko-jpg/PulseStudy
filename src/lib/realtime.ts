// Simple polling-based realtime abstraction with backoff and visibility pause

export type Unsubscribe = () => void
type Options = { transport?: 'poll'|'sse' }

export function subscribeRoomState(roomId: string, onState: (s: any) => void, opts: Options = {}): Unsubscribe {
  const transport = opts.transport || 'sse'
  // Try SSE first, then fall back to poll with backoff
  if (transport === 'sse' && typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      let es: EventSource | null = null
      let reconnectTimer: any = null
      let retry = 0
      const maxRetry = 6
      const baseDelay = 800
      const maxDelay = 8000
      let closedByUser = false

      let curr: any = null
      const apply = (mut: (s:any)=>void) => { try { if (!curr) return; mut(curr); onState(curr) } catch {} }
      const onSnap = (ev: MessageEvent) => { try { curr = JSON.parse(ev.data); onState(curr) } catch {} }
      const onBoard = (ev: MessageEvent) => { apply((s)=>{ try { const js = JSON.parse(ev.data); s.board = js.board } catch {} }) }
      const onBoardPatch = (ev: MessageEvent) => {
        apply((s) => {
          try {
            const js = JSON.parse(ev.data)
            s.board = s.board || {}
            const applyArr = (key: 'strokes'|'shapes'|'texts'|'notes', patch: any) => {
              const arr: any[] = (s.board as any)[key] || []
              if (Array.isArray(patch)) { (s.board as any)[key] = patch; return }
              if (typeof patch === 'object' && patch) {
                if (typeof patch.truncateTo === 'number') {
                  arr.length = Math.max(0, Math.min(arr.length, patch.truncateTo))
                }
                if (Array.isArray(patch.replace)) {
                  for (const r of patch.replace) { if (r && typeof r.i === 'number') arr[r.i] = r.item }
                }
                if (Array.isArray(patch.append)) {
                  for (const a of patch.append) arr.push(a)
                }
                (s.board as any)[key] = arr
              }
            }
            if ('strokes' in js) applyArr('strokes', js.strokes)
            if ('shapes' in js) applyArr('shapes', js.shapes)
            if ('texts' in js) applyArr('texts', js.texts)
            if ('notes' in js) applyArr('notes', js.notes)
            if ('rev' in js) (s.board as any).rev = js.rev
          } catch {}
        })
      }
      const onLiveStart = (ev: MessageEvent) => { apply((s)=>{ const js = JSON.parse(ev.data); s.live = s.live || { strokes: {}, cursors: {} }; const col = (typeof js.color === 'string' && js.color) ? js.color : '#111827'; const sz = (typeof js.size === 'number' && Number.isFinite(js.size)) ? js.size : 2; s.live.strokes[js.id] = { id: js.id, clientId: js.clientId, color: col, size: sz, points: [], updatedAt: Date.now() } }) }
      const onLivePts = (ev: MessageEvent) => { apply((s)=>{ const js = JSON.parse(ev.data); const st = s.live?.strokes?.[js.strokeId]; if (!st) return; if (typeof js.pts_b64 === 'string' && js.pts_b64.length>0) { try { const bin = atob(js.pts_b64); const len = bin.length; const bytes = new Uint8Array(len); for (let i=0;i<len;i++){ bytes[i] = bin.charCodeAt(i) } const f32 = new Float32Array(bytes.buffer); for (let i=0;i+1<f32.length;i+=2){ const x=f32[i], y=f32[i+1]; if (Number.isFinite(x)&&Number.isFinite(y)) st.points.push({ x, y }) } } catch {} } else if (Array.isArray(js.pts)) { const a:number[] = js.pts; for(let i=0;i+1<a.length;i+=2){ const x=a[i], y=a[i+1]; if(Number.isFinite(x)&&Number.isFinite(y)) st.points.push({ x, y }) } } else { const pts = Array.isArray(js.points) ? js.points : []; for(const p of pts){ if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)) st.points.push({ x:p.x, y:p.y }) } } st.updatedAt = Date.now() }) }
      const onLiveEnd = (ev: MessageEvent) => { apply((s)=>{ const js = JSON.parse(ev.data); if (s.live?.strokes) delete s.live.strokes[js.id] }) }
      const onCursor = (ev: MessageEvent) => { apply((s)=>{ const js = JSON.parse(ev.data); s.live = s.live || { strokes: {}, cursors: {} }; s.live.cursors = s.live.cursors || {}; const col = (typeof js.color === 'string' && js.color) ? js.color : '#111827'; const x = Number.isFinite(js.x) ? js.x : 0; const y = Number.isFinite(js.y) ? js.y : 0; s.live.cursors[js.clientId] = { x, y, color: col, updatedAt: Date.now() } }) }
      const onMsg = (ev: MessageEvent) => { try { const js = JSON.parse(ev.data); onState(js) } catch {} }
      const onProgress = (ev: MessageEvent) => { apply((s) => { try { const js = JSON.parse(ev.data); (s as any).moduleId = js.moduleId; (s as any).qIdx = js.idx } catch {} }) }
      const onChat = (ev: MessageEvent) => { apply((s) => { try { const js = JSON.parse(ev.data); (s as any).messages = Array.isArray((s as any).messages) ? (s as any).messages : []; (s as any).messages.push({ id: js.id, userId: js.userId, text: js.text, ts: js.ts }) } catch {} }) }
      let fallbackUnsub: Unsubscribe | null = null

      const attach = () => {
        if (!es) return
        es.addEventListener('message', onMsg) // compatibility
        es.addEventListener('snapshot', onSnap as any)
        es.addEventListener('board', onBoard as any)
        es.addEventListener('live_start', onLiveStart as any)
        es.addEventListener('live_points', onLivePts as any)
        es.addEventListener('live_end', onLiveEnd as any)
        es.addEventListener('cursor', onCursor as any)
        es.addEventListener('board_patch', onBoardPatch as any)
        es.addEventListener('error', onError)
        es.addEventListener('progress', onProgress as any)
        es.addEventListener('chat', onChat as any)
      }
      const detach = () => {
        if (!es) return
        es.removeEventListener('message', onMsg)
        es.removeEventListener('snapshot', onSnap as any)
        es.removeEventListener('board', onBoard as any)
        es.removeEventListener('live_start', onLiveStart as any)
        es.removeEventListener('live_points', onLivePts as any)
        es.removeEventListener('live_end', onLiveEnd as any)
        es.removeEventListener('cursor', onCursor as any)
        es.removeEventListener('board_patch', onBoardPatch as any)
        es.removeEventListener('error', onError)
        es.removeEventListener('progress', onProgress as any)
        es.removeEventListener('chat', onChat as any)
      }
      const onError = () => {
        if (closedByUser) return
        try { if (es) es.close() } catch {}
        detach()
        es = null
        // Try to reconnect with backoff a few times before polling fallback
        retry += 1
        const delay = Math.min(maxDelay, Math.round(baseDelay * Math.pow(1.8, retry)))
        clearTimeout(reconnectTimer)
        reconnectTimer = setTimeout(() => {
          if (retry <= maxRetry) {
            connect()
          } else if (!fallbackUnsub) {
            fallbackUnsub = subscribeRoomState(roomId, onState, { transport: 'poll' })
          }
        }, delay)
      }
      const connect = () => {
        if (closedByUser) return
        try {
          es = new EventSource(`/api/rooms/${roomId}/sse`)
          retry = 0
          attach()
        } catch {
          onError()
        }
      }
      connect()
      return () => {
        closedByUser = true
        clearTimeout(reconnectTimer)
        detach()
        try { if (es) es.close() } catch {}
        if (fallbackUnsub) { try { fallbackUnsub() } catch {} }
      }
    } catch {
      // fall through to polling
    }
  }

  let active = true
  let timer: any = null
  let controller: AbortController | null = null
  let delay = 2000
  const maxDelay = 10000
  const resetDelay = () => { delay = 2000 }
  const backoff = () => { delay = Math.min(maxDelay, Math.round(delay * (1.6 + Math.random() * 0.2))) }

  const schedule = () => {
    if (!active) return
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    timer = setTimeout(loop, delay)
  }
  const loop = async () => {
    if (!active) return
    try {
      controller = new AbortController()
      const r = await fetch(`/api/rooms/${roomId}/state`, { cache: 'no-store', signal: controller.signal })
      if (r.ok) {
        const js = await r.json(); onState(js)
        resetDelay()
      } else {
        backoff()
      }
    } catch {
      backoff()
    } finally {
      controller = null
    }
    schedule()
  }

  const onVis = () => {
    if (document.visibilityState === 'visible') {
      clearTimeout(timer)
      if (controller) { try { controller.abort() } catch {} }
      resetDelay()
      loop()
    } else {
      clearTimeout(timer)
      if (controller) { try { controller.abort() } catch {} }
    }
  }

  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis)
  loop()

  return () => {
    active = false
    clearTimeout(timer)
    if (controller) { try { controller.abort() } catch {} }
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis)
  }
}
