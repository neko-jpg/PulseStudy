"use client"

import { useEffect, useState } from 'react'
import type { ModuleDoc } from '@/lib/types'
import { fetchQuizModule } from '@/lib/apiClient'

export function useQuizModule(moduleId: string) {
  const [doc, setDoc] = useState<ModuleDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchQuizModule(moduleId)
        if (!active) return
        setDoc(data)
      } catch (e: any) {
        setError(e?.status === 401 ? 'unauthorized' : (e?.name === 'AbortError' ? 'timeout' : 'network'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false; clearTimeout(timeout); controller.abort() }
  }, [moduleId])

  return { doc, loading, error }
}

