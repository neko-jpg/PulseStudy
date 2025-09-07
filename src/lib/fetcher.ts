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
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as T
    } catch (e) {
      clearTimeout(t)
      lastErr = e
      if (attempt < retries) await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)))
    }
  }
  throw lastErr
}

