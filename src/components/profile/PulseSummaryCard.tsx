"use client"

import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePulseStore } from '@/store/pulse'

export function PulseSummaryCard(){
  const score = usePulseStore(s=>s.score)
  const consent = usePulseStore(s=>s.consent)
  const setConsent = usePulseStore(s=>s.setConsent)
  const [samples, setSamples] = useState<number[]>([])
  const refTs = useRef<number>(Date.now())
  useEffect(()=>{
    const id = setInterval(()=>{ setSamples(s=>{ const next=[...s, score]; if(next.length>180) next.shift(); return next }) }, 1000)
    return ()=> clearInterval(id)
  },[score])
  const avg = useMemo(()=> samples.length? Math.round(samples.reduce((a,b)=>a+b,0)/samples.length*100): 0, [samples])
  const flowMin = useMemo(()=> Math.round(samples.filter(s=>s>=0.95).length/60), [samples])
  const week = useMemo(()=>{
    const out: { day:string; avg:number }[] = []
    for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const key=`pulse:agg:v1:${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`; try{ const raw=localStorage.getItem(key); if(raw){ const v=JSON.parse(raw); const a=v.n? Math.round((v.sum/v.n)*100):0; out.push({ day: `${d.getMonth()+1}/${d.getDate()}`, avg:a }) } else { out.push({ day: `${d.getMonth()+1}/${d.getDate()}`, avg:0 }) } } catch{ out.push({ day: `${d.getMonth()+1}/${d.getDate()}`, avg:0 }) } }
    return out
  },[])
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm font-semibold mb-2">没入度（端末内推定・今セッション）</div>
        <div className="text-xs text-muted-foreground mb-2">平均: {avg}% / フロー時間: {flowMin} 分</div>
        <div className="mb-2 text-xs">
          <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!consent.telemetry} onChange={(e)=>setConsent({ telemetry: e.target.checked })} />匿名メタ送信（端末内→メタのみ）</label>
        </div>
        <div className="flex items-end gap-1 h-16">
          {new Array(60).fill(0).map((_,i)=>{
            const v = samples[samples.length-60+i] ?? 0
            const h = Math.max(2, Math.round(v*60))
            return <div key={i} className="bg-emerald-500/70" style={{width:4, height:h}} />
          })}
        </div>
        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-1">7日トレンド</div>
          <div className="flex items-end gap-2 h-16">
            {week.map((d,i)=> <div key={i} title={`${d.day}: ${d.avg}%`} className="bg-blue-500/70" style={{width:10, height: Math.max(2, d.avg/2)}} />)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
