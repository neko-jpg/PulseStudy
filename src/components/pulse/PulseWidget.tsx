"use client"

import { useEffect } from 'react'
import { usePulseStore } from '@/store/pulse'

export function PulseWidget(){
  const score = usePulseStore(s=>s.score)
  const attn = usePulseStore(s=>s.attn)
  const quality = usePulseStore(s=>s.quality)
  const consent = usePulseStore(s=>s.consent)
  const running = usePulseStore(s=>s.running)
  const start = usePulseStore(s=>s.start)
  const stop = usePulseStore(s=>s.stop)

  useEffect(()=>{ return () => { stop() } },[stop])

  const pct = Math.round(score*100)
  const ring = `conic-gradient(#10b981 ${pct*3.6}deg, #e5e7eb 0deg)`

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-full" style={{ backgroundImage: ring }} aria-label={`没入度 ${pct}%`} title={`没入度 ${pct}%`}>
        <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center text-xs font-semibold">{pct}</div>
      </div>
      <div className="text-xs text-muted-foreground">
        <div>FPS: {quality.fps}</div>
        <div>G:{(attn.gaze*100|0)}% P:{(attn.pose*100|0)}% E:{(attn.expression*100|0)}%</div>
        <div className="mt-1">
          {!consent.camera ? (
            <button className="underline" onClick={start}>カメラ解析を開始</button>
          ) : running ? (
            <button className="underline" onClick={stop}>停止</button>
          ) : (
            <button className="underline" onClick={start}>再開</button>
          )}
        </div>
      </div>
    </div>
  )
}
