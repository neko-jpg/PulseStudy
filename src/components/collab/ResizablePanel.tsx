"use client"

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'

type Props = {
  id: string // key for persistence
  title: string
  min?: number
  max?: number
  initial?: number
  roomId?: string
  children: React.ReactNode
}

function storageKey(roomId?: string) { return `collabLayout:v1:${roomId || 'global'}` }

function loadLayout(roomId?: string): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(storageKey(roomId)) || '{}') } catch { return {} }
}
function saveLayout(roomId: string | undefined, map: Record<string, number>) {
  try { localStorage.setItem(storageKey(roomId), JSON.stringify(map)) } catch {}
}

export function ResizablePanel({ id, title, min = 0, max = 600, initial = 200, roomId, children }: Props) {
  const [h, setH] = useState<number>(() => {
    const m = loadLayout(roomId)
    return typeof m[id] === 'number' ? m[id] : initial
  })
  const hRef = useRef(h)
  const [collapsed, setCollapsed] = useState(h <= Math.max(0, min))

  useEffect(() => { hRef.current = h }, [h])
  useEffect(() => {
    const m = loadLayout(roomId); m[id] = h; saveLayout(roomId, m)
    setCollapsed(h <= Math.max(0, min))
  }, [h, id, min])

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    const startY = e.clientY
    const startH = hRef.current
    const mm = (ev: MouseEvent) => {
      const dy = ev.clientY - startY
      const next = Math.min(max, Math.max(min, startH - dy))
      setH(next)
    }
    const mu = () => {
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      try { track({ name: 'room_panel_resize', props: { panelId: id, height: hRef.current, roomId } }) } catch {}
      // Give layout a frame to settle, then notify interested observers
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
    }
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
  }

  return (
    <div className="border rounded bg-white overflow-hidden" style={{ height: collapsed ? 36 : h }}>
      <div className="flex items-center justify-between px-3 h-9 border-b bg-muted/40">
        <div className="text-sm font-semibold truncate">{title}</div>
        <button className="text-xs underline" onClick={() => setCollapsed((v) => !v)} aria-expanded={!collapsed}>{collapsed ? '展開' : '折り畳み'}</button>
      </div>
      {!collapsed && (
        <div className="p-3 overflow-auto" style={{ height: h - 36 - 8 }}>
          {children}
        </div>
      )}
      <div role="separator" aria-orientation="horizontal" tabIndex={0}
           className="h-2 cursor-row-resize bg-border"
           onMouseDown={onMouseDown}
           onKeyDown={(e) => { let changed=false; if (e.key === 'ArrowUp'){ setH((v) => { changed=true; return Math.min(max, v + 16) }); } if (e.key === 'ArrowDown'){ setH((v) => { changed=true; return Math.max(min, v - 16) }); } if (changed) try { track({ name: 'room_panel_resize', props: { panelId: id, height: hRef.current, roomId } }) } catch {} }} />
    </div>
  )
}
