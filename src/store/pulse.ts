"use client"

import { create } from 'zustand'

type Attn = { gaze: number; audio: number; hr: number }
type Quality = { light: number; fps: number }

type PulseState = {
  running: boolean
  consent: { camera: boolean; mic: boolean; telemetry?: boolean }
  backend?: 'heuristic'|'face-lite'
  config?: { distractionThreshold: number; distractionDurationMs: number; nudgeCooldownMs: number; pointsIntervalMs: number; batchSec: number }
  score: number
  trend: number
  attn: Attn
  quality: Quality
  lastEvent?: { type: string; ts: number }
  sessionId: string
  focusPoints?: number
  start: () => Promise<void>
  stop: () => void
  setConsent: (v: Partial<PulseState['consent']>) => void
  setBackend: (b: 'heuristic'|'face-lite') => void
}

let _worker: Worker | null = null
let _raf: number | null = null
let _eventTimer: any = null
let _pointsTimer: any = null
let _bc: BroadcastChannel | null = null

function todayKey(){
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const da = String(d.getDate()).padStart(2,'0')
  return `${y}${m}${da}`
}

function sid() { return `s-${Math.random().toString(36).slice(2,8)}${Date.now().toString(36).slice(4)}` }
function saveAgg(score:number){
  try{
    const k = `pulse:agg:v1:${todayKey()}`
    const raw = localStorage.getItem(k)
    const v = raw? JSON.parse(raw): { sum:0, n:0, flowSec:0 }
    v.sum += score; v.n += 1; if (score>=0.95) v.flowSec += 1
    localStorage.setItem(k, JSON.stringify(v))
  }catch{}
}

export const usePulseStore = create<PulseState>((set, get) => ({
  running: false,
  consent: { camera: false, mic: false, telemetry: false },
  backend: 'heuristic',
  config: { distractionThreshold: 0.6, distractionDurationMs: 5000, nudgeCooldownMs: 5000, pointsIntervalMs: 60000, batchSec: 5 },
  score: 0,
  trend: 0,
  attn: { gaze: 0.5, audio: 0.0, hr: 0.0 },
  quality: { light: 0, fps: 0 },
  sessionId: sid(),
  focusPoints: 0,
  setConsent(v){ set((s)=> ({ consent: { ...s.consent, ...v } })) },
  setBackend(b){ set({ backend: b }); if (_worker){ try { _worker.postMessage({ type:'config', backend: b }) } catch {} } },
  async start(){
    if (get().running) return
    // camera consent required
    if (!get().consent.camera) { set({ running:false }); return }
    try {
      // fetch remote config (best effort)
      try { const r = await fetch('/api/pulse/config', { cache:'no-store' }); if (r.ok){ const js = await r.json(); set({ config: js }) } } catch {}
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false })
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      const worker = new Worker(new URL('../workers/pulse.worker.ts', import.meta.url))
      _worker = worker
      // send initial config
      try { worker.postMessage({ type:'config', backend: get().backend||'heuristic' }) } catch {}
      worker.onmessage = (ev) => {
        const m = ev.data
        if (m?.type === 'pulse') {
          set({ score: m.score, trend: m.trend, attn: m.attn, quality: m.quality })
          try { _bc?.postMessage({ type:'pulse', score: m.score }) } catch {}
          saveAgg(m.score)
        }
      }
      const sendFrame = async () => {
        if (!_worker) return
        try {
          // capture current frame as ImageBitmap (cheap path)
          const bmp = await createImageBitmap(video)
          _worker.postMessage({ type: 'frame', frame: bmp, ts: performance.now() }, [bmp as any])
        } catch {}
        _raf = requestAnimationFrame(sendFrame)
      }
      _raf = requestAnimationFrame(sendFrame)
      if (_eventTimer) clearInterval(_eventTimer)
      let lowSince = 0
      _eventTimer = setInterval(async ()=>{
        const s = get().score
        const trend = get().trend
        const now = Date.now()
        const cfg = get().config!
        const last = (get().lastEvent?.ts)||0
        if (s < (cfg?.distractionThreshold ?? 0.6)) { if (!lowSince) lowSince = now } else { lowSince = 0 }
        if (lowSince && (now - lowSince >= (cfg?.distractionDurationMs ?? 5000)) && (now - last >= (cfg?.nudgeCooldownMs ?? 5000))) {
          set({ lastEvent: { type:'distraction', ts: now } })
          if (get().consent.telemetry) { try { await fetch('/api/pulse/events', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ type:'distraction', score:s, trend }) }) } catch {} }
          lowSince = 0
        }
      }, 1000)
      if (_pointsTimer) clearInterval(_pointsTimer)
      _pointsTimer = setInterval(async ()=>{
        const s = get().score
        if (s>=0.8) set(st=>({ focusPoints: (st.focusPoints||0) + 10 }))
        if (get().consent.telemetry) { try { await fetch('/api/pulse/samples', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ score: s }) }) } catch {} }
      }, get().config?.pointsIntervalMs || 60000)
      try { _bc = new BroadcastChannel('pulse'); _bc.onmessage = (e)=>{ const m=e.data; if(m?.type==='pulse'){ set({ score: m.score }) } } } catch {}

      set({ running: true })
    } catch {
      set({ running: false })
    }
  },
  stop(){
    if (_raf) cancelAnimationFrame(_raf); _raf = null
    if (_worker) { try { _worker.terminate() } catch {} ; _worker = null }
    if (_eventTimer) { clearInterval(_eventTimer); _eventTimer=null }
    if (_pointsTimer) { clearInterval(_pointsTimer); _pointsTimer=null }
    try { _bc?.close(); _bc=null } catch {}
    set({ running: false })
  },
}))
