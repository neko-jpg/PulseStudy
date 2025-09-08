// Minimal pulse worker: compute a pseudo focus score from frames (brightness + motion)

type Backend = 'heuristic' | 'face-lite'
export type MsgIn = { type: 'frame'; frame: ImageBitmap; ts: number } | { type: 'config'; backend?: Backend }

let lastImage: ImageData | null = null
let lastTs = 0
let ewma = 0.6
let backend: Backend = 'heuristic'

function clamp(x: number, a: number, b: number) { return Math.max(a, Math.min(b, x)) }

onmessage = async (ev: MessageEvent<MsgIn>) => {
  const m = ev.data
  if (!m) return
  if (m.type === 'config') { backend = m.backend || 'heuristic'; return }
  if (m.type !== 'frame') return
  const { frame, ts } = m
  try {
    const w = 96, h = 54
    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(frame, 0, 0, w, h)
    const img = ctx.getImageData(0, 0, w, h)
    const data = img.data
    // features (placeholder for face-lite backend)
    let mean = 0, stdev = 0, motion = 0
    {
      let sum = 0, varsum = 0
      for (let i=0;i<data.length;i+=4){ const r=data[i], g=data[i+1], b=data[i+2]; const y = 0.2126*r + 0.7152*g + 0.0722*b; sum += y; varsum += y*y }
      const n = (data.length/4)
      mean = sum / n
      stdev = Math.sqrt(Math.max(0, varsum/n - mean*mean))
      if (lastImage) {
        const step = 8
        for (let yy=0;yy<h;yy+=step){ for (let xx=0;xx<w;xx+=step){ const i=(yy*w+xx)*4; const dy= Math.abs(data[i] - lastImage.data[i]) + Math.abs(data[i+1]-lastImage.data[i+1]) + Math.abs(data[i+2]-lastImage.data[i+2]); motion += dy } }
        motion /= ((w/step)*(h/step))
      }
      lastImage = img
    }
    // optional FaceDetector-based focus (face-lite backend)
    let gazeFocus = 0
    try {
      const FD: any = (self as any).FaceDetector
      if (backend === 'face-lite' && FD) {
        const det = new FD({ fastMode: true, maxDetectedFaces: 1 })
        const faces = await det.detect(frame as any)
        if (faces && faces.length>0) {
          const f = faces[0]
          const fw = (frame as any).width || w
          const fh = (frame as any).height || h
          const cx = (f.boundingBox.x + f.boundingBox.width/2)/fw
          const cy = (f.boundingBox.y + f.boundingBox.height/2)/fh
          const dx = Math.abs(cx - 0.5), dy = Math.abs(cy - 0.5)
          gazeFocus = clamp(1 - Math.sqrt(dx*dx+dy*dy)*2, 0, 1)
        }
      }
    } catch { /* ignore */ }
    // fps estimation
    const dt = ts - lastTs; lastTs = ts
    const fps = dt>0 ? 1000/dt : 0
    // heuristic score: good when light moderate and motion not high
    const normLight = clamp((mean-30)/140, 0, 1) // ~[30..170] best
    const motionPenalty = clamp(motion/40, 0, 1) // larger -> worse
    const heuristic = clamp(0.2 + 0.8*normLight - 0.4*motionPenalty - 0.1*(stdev/64), 0, 1)
    let score = heuristic
    if (gazeFocus>0) score = clamp(0.5*heuristic + 0.5*gazeFocus, 0, 1)
    // EWMA smoothing
    const alpha = 0.15
    ewma = (1-alpha)*ewma + alpha*score
    const trend = clamp(score - ewma, -1, 1)
    const attn = { gaze: clamp(gazeFocus>0? gazeFocus : ewma,0,1), audio: 0, hr: 0 }
    const quality = { light: Math.round(mean), fps: Math.round(fps) }
    ;(postMessage as any)({ type:'pulse', score: ewma, trend, attn, quality })
  } catch {
    // ignore
  } finally {
    try { frame.close() } catch {}
  }
}

export {}
