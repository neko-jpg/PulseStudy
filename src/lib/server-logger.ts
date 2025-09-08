export type LogLevel = 'info'|'warn'|'error'

declare global {
  // eslint-disable-next-line no-var
  var __logBuffer: Array<Record<string, any>> | undefined
}

function buf() {
  if (!globalThis.__logBuffer) globalThis.__logBuffer = []
  return globalThis.__logBuffer!
}

export function log(event: string, level: LogLevel = 'info', props?: Record<string, any>) {
  try {
    const rec = { ts: Date.now(), level, event, ...(props || {}) }
    console.log(JSON.stringify(rec))
    const b = buf()
    b.push(rec)
    // cap at 1000 records
    if (b.length > 1000) b.splice(0, b.length - 1000)
  } catch {
    // ignore
  }
}

export function recentLogs(limit = 200) {
  const b = buf()
  if (b.length <= limit) return b.slice()
  return b.slice(b.length - limit)
}
