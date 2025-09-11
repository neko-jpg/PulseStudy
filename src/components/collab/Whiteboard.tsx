"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useCollabStore } from '@/store/collab'
import type { BoardStroke as Stroke, BoardShape as Shape, BoardText as TextItem, BoardNote as Sticky } from '@/lib/types'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, doc, runTransaction, updateDoc } from 'firebase/firestore'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Tool = 'select'|'pen'|'eraser'|'text'|'line'|'rect'|'laser'|'note'|'snap'

export function Whiteboard({ roomId }: { roomId?: string }) {
  const containerRef = useRef<HTMLDivElement|null>(null)
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const overlayRef = useRef<HTMLCanvasElement|null>(null)

  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#111827')
  const [size, setSize] = useState(2)
  const [weight, setWeight] = useState<'normal'|'bold'>('normal')

  const [strokes, setStrokes] = useState<Map<string, Stroke>>(new Map())
  const [shapes, setShapes] = useState<Map<string, Shape>>(new Map())
  const [texts, setTexts] = useState<Map<string, TextItem>>(new Map())
  const [notes, setNotes] = useState<Map<string, Sticky>>(new Map())

  const [textbox, setTextbox] = useState<{ x:number; y:number; value:string }|null>(null)

  const drawingRef = useRef<{ active:boolean; draft?:Partial<Stroke>|Partial<Shape>; shapeStart?:{x:number;y:number}; }>({ active:false })
  const clientIdRef = useRef<string>('')

  const [viewVersion, setViewVersion] = useState(0)
  const viewRef = useRef<{ scale:number; tx:number; ty:number }>({ scale: 1, tx: 0, ty: 0 })
  function applyView(ctx: CanvasRenderingContext2D){ const v=viewRef.current; ctx.translate(v.tx, v.ty); ctx.scale(v.scale, v.scale) }
  function screenToWorld(sx:number, sy:number){ const v=viewRef.current; return { x:(sx - v.tx)/v.scale, y:(sy - v.ty)/v.scale } }

  function doResize() {
    const c = canvasRef.current, parent = containerRef.current; if (!c || !parent) return
    const dpr = window.devicePixelRatio || 1;
    c.style.width = '100%'; c.style.height = '100%';
    c.width = Math.floor(parent.clientWidth * dpr); c.height = Math.floor(parent.clientHeight * dpr)
    const ctx = c.getContext('2d')!; ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr)
    ensureOverlay(); redraw();
  }

  useEffect(() => {
    function resize() { requestAnimationFrame(doResize) }
    doResize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { if (!clientIdRef.current) clientIdRef.current = `c-${Math.random().toString(36).slice(2,10)}` }, [])

  useEffect(() => {
    if (!roomId) return;
    const itemTypes = ['strokes', 'shapes', 'texts', 'notes'];
    const setters: any = { strokes: setStrokes, shapes: setShapes, texts: setTexts, notes: setNotes };

    const unsubscribers = itemTypes.map(type => {
        return onSnapshot(query(collection(db, `rooms/${roomId}/${type}`), orderBy("createdAt", "asc")), (snapshot) => {
            setters[type]((prev: Map<string, any>) => {
                const newMap = new Map(prev);
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'removed') newMap.delete(change.doc.id);
                    else newMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
                });
                return newMap;
            });
        });
    });
    return () => unsubscribers.forEach(unsub => unsub());
  }, [roomId]);

  const redraw = useCallback(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    ctx.save(); ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,c.width,c.height);
    ctx.restore(); ctx.save(); applyView(ctx)

    ctx.lineCap='round';
    for (const s of strokes.values()) { if (!s || !s.points || s.points.length < 2) continue; ctx.strokeStyle = s.color; ctx.lineWidth = s.size; ctx.beginPath(); ctx.moveTo(s.points[0].x, s.points[0].y); for (let i=1; i<s.points.length; i++) { const p=s.points[i]; if(p) ctx.lineTo(p.x,p.y) } ctx.stroke() }
    for (const sh of shapes.values()) { if (!sh) continue; ctx.strokeStyle = sh.color; ctx.lineWidth = sh.size; if (sh.t==='line'){ ctx.beginPath(); ctx.moveTo(sh.x,sh.y); ctx.lineTo(sh.x+sh.w, sh.y+sh.h); ctx.stroke() } else { ctx.strokeRect(sh.x, sh.y, sh.w, sh.h) } }
    for (const n of notes.values()) { if (!n) continue; ctx.fillStyle = n.color; ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth=1; ctx.fillRect(n.x,n.y,n.w,n.h); ctx.strokeRect(n.x,n.y,n.w,n.h); ctx.fillStyle = '#111827'; ctx.font = `${12}px sans-serif`; ctx.textBaseline = 'top'; wrapFillText(ctx, n.text, n.x+8, n.y+8, n.w-16, 12*1.4) }
    for (const t of texts.values()) { if (!t) continue; ctx.fillStyle = t.color; ctx.font = `${t.size}px ${t.weight==='bold'?'600':'400'} sans-serif`; ctx.textBaseline = 'top'; wrapFillText(ctx, t.text, t.x, t.y, c.width - t.x - 8, t.size*1.4) }

    ctx.restore();
  }, [strokes, shapes, texts, notes]);

  useEffect(() => { redraw() }, [strokes, shapes, texts, notes, viewVersion, redraw]);

  async function addItemToFirestore(collectionName: string, item: any) {
    if (!roomId) return;
    try {
      if (collectionName === 'strokes') {
        await runTransaction(db, async (transaction) => {
          const roomRef = doc(db, "rooms", roomId);
          const roomDoc = await transaction.get(roomRef);
          if (!roomDoc.exists()) throw "Room does not exist!";
          const newSeq = (roomDoc.data().lastStrokeSeq || 0) + 1;
          transaction.update(roomRef, { lastStrokeSeq: newSeq, updatedAt: serverTimestamp() });
          const strokeRef = doc(db, `rooms/${roomId}/strokes`, String(newSeq));
          transaction.set(strokeRef, { ...item, seq: newSeq, clientId: clientIdRef.current, createdAt: serverTimestamp() });
        });
      } else {
        await addDoc(collection(db, `rooms/${roomId}/${collectionName}`), { ...item, clientId: clientIdRef.current, createdAt: serverTimestamp() });
      }
    } catch (error) {
      console.error(`Failed to save ${collectionName}:`, error);
    }
  }

  function onPointerDown(e:React.PointerEvent<HTMLCanvasElement>){
    e.preventDefault();
    const p = getPos(e);
    const currentTool = tool;
    if (currentTool === 'pen' || currentTool === 'eraser'){
      const draft:Partial<Stroke> = { tool: currentTool, color: currentTool === 'eraser' ? '#ffffff' : color, size: currentTool === 'eraser' ? Math.max(10,size*6) : size, points:[p] };
      drawingRef.current={ active:true, draft };
    } else if (currentTool === 'line' || currentTool === 'rect'){
      drawingRef.current.shapeStart = p;
    } else if (currentTool === 'text') {
      setTextbox({ x:p.x, y:p.y, value:'' });
    } else if (currentTool === 'note') {
      addItemToFirestore('notes', {x:p.x,y:p.y,w:180,h:120,color:'#fef08a',text:'メモ'});
    }
  }

  function onPointerMove(e:React.PointerEvent<HTMLCanvasElement>){
    if (!drawingRef.current.active && !drawingRef.current.shapeStart) return;
    const p = getPos(e);
    const currentTool = tool;
    if (currentTool === 'pen' || currentTool === 'eraser') {
      const draft = drawingRef.current.draft as Partial<Stroke>;
      if (!draft || !draft.points) return;
      draft.points.push(p);
      drawOverlay(ctx => { if (draft.points!.length < 2) return; ctx.strokeStyle = draft.color!; ctx.lineWidth = draft.size!; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(draft.points![0].x, draft.points![0].y); for (let i = 1; i < draft.points!.length; i++) { const point = draft.points![i]; if (point) ctx.lineTo(point.x, point.y); } ctx.stroke(); });
    } else if (currentTool === 'line' || currentTool === 'rect') {
      drawOverlay(ctx=>{ const start=drawingRef.current.shapeStart; if(!start) return; ctx.strokeStyle=color; ctx.lineWidth=size; if (tool==='line'){ ctx.beginPath(); ctx.moveTo(start.x,start.y); ctx.lineTo(p.x,p.y); ctx.stroke() } else { ctx.strokeRect(start.x,start.y,p.x-start.x,p.y-start.y) } })
    }
  }

  async function onPointerUp(e:React.PointerEvent<HTMLCanvasElement>){
    clearOverlay();
    if (drawingRef.current.draft){
      await addItemToFirestore('strokes', drawingRef.current.draft);
    } else if (drawingRef.current.shapeStart) {
      const start = drawingRef.current.shapeStart;
      const p = getPos(e);
      const newShape: Partial<Shape> = { t:tool as 'line'|'rect', x:start.x, y:start.y, w:p.x-start.x, h:p.y-start.y, color, size };
      await addItemToFirestore('shapes', newShape);
    }
    drawingRef.current={ active:false }
  }

  function commitText(){ if(!textbox) return; const v=textbox.value.trim(); if(v){ addItemToFirestore('texts', { x:textbox.x, y:textbox.y, text:v, color, size, weight }); } setTextbox(null) }

  function getPos(e:React.PointerEvent){ const rect=(e.target as HTMLElement).getBoundingClientRect(); const sx=e.clientX-rect.left, sy=e.clientY-rect.top; return screenToWorld(sx,sy) }
  function ensureOverlay(){ const c=canvasRef.current, o=overlayRef.current; if(!c||!o) return; o.width=c.width; o.height=c.height; const ctx=o.getContext('2d')!; ctx.setTransform(1,0,0,1,0,0); const dpr=window.devicePixelRatio||1; ctx.scale(dpr,dpr) }
  function drawOverlay(draw:(ctx:CanvasRenderingContext2D)=>void){ ensureOverlay(); const o=overlayRef.current; if(!o) return; const ctx=o.getContext('2d')!; ctx.clearRect(0,0,o.width,o.height); ctx.save(); applyView(ctx); draw(ctx); ctx.restore() }
  function clearOverlay(){ const o=overlayRef.current; if(!o) return; const ctx=o.getContext('2d')!; ctx.clearRect(0,0,o.width,o.height); }
  function wrapFillText(ctx:CanvasRenderingContext2D, text:string, x:number, y:number, maxWidth:number, lineHeight:number){ const words = text.split(' '); let line=''; for(let n=0;n<words.length;n++){ const test=line+words[n]+' '; const w=ctx.measureText(test).width; if(w>maxWidth && n>0){ ctx.fillText(line,x,y); line=words[n]+' '; y+=lineHeight } else { line=test } } ctx.fillText(line,x,y) }

  return (
    <div ref={containerRef} className={`relative h-full w-full bg-white`}>
      <TooltipProvider>
        <div className="absolute left-2 top-2 z-10 flex items-center gap-2 bg-white/90 rounded px-2 py-2 shadow" role="toolbar">
          <button className={`tool-button ${tool==='pen'?'active':''}`} onClick={()=>setTool('pen')} title="ペン">✏️</button>
          <button className={`tool-button ${tool==='eraser'?'active':''}`} onClick={()=>setTool('eraser')} title="消しゴム">⌫</button>
          <button className={`tool-button ${tool==='line'?'active':''}`} onClick={()=>setTool('line')} title="直線">／</button>
          <button className={`tool-button ${tool==='rect'?'active':''}`} onClick={()=>setTool('rect')} title="長方形">▭</button>
          <button className={`tool-button ${tool==='text'?'active':''}`} onClick={()=>setTool('text')} title="テキスト">T</button>
          <button className={`tool-button ${tool==='note'?'active':''}`} onClick={()=>setTool('note')} title="付箋">📝</button>
          <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon" className="tool-button" disabled>↖</Button></TooltipTrigger>
            <TooltipContent><p>選択 (Coming soon)</p></TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1 ml-2">
            {['#111827','#ef4444','#10b981','#3b82f6','#f59e0b'].map((c)=>(
              <button key={c} className="w-5 h-5 rounded-full border" style={{backgroundColor:c, outline: color===c?'2px solid #000':undefined}} onClick={()=>setColor(c)} aria-label={`色 ${c}`} />
            ))}
          </div>
          <select className="ml-2 border rounded px-1 py-0.5 text-sm" value={size} onChange={(e)=>setSize(Number(e.target.value))} aria-label="太さ">
            {[2,3,4,6,8,12,16].map(n=> <option key={n} value={n}>{n}px</option>)}
          </select>
        </div>
      </TooltipProvider>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' as any, WebkitTapHighlightColor: 'transparent' as any }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <canvas ref={overlayRef} className="w-full h-full block absolute inset-0 pointer-events-none" />
      {textbox && (
        <div style={{ position:'absolute', left:textbox.x, top:textbox.y }} className="bg-white border rounded shadow p-1">
          <input autoFocus className="outline-none" placeholder="テキスト" value={textbox.value} onChange={(e)=>setTextbox({...textbox, value:e.target.value})} onKeyDown={(e)=>{ if(e.key==='Enter') commitText(); if(e.key==='Escape') setTextbox(null) }} onBlur={commitText} />
        </div>
      )}
    </div>
  )
}
