"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function HandleInput({ roomId, initial }: { roomId: string; initial?: string }) {
  const [name, setName] = useState(initial || '')
  const timer = useRef<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!initial) {
      try { const saved = localStorage.getItem('displayName') || '' ; if (saved) setName(saved) } catch {}
    }
  }, [initial])

  const save = useCallback(async (v: string) => {
    try {
      await fetch(`/api/rooms/${roomId}/handle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: v }) })
      localStorage.setItem('displayName', v)
      toast({ description: '保存しました', duration: 1200 })
    } catch {}
  }, [roomId, toast])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setName(v)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => save(v), 800)
  }
  function onBlur() {
    if (timer.current) window.clearTimeout(timer.current)
    save(name)
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { if (timer.current) window.clearTimeout(timer.current); save(name) }
  }

  return (
    <input
      value={name}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder="ハンドル名"
      aria-label="ハンドル名"
      className="border rounded px-2 py-1 text-sm mr-2"
      style={{ minWidth: 140 }}
      maxLength={24}
    />
  )
}

