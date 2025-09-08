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
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder()
      function send(data: any) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      // Send initial snapshot
      send(getRoom(id) || { ok: false })

      const iv = setInterval(() => {
        if (closed) return
        try {
          const room = getRoom(id)
          send(room || { ok: false })
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
      }

      // There is no direct abort signal here; rely on underlying runtime closing
      ;(globalThis as any).addEventListener?.('beforeunload', onClose)
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, { headers })
}
