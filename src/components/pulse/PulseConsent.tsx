"use client"

import { usePulseStore } from '@/store/pulse'

export function PulseConsent(){
  const consent = usePulseStore(s=>s.consent)
  const setConsent = usePulseStore(s=>s.setConsent)
  const running = usePulseStore(s=>s.running)
  const start = usePulseStore(s=>s.start)
  const stop = usePulseStore(s=>s.stop)

  async function onToggle(){
    const next = !consent.camera
    setConsent({ camera: next })
    if (next) await start(); else stop()
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <label className="inline-flex items-center gap-1">
        <input type="checkbox" checked={consent.camera} onChange={onToggle} />
        カメラ解析（端末内）
      </label>
      {running && <span className="text-emerald-600">測定中</span>}
    </div>
  )
}

