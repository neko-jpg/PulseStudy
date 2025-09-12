import { getRoom } from '../../../rooms/state'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })

  let closed = false
  ;(globalThis as any).__sseConns = (globalThis as any).__sseConns || new Map<string, number>()
  const map: Map<string, number> = (globalThis as any).__sseConns
  map.set(id, (map.get(id) || 0) + 1)
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder()
      function sendEvent(event: string, data: any) {
        controller.enqueue(enc.encode(`event: ${event}\n`))
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      // Send initial snapshot
      const initial = getRoom(id) || { ok: false }
      sendEvent('snapshot', initial)

      // Track last seen state to emit delta events
      let lastRev = -1
      let lastBoardLens = { strokes: 0, shapes: 0, texts: 0, notes: 0 }
      let lastBoard = { strokes: [] as any[], shapes: [] as any[], texts: [] as any[], notes: [] as any[] }
      const lastStrokeLen: Record<string, number> = {}
      const seenStrokes = new Set<string>()
      const lastCursorUpd: Record<string, number> = {}
      let lastMsgLen = 0
      let lastModule = ''
      let lastQIdx = -1

      const iv = setInterval(() => {
        if (closed) return
        try {
          const room = getRoom(id)
          if (!room) return
          // board changes
          const rev = room.board?.rev ?? -1
          if (rev !== lastRev) {
            lastRev = rev
            const b = room.board || { strokes: [], shapes: [], texts: [], notes: [], rev }
            const patch: any = { rev }
            const makeArrPatch = (prev: any[], curr: any[]) => {
              const ops: any = {}
              // truncate
              if (curr.length < prev.length) ops.truncateTo = curr.length
              const min = Math.min(prev.length, curr.length)
              const rep: any[] = []
              for (let i=0;i<min;i++){
                const a = prev[i], c = curr[i]
                if (JSON.stringify(a) !== JSON.stringify(c)) rep.push({ i, item: c })
              }
              if (rep.length>0) ops.replace = rep
              if (curr.length > prev.length) ops.append = curr.slice(prev.length)
              const has = ('truncateTo' in ops) || ('replace' in ops) || ('append' in ops)
              return has ? ops : null
            }
            const pStrokes = makeArrPatch(lastBoard.strokes, b.strokes||[])
            const pShapes = makeArrPatch(lastBoard.shapes, b.shapes||[])
            const pTexts = makeArrPatch(lastBoard.texts, b.texts||[])
            const pNotes = makeArrPatch(lastBoard.notes, b.notes||[])
            const lenses = { strokes: b.strokes?.length||0, shapes: b.shapes?.length||0, texts: b.texts?.length||0, notes: b.notes?.length||0 }
            lastBoardLens = lenses
            lastBoard = { strokes: (b.strokes||[]).slice(), shapes: (b.shapes||[]).slice(), texts: (b.texts||[]).slice(), notes: (b.notes||[]).slice() }
            if (pStrokes) patch.strokes = pStrokes
            if (pShapes) patch.shapes = pShapes
            if (pTexts) patch.texts = pTexts
            if (pNotes) patch.notes = pNotes
            if (!pStrokes && !pShapes && !pTexts && !pNotes) {
              // no detectable per-index change; send full board for safety
              sendEvent('board', { board: b })
            } else {
              sendEvent('board_patch', patch)
            }
          }
          // emit quiz progress changes
          if ((room as any).moduleId !== undefined || (room as any).qIdx !== undefined) {
            const m = (room as any).moduleId || ''
            const qi = Number((room as any).qIdx || 0)
            if (m !== lastModule || qi !== lastQIdx) {
              lastModule = m; lastQIdx = qi
              sendEvent('progress', { moduleId: m, idx: qi })
            }
          }

          // live strokes deltas
          const current = room.live?.strokes || {}
          const flatten = (pts: { x:number; y:number }[]) => {
            const out: number[] = []
            for (const p of pts) { if (p) { out.push(p.x, p.y) } }
            return out
          }
          const encF32 = (arr: number[]) => Buffer.from(new Float32Array(arr).buffer).toString('base64')
          // new or updated strokes
          for (const sid of Object.keys(current)){
            const s = current[sid]
            if (!seenStrokes.has(sid)){
              seenStrokes.add(sid)
              lastStrokeLen[sid] = 0
              sendEvent('live_start', { id: sid, clientId: s.clientId, color: s.color, size: s.size })
            }
            const prevLen = lastStrokeLen[sid] || 0
            if (s.points.length > prevLen){
              const delta = s.points.slice(prevLen)
              lastStrokeLen[sid] = s.points.length
              if (delta.length>0) { const flat = flatten(delta); sendEvent('live_points', { strokeId: sid, pts_b64: encF32(flat), pts: flat, points: delta }) }
            }
          }
          // ended strokes
          for (const sid of Array.from(seenStrokes)){
            if (!current[sid]){ seenStrokes.delete(sid); delete lastStrokeLen[sid]; sendEvent('live_end', { id: sid }) }
          }
          // cursors updates
          const curs = room.live?.cursors || {}
          for (const cid of Object.keys(curs)){
            const c = curs[cid]
            const lu = lastCursorUpd[cid] || 0
            const cu = c?.updatedAt || 0
            if (cu > lu){ lastCursorUpd[cid] = cu; sendEvent('cursor', { clientId: cid, x: c.x, y: c.y, color: c.color }) }
          }

          // chat messages appended
          const msgs = (room as any).messages || []
          if (Array.isArray(msgs) && msgs.length > lastMsgLen) {
            for (let i = lastMsgLen; i < msgs.length; i++) {
              const m = msgs[i]
              if (!m) continue
              sendEvent('chat', { id: m.id, userId: m.userId, text: m.text, ts: m.ts })
            }
            lastMsgLen = msgs.length
          }
        } catch {
          // ignore
        }
      }, 120)

      const heartbeat = setInterval(() => {
        if (closed) return
        controller.enqueue(enc.encode(`: keep-alive\n\n`))
      }, 15000)

      const onClose = () => {
        closed = true
        clearInterval(iv)
        clearInterval(heartbeat)
        try { controller.close() } catch {}
        map.set(id, Math.max(0, (map.get(id) || 1) - 1))
      }

      // There is no direct abort signal here; rely on underlying runtime closing
      ;(globalThis as any).addEventListener?.('beforeunload', onClose)
    },
    cancel() {
      closed = true
      map.set(id, Math.max(0, (map.get(id) || 1) - 1))
    },
  })

  return new Response(stream, { headers })
}
