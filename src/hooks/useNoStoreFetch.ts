"use client"

import { useCallback, useEffect, useRef, useState } from 'react'

export function useNoStoreFetch<T = any>(url: string, opts?: { timeoutMs?: number; init?: RequestInit }) {
  const timeoutMs = opts?.timeoutMs ?? 5000
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url, { ...(opts?.init || {}), cache: 'no-store', signal: controller.signal })
      if (!res.ok) throw new Error('request_failed')
      const json = (await res.json()) as T
      setData(json)
    } catch (e: any) {
      setError(e?.name === 'AbortError' ? 'timeout' : 'network')
    } finally {
      clearTimeout(t)
      setLoading(false)
    }
  }, [url, timeoutMs, opts?.init])

  useEffect(() => { load(); return () => abortRef.current?.abort() }, [load])

  return { data, loading, error, retry: load }
}

