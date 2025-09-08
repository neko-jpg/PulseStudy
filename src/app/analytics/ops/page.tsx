"use client"

import { useEffect, useMemo, useState } from 'react'

type LogRec = { ts:number; level:string; event:string; [k:string]:any }

export default function OpsPage(){
  const [logs, setLogs] = useState<LogRec[]>([])
  const [err, setErr] = useState<string|null>(null)
  const [filter, setFilter] = useState<string>('')
  const [metrics, setMetrics] = useState<{ sseConnections:number; roomsWithSse:number }|null>(null)
  useEffect(()=>{
    let stop=false
    async function load(){
      try{
        const r=await fetch('/api/ops', { cache: 'no-store' })
        const js=await r.json()
        if(!stop){ setLogs(js.logs||[]); setMetrics(js.metrics||null) }
      }catch(e:any){ if(!stop) setErr(e?.message||'error') }
    }
    load(); const id=setInterval(load, 2000)
    return ()=>{ stop=true; clearInterval(id) }
  },[])
  const now = Date.now()
  const windowMs = 30000
  const recent = useMemo(()=> logs.filter(l=> now - l.ts <= windowMs && (!filter || l.event.includes(filter))), [logs, now, filter])
  const buckets = 30
  const perSec = new Array(buckets).fill(0)
  for(const l of recent){ const sec = Math.floor((now - l.ts)/1000); const idx = buckets-1 - Math.min(buckets-1, Math.max(0, sec)); perSec[idx]++ }
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2">Ops Dashboard</h1>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <div className="flex items-center gap-3 mb-3 text-sm">
        <div className="text-muted-foreground">Latest logs: {logs.length}</div>
        {metrics && <div className="text-muted-foreground">SSE: {metrics.sseConnections} conns in {metrics.roomsWithSse} rooms</div>}
        <input className="border rounded px-2 py-1 text-sm" placeholder="filter by event" value={filter} onChange={(e)=>setFilter(e.target.value)} />
      </div>
      <div className="mb-4">
        <div className="text-sm font-medium mb-1">Events/sec (last 30s)</div>
        <div className="flex items-end gap-1 h-16">
          {perSec.map((v,i)=> (
            <div key={i} className="bg-blue-500/70" style={{width:6, height: Math.max(2, v*2)}} title={`${v}`} />
          ))}
        </div>
      </div>
      <div className="border rounded p-2 bg-white max-h-[60vh] overflow-auto text-xs font-mono">
        {logs.filter(l=> !filter || l.event.includes(filter)).map((l,i)=> (
          <div key={i} className="flex gap-2">
            <span className="text-gray-500 w-20">{new Date(l.ts).toLocaleTimeString()}</span>
            <span className={l.level==='error'?'text-red-600': l.level==='warn'?'text-amber-600':'text-emerald-700'}>[{l.level}]</span>
            <span className="font-semibold">{l.event}</span>
            <span className="truncate">{JSON.stringify(l)}</span>
          </div>
        ))}
        {logs.length===0 && <div className="text-gray-500">No logs</div>}
      </div>
    </div>
  )
}
