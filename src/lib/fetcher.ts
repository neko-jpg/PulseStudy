export type FetchOptions = RequestInit & { timeoutMs?: number; retries?: number; retryDelayMs?: number }

export async function fetchJson<T = any>(url: string, opts: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 8000, retries = 1, retryDelayMs = 400, ...init } = opts
  let lastErr: any
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' })
      clearTimeout(t)
      if (!res.ok) {
        const err: any = new Error(`HTTP ${res.status}`)
        err.status = res.status
        throw err
      }
      return (await res.json()) as T
    } catch (e) {
      clearTimeout(t)
      lastErr = e
      if (attempt < retries) {
        const status = (lastErr as any)?.status || 0
        const base = retryDelayMs * Math.pow(2, attempt)
        const jitter = Math.random() * 150
        const delay = [429, 503].includes(status) ? base + jitter : Math.min(base + jitter, 1200)
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastErr
}
