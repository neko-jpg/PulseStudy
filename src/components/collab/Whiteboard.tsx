"use client"

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import { subscribeRoomState } from '@/lib/realtime'
import { useCollabStore } from '@/store/collab'
import type { BoardStroke as Stroke, BoardShape as Shape, BoardText as TextItem, BoardNote as Sticky } from '@/lib/types'
import { collection, addDoc, onSnapshot, query, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Tool = 'select'|'pen'|'eraser'|'text'|'line'|'rect'|'laser'|'note'|'snap'

export function Whiteboard({ roomId }: { roomId?: string }) {
  const containerRef = useRef<HTMLDivElement|null>(null)
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const overlayRef = useRef<HTMLCanvasElement|null>(null)
  const minimapRef = useRef<HTMLCanvasElement|null>(null)

  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#111827')
  const [size, setSize] = useState(2)
  const [weight, setWeight] = useState<'normal'|'bold'>('normal')
  const [fs, setFs] = useState(false)
  const [gridOn, setGridOn] = useState(false)
  const [locked, setLocked] = useState(false)
  const role = (typeof window !== 'undefined') ? useCollabStore.getState().role : 'viewer'
  const canDraw = !locked || role !== 'viewer'

  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [texts, setTexts] = useState<TextItem[]>([])
  const [notes, setNotes] = useState<Sticky[]>([])
  const historyRef = useRef<{strokes:Stroke[];shapes:Shape[];texts:TextItem[];notes:Sticky[]}[]>([])
  const redoRef = useRef<{strokes:Stroke[];shapes:Shape[];texts:TextItem[];notes:Sticky[]}[]>([])
  const remoteRevRef = useRef<number>(-1)
  const unsubRef = useRef<null | (()=>void)>(null)

  const drawingRef = useRef<{ active:boolean; last?:{x:number;y:number}; draft?:Stroke|null; shapeStart?:{x:number;y:number}|null; pressures?: number[] }>({ active:false, draft:null, shapeStart:null, pressures: [] })
  const selectionRef = useRef<{ kind:'shape'|'line'|'text'|'note'; idx:number; ox:number; oy:number; resize?:boolean }|null>(null)
  const snapRectRef = useRef<{ sx:number; sy:number; ex:number; ey:number }|null>(null)
  const [textbox, setTextbox] = useState<{ x:number; y:number; value:string }|null>(null)
  const [noteEdit, setNoteEdit] = useState<{ idx:number; value:string }|null>(null)
  const clientIdRef = useRef<string>('')
  const liveIdRef = useRef<string|null>(null)
  const liveBufRef = useRef<{ x:number; y:number }[]>([])
  const liveTimerRef = useRef<any>(null)
  const liveStrokesRef = useRef<Record<string, { color:string; size:number; points:{x:number;y:number}[] }>>({})
  const liveCursorsRef = useRef<Record<string, { x:number; y:number; color:string }>>({})
  const cursorTimerRef = useRef<any>(null)
  const [messages, setMessages] = useState<{ id:string; userId:string; text:string; ts:number }[]>([])
  const [chatText, setChatText] = useState('')
  const [progress, setProgress] = useState<{ moduleId?: string; idx?: number }>({})

  // view transform (pan/zoom)
  const viewRef = useRef<{ scale:number; tx:number; ty:number }>({ scale: 1, tx: 0, ty: 0 })
  const panRef = useRef<{ active:boolean; lastX:number; lastY:number }>({ active:false, lastX:0, lastY:0 })
  const panKeyRef = useRef<boolean>(false)
  const MIN_SCALE = 0.5, MAX_SCALE = 3
  const [viewVersion, setViewVersion] = useState(0) // to reflect scale in UI when changed
  function applyView(ctx: CanvasRenderingContext2D){ const v=viewRef.current; ctx.translate(v.tx, v.ty); ctx.scale(v.scale, v.scale) }
  function screenToWorld(sx:number, sy:number){ const v=viewRef.current; return { x:(sx - v.tx)/v.scale, y:(sy - v.ty)/v.scale } }
  function getScreenSize(){ const c=canvasRef.current; if(!c){ return { sw:0, sh:0 } } const dpr=window.devicePixelRatio||1; return { sw: c.width/dpr, sh: c.height/dpr } }
  function clampView(){ const { sw, sh } = getScreenSize(); const v=viewRef.current; let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; const add=(x:number,y:number)=>{ if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y }; for(const s of strokes){ for(const p of (s?.points||[])){ if(p) add(p.x,p.y) } } for(const s of shapes){ if(s){ add(s.x,s.y); add(s.x+s.w,s.y+s.h) } } for(const n of notes){ if(n){ add(n.x,n.y); add(n.x+n.w,n.y+n.h) } } if(!isFinite(minX)){ return } const vw=sw/v.scale, vh=sh/v.scale; const m=40; const cw=maxX-minX, ch=maxY-minY; if (vw >= cw+2*m){ const cx=(minX+maxX)/2; v.tx = -(cx - vw/2) } else { const left=-v.tx, right=left+vw; const minLeft=minX-m, maxRight=maxX+m; if (left<minLeft) v.tx = -minLeft; if (right>maxRight) v.tx = -(maxRight - vw) } if (vh >= ch+2*m){ const cy=(minY+maxY)/2; v.ty = -(cy - vh/2) } else { const top=-v.ty, bottom=top+vh; const minTop=minY-m, maxBottom=maxY+m; if (top<minTop) v.ty = -minTop; if (bottom>maxBottom) v.ty = -(maxBottom - vh) } }
  function zoomAt(sx:number, sy:number, factor:number){ const v=viewRef.current; const old=v.scale; const next=Math.min(MAX_SCALE, Math.max(MIN_SCALE, old*factor)); if (next===old) return; const wx=(sx - v.tx)/old; const wy=(sy - v.ty)/old; v.tx = sx - wx*next; v.ty = sy - wy*next; v.scale = next; clampView(); setViewVersion(x=>x+1); redraw(); clearOverlay() }
  function setScaleAt(sx:number, sy:number, target:number){ const v=viewRef.current; const old=v.scale; const next=Math.min(MAX_SCALE, Math.max(MIN_SCALE, target)); if (next===old) return; const wx=(sx - v.tx)/old; const wy=(sy - v.ty)/old; v.tx = sx - wx*next; v.ty = sy - wy*next; v.scale = next; clampView(); setViewVersion(x=>x+1) }
  function viewCenterScreen(){ const c=canvasRef.current; if(!c) return { sx:0, sy:0 }; const r=c.getBoundingClientRect(); return { sx:r.width/2, sy:r.height/2 } }
  function resetView(){ viewRef.current={ scale:1, tx:0, ty:0 }; setViewVersion(x=>x+1); redraw(); clearOverlay() }

  // multi-touch pinch/drag state
  const pointersRef = useRef<Map<number,{sx:number;sy:number}>>(new Map())
  const pinchRef = useRef<{ active:boolean; startDist:number; startScale:number; lastCx:number; lastCy:number }>({ active:false, startDist:1, startScale:1, lastCx:0, lastCy:0 })

  // history memory policy
  const HISTORY_LIMIT = 80
  const HISTORY_DECIMATE_AFTER = 40
  const DECIMATE_STEP = 2
  function decimatePoints<T extends {x:number;y:number}>(pts: T[] | undefined, step: number): T[] { const a = Array.isArray(pts) ? pts : []; const n=a.length; if (n<=2||step<=1) return a.slice(); const out: T[]=[]; for (let i=0;i<n;i++){ if (i===n-1 || i % step === 0) out.push(a[i]) } return out }
  function pruneHistory(){
    const hist = historyRef.current
    // drop oldest beyond limit
    if (hist.length > HISTORY_LIMIT) hist.splice(0, hist.length - HISTORY_LIMIT)
    // decimate very old snapshots to reduce memory footprint
    const cutoff = Math.max(0, hist.length - HISTORY_DECIMATE_AFTER)
    for (let i=0;i<cutoff;i++){
      const snap = hist[i]
      try {
        snap.strokes = (Array.isArray(snap.strokes)?snap.strokes:[]).map((s:any)=>({ ...s, points: decimatePoints(s.points, DECIMATE_STEP) })) as any
      } catch {}
    }
    // bound redo stack as well
    const redo = redoRef.current
    if (redo.length > HISTORY_LIMIT) redo.splice(0, redo.length - HISTORY_LIMIT)
  }

  // simple Chaikin smoothing for stroke points
  function smoothChaikin(pts: {x:number;y:number}[], iterations=1){
    let out = Array.isArray(pts) ? pts.slice() : []
    for (let it=0; it<iterations; it++){
      if (out.length < 3) break
      const next: {x:number;y:number}[] = [ out[0] ]
      for (let i=0;i<out.length-1;i++){
        const p = out[i], q = out[i+1]
        const Q = { x: 0.75*p.x + 0.25*q.x, y: 0.75*p.y + 0.25*q.y }
        const R = { x: 0.25*p.x + 0.75*q.x, y: 0.25*p.y + 0.75*q.y }
        next.push(Q, R)
      }
      next.push(out[out.length-1])
      out = next
    }
    return out
  }

  // resize helpers
  function doResize() {
    const c = canvasRef.current, parent = containerRef.current
    if (!c || !parent) return
    const dpr = window.devicePixelRatio || 1
    c.style.width = '100%'
    c.style.height = '100%'
    c.width = Math.max(1, Math.floor(parent.clientWidth * dpr))
    c.height = Math.max(1, Math.floor(parent.clientHeight * dpr))
    const ctx = c.getContext('2d')!
    ctx.setTransform(1,0,0,1,0,0)
    ctx.scale(dpr, dpr)
    ensureOverlay()
    redraw()
  }

  // size to container
  useEffect(() => {
    function resize() { requestAnimationFrame(() => requestAnimationFrame(() => doResize())) }
    doResize()
    const ro = new ResizeObserver(resize)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // init client id for realtime operations
  useEffect(() => {
    if (!clientIdRef.current) {
      try {
        const k = 'wb_client_id'
        const saved = localStorage.getItem(k)
        if (saved) clientIdRef.current = saved
        else { const id = `c-${Math.random().toString(36).slice(2,10)}`; clientIdRef.current = id; localStorage.setItem(k, id) }
      } catch { clientIdRef.current = `c-${Math.random().toString(36).slice(2,10)}` }
    }
  }, [])

  // realtime subscribe to room board (excluding strokes)
  useEffect(() => {
    if (!roomId) { if (unsubRef.current) { unsubRef.current(); unsubRef.current=null }; return }
    if (unsubRef.current) { unsubRef.current(); unsubRef.current=null }
    unsubRef.current = subscribeRoomState(roomId, (s) => {
      try { setLocked(!!(s as any).boardLocked) } catch {}
      try {
        const msgs = (s as any).messages
        if (Array.isArray(msgs)) setMessages(msgs.slice(-50))
        const m = (s as any).moduleId; const q = (s as any).qIdx
        setProgress({ moduleId: m, idx: typeof q === 'number' ? q : undefined })
      } catch {}
      const b = (s && s.board) || null
      if (!b) return
      const rev = Number(b.rev ?? 0)
      if (drawingRef.current.active) return // avoid interrupting local drawing
      if (rev <= remoteRevRef.current) return
      remoteRevRef.current = rev
      // apply remote board (strokes are now handled by Firestore)
      try {
        // setStrokes(Array.isArray(b.strokes) ? (b.strokes as any).filter(Boolean) : [])
        setShapes(Array.isArray(b.shapes) ? (b.shapes as any).filter(Boolean) : [])
        setTexts(Array.isArray(b.texts) ? (b.texts as any).filter(Boolean) : [])
        setNotes(Array.isArray(b.notes) ? (b.notes as any).filter(Boolean) : [])
      } catch {}
      // update live strokes overlay
      try {
        const live = (s && (s as any).live && (s as any).live.strokes) || {}
        const map: Record<string, { color:string; size:number; points:{x:number;y:number}[] }> = {}
        for (const key of Object.keys(live||{})){
          const it = (live as any)[key]
          if (!it) continue
          map[key] = { color: it.color, size: it.size, points: Array.isArray(it.points)? it.points.filter(Boolean): [] }
        }
        liveStrokesRef.current = map
        // cursors
        try {
          const curs = (s && (s as any).live && (s as any).live.cursors) || {}
          const cmap: Record<string, { x:number; y:number; color:string }> = {}
          for (const key of Object.keys(curs||{})){
            const it = (curs as any)[key]
            if (!it) continue
            if (typeof it.x === 'number' && typeof it.y === 'number') cmap[key] = { x: it.x, y: it.y, color: String(it.color||'#3b82f6') }
          }
          liveCursorsRef.current = cmap
        } catch {}
        clearOverlay()
      } catch {}
    })
    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current=null } }
  }, [roomId])

  // force resize when fullscreen toggles
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => doResize()))
    return () => cancelAnimationFrame(id)
  }, [fs])

  // NEW: Subscribe to strokes from Firestore subcollection
  useEffect(() => {
    if (!roomId) return;

    const strokesCollection = collection(db, 'rooms', roomId, 'strokes');
    const q = query(strokesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (drawingRef.current.active) return; // Avoid interrupting local drawing

        const newStrokes: Stroke[] = [];
        snapshot.forEach((doc) => {
            // NOTE: The 'timestamp' field is from Firestore server, not part of Stroke type
            const { timestamp, ...strokeData } = doc.data();
            newStrokes.push(strokeData as Stroke);
        });
        setStrokes(newStrokes);
    }, (error) => {
      console.error("Error fetching strokes:", error)
    });

    return () => unsubscribe();
  }, [roomId]);

  // optional: listen to native fullscreen change
  useEffect(() => {
    const onFs = () => doResize()
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const redraw = () => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    ctx.save()
    ctx.setTransform(1,0,0,1,0,0)
    ctx.clearRect(0,0,c.width,c.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,c.width,c.height)
    ctx.restore()
    const dpr = window.devicePixelRatio || 1
    const width = c.width/dpr, height=c.height/dpr
    ctx.save(); applyView(ctx)
    if (gridOn) {
      const v = viewRef.current
      const minX = -v.tx / v.scale
      const minY = -v.ty / v.scale
      const vw = width / v.scale
      const vh = height / v.scale
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'
      ctx.lineWidth = 1
      const startX = Math.floor(minX/25)*25
      const startY = Math.floor(minY/25)*25
      for (let x=startX; x<=minX+vw; x+=25){ ctx.beginPath(); ctx.moveTo(x,minY); ctx.lineTo(x,minY+vh); ctx.stroke() }
      for (let y=startY; y<=minY+vh; y+=25){ ctx.beginPath(); ctx.moveTo(minX,y); ctx.lineTo(minX+vw,y); ctx.stroke() }
    }
    // strokes
    ctx.lineCap='round'
    const safeStrokes = Array.isArray(strokes) ? strokes.filter(Boolean) : []
    for (const sAny of safeStrokes) {
      const s = sAny as any
      const scolor = typeof s?.color === 'string' ? s.color : '#111827'
      const ssize  = Number.isFinite(s?.size) ? s.size : 2
      const pts    = Array.isArray(s?.points) ? s.points.filter(Boolean) : []
      if (pts.length < 2) continue
      ctx.strokeStyle = scolor
      ctx.lineWidth = ssize
      ctx.beginPath()
      const a0 = pts[0]; if (!a0) continue
      ctx.moveTo(a0.x, a0.y)
      for (let i=1;i<pts.length;i++){ const p=pts[i]; if(!p) continue; ctx.lineTo(p.x,p.y) }
      ctx.stroke()
    }
    // shapes (defensive)
    for (const shAny of Array.isArray(shapes) ? shapes.filter(Boolean) : []) {
      const sh = shAny as any
      if (!sh || typeof sh !== 'object' || sh.color == null) continue
      ctx.strokeStyle = typeof sh.color === 'string' ? sh.color : '#111827'
      ctx.lineWidth = Number.isFinite(sh.size) ? sh.size : 1
      if (sh.t==='line'){ ctx.beginPath(); ctx.moveTo(sh.x,sh.y); ctx.lineTo(sh.x+sh.w, sh.y+sh.h); ctx.stroke() }
      else { ctx.strokeRect(sh.x, sh.y, sh.w, sh.h) }
    }
    // notes
    const safeNotes = Array.isArray(notes) ? notes.filter(Boolean) : []
    for (const nAny of safeNotes) {
      const n = nAny as any
      if (!n || typeof n !== 'object') continue
      ctx.fillStyle = typeof n.color === 'string' ? n.color : '#fef08a'
      ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth=1
      const nx = Number.isFinite(n.x)?n.x:0, ny=Number.isFinite(n.y)?n.y:0
      const nw = Number.isFinite(n.w)?n.w:120, nh=Number.isFinite(n.h)?n.h:80
      ctx.fillRect(nx,ny,nw,nh); ctx.strokeRect(nx,ny,nw,nh)
      ctx.fillStyle = '#111827'
      const ts = Math.max(12, Number.isFinite(size)?size:12)
      ctx.font = `${ts}px ${weight==='bold'?'600':'400'} ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`
      ctx.textBaseline = 'top'
      wrapFillText(ctx, String(n.text ?? ''), nx+8, ny+8, nw-16, ts*1.4)
    }
    // texts
    const safeTexts = Array.isArray(texts) ? texts.filter(Boolean) : []
    for (const tAny of safeTexts) {
      const t = tAny as any
      const tcolor = typeof t?.color === 'string' ? t.color : '#111827'
      const tsize  = Number.isFinite(t?.size) ? t.size : 14
      const tw     = t?.weight==='bold'?'600':'400'
      const tx     = Number.isFinite(t?.x)?t.x:0
      const ty     = Number.isFinite(t?.y)?t.y:0
      ctx.fillStyle = tcolor
      ctx.font = `${tsize}px ${tw} ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`
      ctx.textBaseline = 'top'
      wrapFillText(ctx, String(t?.text ?? ''), tx, ty, width - tx - 8, tsize*1.4)
    }
    ctx.restore()
    try { drawMinimap(width, height) } catch {}
  }
  useEffect(() => { redraw() }, [strokes,shapes,texts,notes,gridOn,weight,size])
  // sanitize state defensively (HMR/復元時のnull混入対策)
  useEffect(() => {
    const s = Array.isArray(strokes) ? strokes : []
    if (s.some((x:any)=>!x || !Array.isArray(x.points))) {
      const fixed = s.filter(Boolean).map((x:any)=>({ color: typeof x.color==='string'?x.color:'#111827', size: Number.isFinite(x.size)?x.size:2, points: Array.isArray(x.points)?x.points.filter(Boolean):[] }))
      setStrokes(fixed as any)
    }
  }, [strokes])
  useEffect(() => {
    const arr = Array.isArray(shapes) ? shapes : []
    if (arr.some((x:any)=>!x || x.color==null)) {
      const fixed = arr.filter(Boolean)
      setShapes(fixed as any)
    }
  }, [shapes])
  useEffect(() => {
    const arr = Array.isArray(texts) ? texts : []
    if (arr.some((t:any)=>!t || t.text==null)) {
      const fixed = arr.filter(Boolean).map((t:any)=>({ x:Number.isFinite(t?.x)?t.x:0, y:Number.isFinite(t?.y)?t.y:0, text:String(t?.text??''), color: typeof t?.color==='string'?t.color:'#111827', size: Number.isFinite(t?.size)?t.size:14, weight: t?.weight==='bold'?'bold':'normal' }))
      setTexts(fixed as any)
    }
  }, [texts])

  function pushHistory(){
    historyRef.current.push({
      strokes: JSON.parse(JSON.stringify(strokes)),
      shapes: JSON.parse(JSON.stringify(shapes)),
      texts: JSON.parse(JSON.stringify(texts)),
      notes: JSON.parse(JSON.stringify(notes)),
    })
    pruneHistory()
    redoRef.current = []
  }
  async function syncBoard(partial?: Partial<{ strokes:Stroke[]; shapes:Shape[]; texts:TextItem[]; notes:Sticky[] }>){
    if (!roomId) return
    const board = {
      strokes: partial?.strokes ?? strokes,
      shapes: partial?.shapes ?? shapes,
      texts: partial?.texts ?? texts,
      notes: partial?.notes ?? notes,
    }
    try {
      const body = { action:'set_board', board, baseRev: remoteRevRef.current, clientId: clientIdRef.current }
      const r = await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      if (r.status === 409) {
        // conflict: wait briefly for SSE to catch up, then retry once
        setTimeout(() => { try { void syncBoard() } catch {} }, 200)
      }
    } catch {}
  }
  async function syncAddStroke(stroke: Stroke){
    if (!roomId) return
    try { await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'add_stroke', stroke: { ...stroke, clientId: clientIdRef.current }, clientId: clientIdRef.current }) }) } catch {}
  }
  function undo(){ const prev=historyRef.current.pop(); if(!prev) return; redoRef.current.push({strokes,shapes,texts,notes}); setStrokes(prev.strokes); setShapes(prev.shapes); setTexts(prev.texts); setNotes(prev.notes); syncBoard({ strokes: prev.strokes, shapes: prev.shapes, texts: prev.texts, notes: prev.notes }) }
  function redo(){ const next=redoRef.current.pop(); if(!next) return; historyRef.current.push({strokes,shapes,texts,notes}); setStrokes(next.strokes); setShapes(next.shapes); setTexts(next.texts); setNotes(next.notes); syncBoard({ strokes: next.strokes, shapes: next.shapes, texts: next.texts, notes: next.notes }) }
  function clearAll(){ pushHistory(); const empty: Stroke[]=[]; const es:Shape[]=[]; const et:TextItem[]=[]; const en:Sticky[]=[]; setStrokes(empty); setShapes(es); setTexts(et); setNotes(en); syncBoard({ strokes: empty, shapes: es, texts: et, notes: en }) }
  async function clearRemote(){ if(!roomId) return; try { await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'clear', clientId: clientIdRef.current }) }) } catch {} }
  async function toggleLock(){ if(!roomId) return; try { const r = await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'lock', on: !locked, clientId: clientIdRef.current }) }); if(r.ok){ const js=await r.json().catch(()=>({})); setLocked(!!js.locked) } } catch {} }

  function getPos(e:React.PointerEvent){ const rect=(e.target as HTMLElement).getBoundingClientRect(); const sx=e.clientX-rect.left, sy=e.clientY-rect.top; return screenToWorld(sx,sy) }
  function getScreen(e:React.PointerEvent){ const rect=(e.target as HTMLElement).getBoundingClientRect(); return { sx:e.clientX-rect.left, sy:e.clientY-rect.top } }
  async function onPointerDown(e:React.PointerEvent<HTMLCanvasElement>){
    e.preventDefault()
    try { (e.target as any).setPointerCapture?.(e.pointerId) } catch {}
    // pan with space or middle button
    const { sx, sy } = getScreen(e)
    if (panKeyRef.current || e.button===1){ panRef.current={active:true,lastX:sx,lastY:sy}; return }
    // track pointers for pinch gesture
    pointersRef.current.set(e.pointerId, { sx, sy })
    if (pointersRef.current.size === 2){
      const arr = Array.from(pointersRef.current.values())
      const dx = arr[1].sx - arr[0].sx, dy = arr[1].sy - arr[0].sy
      const dist = Math.max(1, Math.hypot(dx, dy))
      const cx = (arr[0].sx + arr[1].sx)/2, cy=(arr[0].sy + arr[1].sy)/2
      pinchRef.current = { active:true, startDist: dist, startScale: viewRef.current.scale, lastCx: cx, lastCy: cy }
    }
    if (tool==='pen'||tool==='eraser'){
      if (!canDraw) return
      const p=getPos(e); const baseSize = tool==='eraser'?Math.max(10,size*6):size; const stroke:Stroke={color: tool==='eraser'?'#ffffff':color, size: baseSize, points:[p]}; drawingRef.current={active:true,last:p,draft:stroke,shapeStart:null, pressures:[Math.max(0, Math.min(1, (e as any).pressure ?? 0.5))]}
      if (roomId){
        try {
          const lid = `${clientIdRef.current}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,5)}`
          liveIdRef.current = lid
          liveBufRef.current = [p]
          await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'start_live', strokeId: lid, clientId: clientIdRef.current, color: stroke.color, size: stroke.size }) })
        } catch {}
      }
    } else if (tool==='text'){
      if (!canDraw) return
      const p=getPos(e); setTextbox({ x:p.x, y:p.y, value:'' })
    } else if (tool==='note'){
      if (!canDraw) return
      const p=getPos(e); pushHistory();
      setNotes(arr=>{ const next=[...arr,{x:p.x,y:p.y,w:180,h:120,color:'#fef08a',text:'メモ'}]; syncBoard({ notes: next }); return next })
    } else if (tool==='line'||tool==='rect'){
      if (!canDraw) return
      drawingRef.current.shapeStart = getPos(e)
    } else if (tool==='select'){
      const p=getPos(e)
      // note first (resize corner)
      for (let i=notes.length-1;i>=0;i--){ const n=notes[i]; if (p.x>=n.x&&p.x<=n.x+n.w&&p.y>=n.y&&p.y<=n.y+n.h){ const nearBR=p.x>=n.x+n.w-12 && p.y>=n.y+n.h-12; selectionRef.current={kind:'note',idx:i,ox:p.x-n.x,oy:p.y-n.y,resize:nearBR}; return } }
      // text bbox
      const ctx=canvasRef.current?.getContext('2d')!
      if (ctx){
        for (let i=texts.length-1;i>=0;i--){ const t=texts[i]; ctx.font=`${t.size}px ${t.weight==='bold'?'600':'400'} ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`; const w=ctx.measureText(t.text).width; const h=t.size*1.4; if (p.x>=t.x&&p.x<=t.x+w&&p.y>=t.y&&p.y<=t.y+h){ selectionRef.current={kind:'text',idx:i,ox:p.x-t.x,oy:p.y-t.y}; return } }
      }
      // shapes
      for (let i=shapes.length-1;i>=0;i--){ const s=shapes[i]; if (s.t==='rect'){ if (p.x>=s.x&&p.x<=s.x+s.w&&p.y>=s.y&&p.y<=s.y+s.h){ selectionRef.current={kind:'shape',idx:i,ox:p.x-s.x,oy:p.y-s.y}; return } } else { if (pointSegDist(p.x,p.y,s.x,s.y,s.x+s.w,s.y+s.h)<=6){ selectionRef.current={kind:'line',idx:i,ox:p.x-s.x,oy:p.y-s.y}; return } } }
    } else if (tool==='snap'){
      const p=getPos(e); snapRectRef.current={ sx:p.x, sy:p.y, ex:p.x, ey:p.y }
    } else if (tool==='laser'){
      const p=getPos(e); addLaserDot(p.x,p.y)
    }
  }
  function onPointerMove(e:React.PointerEvent<HTMLCanvasElement>){
    e.preventDefault();
    const { sx, sy } = getScreen(e)
    // update pointer position for pinch tracking
    if (pointersRef.current.has(e.pointerId)) pointersRef.current.set(e.pointerId, { sx, sy })
    const p = screenToWorld(sx, sy)
    if (panRef.current.active){ const { sx, sy } = getScreen(e); const dx=sx-panRef.current.lastX, dy=sy-panRef.current.lastY; panRef.current.lastX=sx; panRef.current.lastY=sy; viewRef.current.tx += dx; viewRef.current.ty += dy; clampView(); redraw(); clearOverlay(); return }
    // pinch zoom + two-finger pan
    if (pinchRef.current.active && pointersRef.current.size>=2){
      const arr = Array.from(pointersRef.current.values()).slice(0,2)
      const dx = arr[1].sx - arr[0].sx, dy = arr[1].sy - arr[0].sy
      const dist = Math.max(1, Math.hypot(dx, dy))
      const cx = (arr[0].sx + arr[1].sx)/2, cy=(arr[0].sy + arr[1].sy)/2
      const pr = pinchRef.current
      // apply pan by center delta first
      viewRef.current.tx += (cx - pr.lastCx)
      viewRef.current.ty += (cy - pr.lastCy)
      pr.lastCx = cx; pr.lastCy = cy
      // apply scale around current center
      const target = pr.startScale * (dist / pr.startDist)
      setScaleAt(cx, cy, target)
      clampView(); redraw(); clearOverlay();
      return
    }

    // send presence cursor (throttled)
    if (roomId && clientIdRef.current){
      if (!cursorTimerRef.current){
        const payload = { action:'cursor', clientId: clientIdRef.current, x: p.x, y: p.y, color }
        cursorTimerRef.current = setTimeout(async () => {
          cursorTimerRef.current = null
          try { await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }) } catch {}
        }, 80)
      }
    }

    // real-time stroke preview for pen/eraser using overlay (no state churn)
    if (tool === 'pen' || tool === 'eraser') {
      if (!drawingRef.current.active || !drawingRef.current.draft) return;
      const d = drawingRef.current.draft;
      if (!Array.isArray(d.points)) d.points = [];
      d.points.push(p);
      // collect pressure sample
      const pr = Math.max(0, Math.min(1, (e as any).pressure ?? 0.5))
      if (!Array.isArray(drawingRef.current.pressures)) drawingRef.current.pressures = []
      drawingRef.current.pressures!.push(pr)
      if (roomId && liveIdRef.current){
        liveBufRef.current.push(p)
        if (!liveTimerRef.current){
          liveTimerRef.current = setTimeout(async () => {
            const pts = liveBufRef.current.splice(0)
            const sid = liveIdRef.current
            liveTimerRef.current = null
            if (sid && pts.length>0){ try { await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'live_points', strokeId: sid, points: pts }) }) } catch {} }
          }, 50)
        }
      }
      drawOverlay((ctx) => {
        if (d.points.length < 2) return;
        ctx.strokeStyle = d.color;
        const lastPressure = drawingRef.current.pressures?.[drawingRef.current.pressures!.length-1] ?? 0.5
        const widthScale = tool==='eraser'? 1 : (0.5 + 0.7 * lastPressure)
        ctx.lineWidth = d.size * widthScale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(d.points[0].x, d.points[0].y);
        for (let i = 1; i < d.points.length; i++) {
          const point = d.points[i];
          if (point) ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      });
      return;
    }

    if (tool==='laser'){ addLaserDot(p.x,p.y); return }
    if (tool==='select' && selectionRef.current){ const sel=selectionRef.current; if (sel.kind==='note'){ const i=sel.idx; if (sel.resize){ setNotes(arr=>arr.map((n,idx)=> idx!==i?n:{...n, w:Math.max(60,p.x-n.x), h:Math.max(40,p.y-n.y)})) } else { setNotes(arr=>arr.map((n,idx)=> idx!==i?n:{...n, x:p.x-sel.ox, y:p.y-sel.oy})) } return } if (sel.kind==='text'){ const i=sel.idx; setTexts(arr=>arr.map((t,idx)=> idx!==i?t:{...t, x:p.x-sel.ox, y:p.y-sel.oy})); return } if (sel.kind==='shape'||sel.kind==='line'){ const i=sel.idx; setShapes(arr=>arr.map((s,idx)=> idx!==i?s:{...s, x:p.x-sel.ox, y:p.y-sel.oy})); return } }
    if (tool==='line'||tool==='rect'){
      drawOverlay((ctx)=>{ const start=drawingRef.current.shapeStart; if(!start) return; const sx=gridOn?Math.round(start.x/5)*5:start.x; const sy=gridOn?Math.round(start.y/5)*5:start.y; const ex=gridOn?Math.round(p.x/5)*5:p.x; const ey=gridOn?Math.round(p.y/5)*5:p.y; ctx.strokeStyle=color; ctx.lineWidth=size; if (tool==='line'){ ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke() } else { ctx.strokeRect(sx,sy,ex-sx,ey-sy) } })
      return
    }
    if (tool==='snap' && snapRectRef.current){ const r=snapRectRef.current; r.ex=p.x; r.ey=p.y; drawOverlay((ctx)=>{ ctx.setLineDash([6,4]); ctx.strokeStyle='#111827'; ctx.strokeRect(r.sx,r.sy,r.ex-r.sx,r.ey-r.sy); ctx.setLineDash([]) }); return }
  }
  async function onPointerUp(){
    // finalize pen/eraser stroke and clear overlay preview
    if (tool==='pen'||tool==='eraser'){ clearOverlay() }
    if (tool==='line'||tool==='rect'){
      const start=drawingRef.current.shapeStart; if (start){ pushHistory(); const last=drawingRef.current.last||start; const sx=gridOn?Math.round(start.x/5)*5:start.x; const sy=gridOn?Math.round(start.y/5)*5:start.y; const ex=gridOn?Math.round(last.x/5)*5:last.x; const ey=gridOn?Math.round(last.y/5)*5:last.y; const w=ex-sx, h=ey-sy; const newShape={ t:tool, x:sx, y:sy, w, h, color, size } as Shape; setShapes(prev=>{ const next=[...prev,newShape]; syncBoard({ shapes: next }); return next }); clearOverlay() }
    } else if (tool==='select' && selectionRef.current){ pushHistory(); selectionRef.current=null; syncBoard() }
    else if (tool==='snap' && snapRectRef.current){ const r=snapRectRef.current; const sx=Math.min(r.sx,r.ex), sy=Math.min(r.sy,r.ey); const w=Math.abs(r.ex-r.sx), h=Math.abs(r.ey-r.sy); snapshotToTakeaway(sx,sy,w,h); snapRectRef.current=null; clearOverlay() }
    else if (drawingRef.current.draft){ const stroke = drawingRef.current.draft!; if (Array.isArray(stroke.points) && stroke.points.length>3){ try { stroke.points = smoothChaikin(stroke.points, 1) } catch {} } // finalize dynamic width by average pressure (approx)
      if (Array.isArray(drawingRef.current.pressures) && drawingRef.current.pressures.length>0){ const avg = drawingRef.current.pressures.reduce((a,b)=>a+b,0)/drawingRef.current.pressures.length; if (tool!=='eraser'){ stroke.size = Math.max(1, Math.round(stroke.size * (0.5 + 0.7 * avg))) } }
      pushHistory(); setStrokes(prev=>[...prev, stroke]);
      if (roomId && liveIdRef.current){
        const sid = liveIdRef.current
        const remain = liveBufRef.current.splice(0)
        if (remain.length>0){ try { await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'live_points', strokeId: sid, points: remain }) }) } catch {} }
        try { await fetch(`/api/rooms/${roomId}/board`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'end_live', strokeId: sid }) }) } catch {}
      } else if (roomId) {
        // NEW: Write stroke to Firestore subcollection
        try {
          const strokeWithTimestamp = { ...stroke, timestamp: serverTimestamp() };
          await addDoc(collection(db, 'rooms', roomId, 'strokes'), strokeWithTimestamp);
        } catch (error) {
            console.error("Failed to save stroke:", error);
        }
      }
    }
    drawingRef.current={active:false,draft:null,shapeStart:null}
    liveIdRef.current=null
    if (panRef.current.active){ panRef.current.active=false }
    // stop tracking for pinch if fewer than 2 pointers remain
    // Note: pointerId is not available here, caller passes bound handler; clear stale pointers on leave/cancel below
    if (cursorTimerRef.current){ try { clearTimeout(cursorTimerRef.current) } catch {}; cursorTimerRef.current=null }
  }

  function onDoubleClick(e:React.MouseEvent<HTMLCanvasElement>){
    const p = getPos(e as any)
    for (let i=notes.length-1;i>=0;i--){ const n=notes[i]; if (p.x>=n.x&&p.x<=n.x+n.w&&p.y>=n.y&&p.y<=n.y+n.h){ setNoteEdit({ idx:i, value:n.text }); return } }
  }

  // overlay helpers
  function ensureOverlay(){ const c=canvasRef.current, o=overlayRef.current; if(!c||!o) return; o.width=c.width; o.height=c.height; const ctx=o.getContext('2d')!; ctx.setTransform(1,0,0,1,0,0); const dpr=window.devicePixelRatio||1; ctx.scale(dpr,dpr) }
  function drawRemoteLive(ctx: CanvasRenderingContext2D){
    ctx.save();
    // strokes
    ctx.lineCap='round'
    const all = liveStrokesRef.current
    for (const k of Object.keys(all)){
      const s=all[k]; const pts=s?.points||[]; if(pts.length<2) continue; ctx.strokeStyle=s.color; ctx.lineWidth=s.size; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for(let i=1;i<pts.length;i++){ const p=pts[i]; if(p) ctx.lineTo(p.x,p.y) } ctx.stroke()
    }
    // cursors
    for (const k of Object.keys(liveCursorsRef.current)){
      const c = liveCursorsRef.current[k]; if(!c) continue
      if (clientIdRef.current && k.startsWith(clientIdRef.current)) continue
      const r = 6
      ctx.beginPath(); ctx.fillStyle = c.color || '#3b82f6'; ctx.arc(c.x, c.y, r, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; ctx.arc(c.x, c.y, r+1.5, 0, Math.PI*2); ctx.stroke()
    }
    ctx.restore()
  }
  function drawOverlay(draw:(ctx:CanvasRenderingContext2D)=>void){ ensureOverlay(); const o=overlayRef.current; if(!o) return; const ctx=o.getContext('2d')!; ctx.clearRect(0,0,o.width,o.height); ctx.save(); applyView(ctx); draw(ctx); drawRemoteLive(ctx); ctx.restore() }
  function clearOverlay(){ const o=overlayRef.current; if(!o) return; const ctx=o.getContext('2d')!; ctx.clearRect(0,0,o.width,o.height); ctx.save(); applyView(ctx); drawRemoteLive(ctx); ctx.restore() }

  // laser
  const laserDotsRef = useRef<{x:number;y:number;at:number}[]>([])
  const rafRef = useRef<number|null>(null)
  function addLaserDot(x:number,y:number){ laserDotsRef.current.push({x,y,at:Date.now()}); if(!rafRef.current) rafRef.current=requestAnimationFrame(stepLaser) }
  function stepLaser(){ const o=overlayRef.current; if(!o){ rafRef.current=null; return } ensureOverlay(); const ctx=o.getContext('2d')!; const now=Date.now(), life=1500; laserDotsRef.current=laserDotsRef.current.filter(d=>now-d.at<life); ctx.clearRect(0,0,o.width,o.height); ctx.save(); applyView(ctx); drawRemoteLive(ctx); for(const d of laserDotsRef.current){ const t=(now-d.at)/life; const alpha=Math.max(0,1-t); ctx.beginPath(); ctx.fillStyle=`rgba(239,68,68,${alpha})`; ctx.arc(d.x,d.y,8,0,Math.PI*2); ctx.fill() } ctx.restore(); if(laserDotsRef.current.length>0) rafRef.current=requestAnimationFrame(stepLaser); else rafRef.current=null }

  // minimap helpers
  function drawMinimap(sw:number, sh:number){
    const m=minimapRef.current, c=canvasRef.current; if(!m||!c) return
    const dpr=window.devicePixelRatio||1
    const W=140, H=100; m.style.width=`${W}px`; m.style.height=`${H}px`; m.width=Math.floor(W*dpr); m.height=Math.floor(H*dpr)
    const ctx=m.getContext('2d')!; ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H); ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(0,0,W,H); ctx.strokeStyle='#e5e7eb'; ctx.strokeRect(0,0,W,H)
    // compute content bounds
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; const add=(x:number,y:number)=>{ if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y }
    for(const s of strokes){ const pts=(s?.points||[]); for(const p of pts){ if(p) add(p.x,p.y) } }
    for(const s of shapes){ if(s){ add(s.x,s.y); add(s.x+s.w, s.y+s.h) } }
    for(const n of notes){ if(n){ add(n.x,n.y); add(n.x+n.w, n.y+n.h) } }
    if(!isFinite(minX)||!isFinite(minY)||!isFinite(maxX)||!isFinite(maxY)){ ctx.fillStyle='#999'; ctx.font='12px ui-sans-serif'; ctx.fillText('No content', 8, 14); return }
    const cw=maxX-minX, ch=maxY-minY; const sx=W/(cw||1), sy=H/(ch||1); const s=Math.min(sx,sy); const ox=(W-cw*s)/2, oy=(H-ch*s)/2
    // content rect
    ctx.strokeStyle='#9ca3af'; ctx.strokeRect(ox,oy,cw*s,ch*s)
    // viewport
    const v=viewRef.current; const vw=sw/v.scale, vh=sh/v.scale; const vx=( -v.tx - minX )*s + ox, vy=( -v.ty - minY )*s + oy
    ctx.strokeStyle='#2563eb'; ctx.strokeRect(vx,vy,vw*s,vh*s)
  }

  // utils
  function pointSegDist(px:number,py:number,x1:number,y1:number,x2:number,y2:number){ const A=px-x1,B=py-y1,C=x2-x1,D=y2-y1; const dot=A*C+B*D; const len=C*C+D*D; let t=len?dot/len:-1; t=Math.max(0,Math.min(1,t)); const xx=x1+t*C, yy=y1+t*D; const dx=px-xx, dy=py-yy; return Math.sqrt(dx*dx+dy*dy) }
  async function snapshotToTakeaway(x:number,y:number,w:number,h:number){ if(w<4||h<4) return; const base=canvasRef.current; if(!base) return; const dpr=window.devicePixelRatio||1; const tmp=document.createElement('canvas'); tmp.width=Math.max(1,Math.floor(w*dpr)); tmp.height=Math.max(1,Math.floor(h*dpr)); const ctx=tmp.getContext('2d')!; ctx.drawImage(base, Math.floor(x*dpr), Math.floor(y*dpr), Math.floor(w*dpr), Math.floor(h*dpr), 0,0, Math.floor(w*dpr), Math.floor(h*dpr)); const dataUrl=tmp.toDataURL('image/png'); try{ if(roomId){ await fetch(`/api/rooms/${roomId}/takeaway`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:dataUrl })}); track({ name:'room_snapshot_takeaway', props:{ roomId, w, h } }) } else { const a=document.createElement('a'); a.href=dataUrl; a.download='snapshot.png'; a.click() } } catch{}
  }

  useEffect(()=>{ const onKeyDown=(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){ e.preventDefault(); if(e.shiftKey) redo(); else undo(); return } if((e.ctrlKey||e.metaKey)&&e.key==='0'){ e.preventDefault(); viewRef.current={ scale:1, tx:0, ty:0 }; redraw(); clearOverlay(); return } if(e.key==='Escape'&&fs){ setFs(false); return } if(e.key.toLowerCase()==='n'){ setTool('note'); return } if(e.key.toLowerCase()==='s'){ setTool('snap'); return } if(e.key.toLowerCase()==='b'){ setWeight(w=>w==='bold'?'normal':'bold'); return } if(e.code==='Space'){ panKeyRef.current=true } }; const onKeyUp=(e:KeyboardEvent)=>{ if(e.code==='Space'){ panKeyRef.current=false } }; window.addEventListener('keydown',onKeyDown); window.addEventListener('keyup',onKeyUp); return ()=>{ window.removeEventListener('keydown',onKeyDown); window.removeEventListener('keyup',onKeyUp) } },[fs,strokes,texts])

  function toggleFullscreen(){ setFs(v=>{ const next=!v; track({ name:'room_board_fullscreen_toggle', props:{ on: next } }); return next }) }

  return (
    <div ref={containerRef} className={`relative ${fs ? 'fixed inset-0 z-50 bg-background' : ''}`} data-fullscreen={fs || undefined}>
      <button className="absolute right-2 top-2 tool-button" aria-pressed={fs} onClick={toggleFullscreen}>{fs ? '↙' : '⤢'}</button>
      <div className="absolute left-2 top-2 flex items-center gap-2 bg-white/90 rounded px-2 py-2 shadow" role="toolbar" aria-label="ホワイトボードツール">
        <button className={`tool-button ${tool==='select'?'active':''}`} onClick={()=>setTool('select')} title="選択">↖</button>
        <button className={`tool-button ${tool==='pen'?'active':''}`} onClick={()=>setTool('pen')} title="ペン">✏️</button>
        <button className={`tool-button ${tool==='eraser'?'active':''}`} onClick={()=>setTool('eraser')} title="消しゴム">⌫</button>
        <button className={`tool-button ${tool==='text'?'active':''}`} onClick={()=>setTool('text')} title="テキスト">T</button>
        <button className={`tool-button ${tool==='line'?'active':''}`} onClick={()=>setTool('line')} title="直線">／</button>
        <button className={`tool-button ${tool==='rect'?'active':''}`} onClick={()=>setTool('rect')} title="長方形">▭</button>
        <button className={`tool-button ${tool==='laser'?'active':''}`} onClick={()=>setTool('laser')} title="レーザーポインタ">●</button>
        <button className={`tool-button ${tool==='note'?'active':''}`} onClick={()=>setTool('note')} title="付箋">📝</button>
        <button className={`tool-button ${tool==='snap'?'active':''}`} onClick={()=>setTool('snap')} title="スナップショット">⧉</button>
        <div className="flex items-center gap-1 ml-2">
          {['#111827','#ef4444','#10b981','#3b82f6','#f59e0b'].map((c)=>(
            <button key={c} className="w-5 h-5 rounded-full border" style={{backgroundColor:c, outline: color===c?'2px solid #000':undefined}} onClick={()=>setColor(c)} aria-label={`色 ${c}`} />
          ))}
        </div>
        <select className="ml-2 border rounded px-1 py-0.5 text-sm" value={size} onChange={(e)=>setSize(Number(e.target.value))} aria-label="太さ/文字サイズ">
          {[2,3,4,6,8].map(n=> <option key={n} value={n}>{n}px</option>)}
        </select>
        <select className="ml-2 border rounded px-1 py-0.5 text-sm" value={weight} onChange={(e)=>setWeight(e.target.value as any)} aria-label="文字の太さ">
          <option value="normal">Regular</option>
          <option value="bold">Bold</option>
        </select>
        <label className="ml-2 text-xs flex items-center gap-1"><input type="checkbox" checked={gridOn} onChange={(e)=>setGridOn(e.target.checked)} />グリッド</label>
        <div className="ml-2 flex items-center gap-1">
          <button className="tool-button" onClick={undo} title="Undo">↺</button>
          <button className="tool-button" onClick={redo} title="Redo">↻</button>
          {roomId ? (
            <>
              <button className="tool-button" onClick={clearRemote} title="クリア（サーバ）">🗑</button>
              <button className="tool-button" onClick={toggleLock} title={locked? 'ロック解除' : 'ロック'} aria-pressed={locked}>{locked? '🔒' : '🔓'}</button>
            </>
          ) : (
            <button className="tool-button" onClick={clearAll} title="クリア">🗑</button>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' as any, WebkitTapHighlightColor: 'transparent' as any }}
        onWheel={(e)=>{ e.preventDefault(); const rect=(e.target as HTMLElement).getBoundingClientRect(); const sx=e.clientX-rect.left, sy=e.clientY-rect.top; const f = (e.ctrlKey||e.metaKey) ? Math.exp(-e.deltaY*0.001) : (e.deltaY<0?1.05:0.95); zoomAt(sx,sy,f) }}
        onPointerDown={(e)=>{ onPointerDown(e); }}
        onPointerMove={(e)=>{ drawingRef.current.last=getPos(e); onPointerMove(e) }}
        onPointerUp={(e)=>{ // remove from pinch tracking
          pointersRef.current.delete(e.pointerId); onPointerUp()
        }}
        onPointerLeave={(e)=>{ pointersRef.current.delete(e.pointerId); onPointerUp() }}
        onPointerCancel={(e)=>{ pointersRef.current.delete(e.pointerId); onPointerUp() }}
        onContextMenu={(e)=>e.preventDefault()}
        onDoubleClick={onDoubleClick}
      />
      <canvas ref={overlayRef} className="w-full h-full block absolute inset-0 pointer-events-none" />
      {locked && (
        <div className="absolute left-2 top-14 text-xs bg-amber-100 text-amber-800 border border-amber-300 rounded px-2 py-0.5 shadow">
          ボードはロック中（閲覧のみ）
        </div>
      )}
      <canvas ref={minimapRef} className="absolute right-2 bottom-2 rounded shadow border bg-white/90 pointer-events-auto" onClick={(e)=>{ const m=minimapRef.current; const c=canvasRef.current; if(!m||!c) return; const rect=m.getBoundingClientRect(); const mx=e.clientX-rect.left, my=e.clientY-rect.top; const dpr=window.devicePixelRatio||1; const sw=c.width/dpr, sh=c.height/dpr; const b=(function(){ let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; const add=(x:number,y:number)=>{ if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y }; for(const s of strokes){ for(const p of (s?.points||[])){ if(p) add(p.x,p.y) } } for(const s of shapes){ if(s){ add(s.x,s.y); add(s.x+s.w,s.y+s.h) } } for(const n of notes){ if(n){ add(n.x,n.y); add(n.x+n.w,n.y+n.h) } } if(!isFinite(minX)) return null; return {minX,minY,maxX,maxY}; })(); if(!b) return; const W=Number.parseFloat(getComputedStyle(m).width); const H=Number.parseFloat(getComputedStyle(m).height); const cw=b.maxX-b.minX, ch=b.maxY-b.minY; const sx=W/(cw||1), sy=H/(ch||1); const s=Math.min(sx,sy); const ox=(W-cw*s)/2, oy=(H-ch*s)/2; const wx=(mx-ox)/s + b.minX; const wy=(my-oy)/s + b.minY; viewRef.current.tx = -(wx - (sw/2))*viewRef.current.scale; viewRef.current.ty = -(wy - (sh/2))*viewRef.current.scale; redraw(); clearOverlay(); }} />
      {/* Zoom controls */}
      <div className="absolute right-2 top-12 flex items-center gap-1 bg-white/90 rounded px-2 py-1 shadow" role="group" aria-label="ズームコントロール">
        <button className="tool-button" title="ズームアウト" aria-label="ズームアウト" onClick={()=>{ const {sx,sy}=viewCenterScreen(); zoomAt(sx,sy,0.9) }}>−</button>
        <button className="tool-button" title="ズームイン" aria-label="ズームイン" onClick={()=>{ const {sx,sy}=viewCenterScreen(); zoomAt(sx,sy,1.1) }}>＋</button>
        <button className="tool-button" title="リセット" aria-label="リセット" onClick={()=>resetView()}>{Math.round(viewRef.current.scale*100)}%</button>
      </div>
      {textbox && (
        <div style={{ position:'absolute', left:textbox.x, top:textbox.y }} className="bg-white border rounded shadow p-1">
          <input autoFocus className="outline-none" placeholder="テキスト" value={textbox.value} onChange={(e)=>setTextbox({...textbox, value:e.target.value})} onKeyDown={(e)=>{ if(e.key==='Enter') commitText(); if(e.key==='Escape') setTextbox(null) }} onBlur={commitText} />
        </div>
      )}
      {noteEdit && notes[noteEdit.idx] && (
        <div style={{ position:'absolute', left: notes[noteEdit.idx].x+8, top: notes[noteEdit.idx].y+8, width: notes[noteEdit.idx].w-16 }} className="bg-white border rounded shadow p-1">
          <textarea autoFocus className="w-full outline-none" rows={3} value={noteEdit.value} onChange={(e)=>setNoteEdit({ ...noteEdit, value:e.target.value })} onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); commitNoteEdit() } if(e.key==='Escape'){ setNoteEdit(null) } }} onBlur={commitNoteEdit} />
        </div>
      )}

      {/* Chat panel */}
      <div className="absolute bottom-2 right-2 w-80 bg-white/95 rounded-lg shadow border text-slate-800">
        <div className="px-3 py-2 border-b text-xs text-slate-600 flex items-center justify-between">
          <div>チャット</div>
          {progress?.moduleId && typeof progress.idx === 'number' && (
            <div className="text-[10px] bg-slate-200 rounded px-1 py-0.5">{progress.moduleId} #{(progress.idx as number)+1}</div>
          )}
        </div>
        <div className="max-h-40 overflow-y-auto px-3 py-2 space-y-1">
          {messages.map(m => (
            <div key={m.id} className={`text-sm ${m.userId===clientIdRef.current?'text-blue-700':'text-slate-800'}`}>{m.text}</div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-2 border-t">
          <input className="flex-1 border rounded px-2 py-1 text-sm" placeholder="メッセージを入力" value={chatText} onChange={(e)=>setChatText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); (async()=>{ if(roomId && chatText.trim()){ const t=chatText.trim(); setChatText(''); try{ await fetch(`/api/rooms/${roomId}/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: clientIdRef.current||'me', text: t }) }) }catch{} } })() } }} />
          <button className="text-sm px-2 py-1 bg-slate-800 text-white rounded" onClick={()=>{ (async()=>{ if(roomId && chatText.trim()){ const t=chatText.trim(); setChatText(''); try{ await fetch(`/api/rooms/${roomId}/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: clientIdRef.current||'me', text: t }) }) }catch{} } })() }}>送信</button>
        </div>
      </div>
    </div>
  )

  function commitText(){ if(!textbox) return; const v=textbox.value.trim(); if(v){ pushHistory(); setTexts(arr=>{ const next=[...arr,{ x:textbox.x, y:textbox.y, text:v, color, size, weight }]; syncBoard({ texts: next }); return next }) } setTextbox(null) }
  function commitNoteEdit(){ if(!noteEdit) return; pushHistory(); setNotes(arr=>{ const next=arr.map((n,i)=> i!==noteEdit.idx? n : { ...n, text: noteEdit.value }); syncBoard({ notes: next }); return next }); setNoteEdit(null) }
}

function wrapFillText(ctx:CanvasRenderingContext2D, text:string, x:number, y:number, maxWidth:number, lineHeight:number){
  const words = text.split(/\s+/); let line=''; let yy=y
  for(let n=0;n<words.length;n++){ const test=line+(line?' ':'')+words[n]; const w=ctx.measureText(test).width; if(w>maxWidth && n>0){ ctx.fillText(line,x,yy); line=words[n]; yy+=lineHeight } else { line=test } }
  ctx.fillText(line,x,yy)
}
