"use client"

import { useEffect, useRef, useState } from 'react'
import { usePulseStore } from '@/store/pulse'

export function PulseNudge(){
  const lastEvent = usePulseStore(s=>s.lastEvent)
  const [visible, setVisible] = useState(false)
  const hideRef = useRef<any>(null)
  useEffect(()=>{
    if (lastEvent?.type==='distraction'){
      setVisible(true)
      if (hideRef.current) clearTimeout(hideRef.current)
      hideRef.current = setTimeout(()=> setVisible(false), 3000)
    }
    return ()=> { if (hideRef.current) clearTimeout(hideRef.current) }
  },[lastEvent?.ts])
  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/5 transition-opacity" />
      <div className="absolute inset-2 rounded-xl border-2 border-emerald-400 animate-pulse" />
      <div className="absolute top-4 right-4 text-xs bg-white/90 rounded px-2 py-1 shadow">集中を取り戻しましょう（軽いナッジ）</div>
    </div>
  )
}

