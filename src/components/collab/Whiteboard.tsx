"use client"

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'

type Stroke = { color: string; size: number; points: { x:number; y:number }[] }
type Shape = { t:'line'|'rect'; x:number; y:number; w:number; h:number; color:string; size:number }
type TextItem = { x:number; y:number; text:string; color:string; size:number; weight:'normal'|'bold' }
type Sticky = { x:number; y:number; w:number; h:number; color:string; text:string }

type Tool = 'select'|'pen'|'eraser'|'text'|'line'|'rect'|'laser'|'note'|'snap'

export function Whiteboard({ roomId }: { roomId?: string }) {
  const containerRef = useRef<HTMLDivElement|null>(null)
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const overlayRef = useRef<HTMLCanvasElement|null>(null)

  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#111827')
  const [size, setSize] = useState(2)
  const [weight, setWeight] = useState<'normal'|'bold'>('normal')
  const [fs, setFs] = useState(false)
  const [gridOn, setGridOn] = useState(false)

  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [texts, setTexts] = useState<TextItem[]>([])
  const [notes, setNotes] = useState<Sticky[]>([])
  const historyRef = useRef<{strokes:Stroke[];shapes:Shape[];texts:TextItem[];notes:Sticky[]}[]>([])
  const redoRef = useRef<{strokes:Stroke[];shapes:Shape[];texts:TextItem[];notes:Sticky[]}[]>([])

  const drawingRef = useRef<{ active:boolean; last?:{x:number;y:number}; draft?:Stroke|null; shapeStart?:{x:number;y:number}|null }>({ active:false, draft:null, shapeStart:null })
  const selectionRef = useRef<{ kind:'shape'|'line'|'text'|'note'; idx:number; ox:number; oy:number; resize?:boolean }|null>(null)
  const snapRectRef = useRef<{ sx:number; sy:number; ex:number; ey:number }|null>(null)
  const [textbox, setTextbox] = useState<{ x:number; y:number; value:string }|null>(null)
  const [noteEdit, setNoteEdit] = useState<{ idx:number; value:string }|null>(null)

  // size to container
  useEffect(() => {
    function resize() {
      const c = canvasRef.current, parent = containerRef.current
      if (!c || !parent) return
      const dpr = window.devicePixelRatio || 1
      c.width = parent.clientWidth * dpr
      c.height = parent.clientHeight * dpr
      const ctx = c.getContext('2d')!
      ctx.setTransform(1,0,0,1,0,0)
      ctx.scale(dpr, dpr)
      redraw()
      ensureOverlay()
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const redraw = () => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    ctx.save()
    ctx.clearRect(0,0,c.width,c.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,c.width,c.height)
    ctx.restore()
    const dpr = window.devicePixelRatio || 1
    const width = c.width/dpr, height=c.height/dpr
    if (gridOn) {
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'
      ctx.lineWidth = 1
      for (let x=0;x<=width;x+=25){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke() }
      for (let y=0;y<=height;y+=25){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke() }
    }
    // strokes
    ctx.lineCap='round'
    for (const s of strokes) {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.size
      ctx.beginPath()
      for (let i=0;i<s.points.length-1;i++){ const a=s.points[i], b=s.points[i+1]; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y) }
      ctx.stroke()
    }
    // shapes
    for (const sh of shapes) {
      ctx.strokeStyle = sh.color; ctx.lineWidth = sh.size
      if (sh.t==='line'){ ctx.beginPath(); ctx.moveTo(sh.x,sh.y); ctx.lineTo(sh.x+sh.w, sh.y+sh.h); ctx.stroke() }
      else { ctx.strokeRect(sh.x, sh.y, sh.w, sh.h) }
    }
    // notes
    for (const n of notes) {
      ctx.fillStyle = n.color; ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth=1
      ctx.fillRect(n.x,n.y,n.w,n.h); ctx.strokeRect(n.x,n.y,n.w,n.h)
      ctx.fillStyle = '#111827'
      ctx.font = `${Math.max(12,size)}px ${weight==='bold'?'600':'400'} ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`
      ctx.textBaseline = 'top'
      wrapFillText(ctx, n.text, n.x+8, n.y+8, n.w-16, Math.max(12,size)*1.4)
    }
    // texts
    for (const t of texts) {
      ctx.fillStyle = t.color
      ctx.font = `${t.size}px ${t.weight==='bold'?'600':'400'} ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial`
      ctx.textBaseline = 'top'
      wrapFillText(ctx, t.text, t.x, t.y, width - t.x - 8, t.size*1.4)
    }
  }
  useEffect(() => { redraw() }, [strokes,shapes,texts,notes,gridOn,weight,size])

  function pushHistory(){ historyRef.current.push({ strokes:JSON.parse(JSON.stringify(strokes)), shapes:JSON.parse(JSON.stringify(shapes)), texts:JSON.parse(JSON.stringify(texts)), notes:JSON.parse(JSON.stringify(notes)) }); if(historyRef.current.length>100) historyRef.current.shift(); redoRef.current=[] }
  function undo(){ const prev=historyRef.current.pop(); if(!prev) return; redoRef.current.push({strokes,shapes,texts,notes}); setStrokes(prev.strokes); setShapes(prev.shapes); setTexts(prev.texts); setNotes(prev.notes) }
  function redo(){ const next=redoRef.current.pop(); if(!next) return; historyRef.current.push({strokes,shapes,texts,notes}); setStrokes(next.strokes); setShapes(next.shapes); setTexts(next.texts); setNotes(next.notes) }
  function clearAll(){ pushHistory(); setStrokes([]); setShapes([]); setTexts([]); setNotes([]) }

  function getPos(e:React.PointerEvent){ const rect=(e.target as HTMLElement).getBoundingClientRect(); return { x:e.clientX-rect.left, y:e.clientY-rect.top } }
  function onPointerDown(e:React.PointerEvent<HTMLCanvasElement>){
    if (tool==='pen'||tool==='eraser'){
      const p=getPos(e); const stroke:Stroke={color: tool==='eraser'?'#ffffff':color, size: tool==='eraser'?Math.max(10,size*6):size, points:[p]}; drawingRef.current={active:true,last:p,draft:stroke,shapeStart:null}
    } else if (tool==='text'){
      const p=getPos(e); setTextbox({ x:p.x, y:p.y, value:'' })
    } else if (tool==='note'){
      const p=getPos(e); pushHistory(); setNotes(arr=>[...arr,{x:p.x,y:p.y,w:180,h:120,color:'#fef08a',text:'メモ'}])
    } else if (tool==='line'||tool==='rect'){
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
    const p=getPos(e)
    if (tool==='laser'){ addLaserDot(p.x,p.y); return }
    if (tool==='select' && selectionRef.current){ const sel=selectionRef.current; if (sel.kind==='note'){ const i=sel.idx; if (sel.resize){ setNotes(arr=>arr.map((n,idx)=> idx!==i?n:{...n, w:Math.max(60,p.x-n.x), h:Math.max(40,p.y-n.y)})) } else { setNotes(arr=>arr.map((n,idx)=> idx!==i?n:{...n, x:p.x-sel.ox, y:p.y-sel.oy})) } return } if (sel.kind==='text'){ const i=sel.idx; setTexts(arr=>arr.map((t,idx)=> idx!==i?t:{...t, x:p.x-sel.ox, y:p.y-sel.oy})); return } if (sel.kind==='shape'||sel.kind==='line'){ const i=sel.idx; setShapes(arr=>arr.map((s,idx)=> idx!==i?s:{...s, x:p.x-sel.ox, y:p.y-sel.oy})); return } }
    if (tool==='line'||tool==='rect'){
      drawOverlay((ctx)=>{ const start=drawingRef.current.shapeStart; if(!start) return; const sx=gridOn?Math.round(start.x/5)*5:start.x; const sy=gridOn?Math.round(start.y/5)*5:start.y; const ex=gridOn?Math.round(p.x/5)*5:p.x; const ey=gridOn?Math.round(p.y/5)*5:p.y; ctx.strokeStyle=color; ctx.lineWidth=size; if (tool==='line'){ ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke() } else { ctx.strokeRect(sx,sy,ex-sx,ey-sy) } })
      return
    }
    if (tool==='snap' && snapRectRef.current){ const r=snapRectRef.current; r.ex=p.x; r.ey=p.y; drawOverlay((ctx)=>{ ctx.setLineDash([6,4]); ctx.strokeStyle='#111827'; ctx.strokeRect(r.sx,r.sy,r.ex-r.sx,r.ey-r.sy); ctx.setLineDash([]) }); return }
    if (!drawingRef.current.active || !drawingRef.current.draft) return
    const d=drawingRef.current.draft; d.points.push(p); setStrokes(prev=>prev.slice())
  }
  function onPointerUp(){
    if (tool==='line'||tool==='rect'){
      const start=drawingRef.current.shapeStart; if (start){ pushHistory(); const last=drawingRef.current.last||start; const sx=gridOn?Math.round(start.x/5)*5:start.x; const sy=gridOn?Math.round(start.y/5)*5:start.y; const ex=gridOn?Math.round(last.x/5)*5:last.x; const ey=gridOn?Math.round(last.y/5)*5:last.y; const w=ex-sx, h=ey-sy; setShapes(prev=>[...prev,{ t:tool, x:sx, y:sy, w, h, color, size } as Shape]); clearOverlay() }
    } else if (tool==='select' && selectionRef.current){ pushHistory(); selectionRef.current=null }
    else if (tool==='snap' && snapRectRef.current){ const r=snapRectRef.current; const sx=Math.min(r.sx,r.ex), sy=Math.min(r.sy,r.ey); const w=Math.abs(r.ex-r.sx), h=Math.abs(r.ey-r.sy); snapshotToTakeaway(sx,sy,w,h); snapRectRef.current=null; clearOverlay() }
    else if (drawingRef.current.draft){ pushHistory(); setStrokes(prev=>[...prev, drawingRef.current.draft!]) }
    drawingRef.current={active:false,draft:null,shapeStart:null}
  }

  function onDoubleClick(e:React.MouseEvent<HTMLCanvasElement>){
    const p = getPos(e as any)
    for (let i=notes.length-1;i>=0;i--){ const n=notes[i]; if (p.x>=n.x&&p.x<=n.x+n.w&&p.y>=n.y&&p.y<=n.y+n.h){ setNoteEdit({ idx:i, value:n.text }); return } }
  }

  // overlay helpers
  function ensureOverlay(){ const c=canvasRef.current, o=overlayRef.current; if(!c||!o) return; o.width=c.width; o.height=c.height; const ctx=o.getContext('2d')!; ctx.setTransform(1,0,0,1,0,0); const dpr=window.devicePixelRatio||1; ctx.scale(dpr,dpr) }
  function drawOverlay(draw:(ctx:CanvasRenderingContext2D)=>void){ ensureOverlay(); const o=overlayRef.current; if(!o) return; const ctx=o.getContext('2d')!; ctx.clearRect(0,0,o.width,o.height); draw(ctx) }
  function clearOverlay(){ const o=overlayRef.current; if(!o) return; const ctx=o.getContext('2d')!; ctx.clearRect(0,0,o.width,o.height) }

  // laser
  const laserDotsRef = useRef<{x:number;y:number;at:number}[]>([])
  const rafRef = useRef<number|null>(null)
  function addLaserDot(x:number,y:number){ laserDotsRef.current.push({x,y,at:Date.now()}); if(!rafRef.current) rafRef.current=requestAnimationFrame(stepLaser) }
  function stepLaser(){ const o=overlayRef.current; if(!o){ rafRef.current=null; return } ensureOverlay(); const ctx=o.getContext('2d')!; const now=Date.now(), life=1500; laserDotsRef.current=laserDotsRef.current.filter(d=>now-d.at<life); ctx.clearRect(0,0,o.width,o.height); for(const d of laserDotsRef.current){ const t=(now-d.at)/life; const alpha=Math.max(0,1-t); ctx.beginPath(); ctx.fillStyle=`rgba(239,68,68,${alpha})`; ctx.arc(d.x,d.y,8,0,Math.PI*2); ctx.fill() } if(laserDotsRef.current.length>0) rafRef.current=requestAnimationFrame(stepLaser); else rafRef.current=null }

  // utils
  function pointSegDist(px:number,py:number,x1:number,y1:number,x2:number,y2:number){ const A=px-x1,B=py-y1,C=x2-x1,D=y2-y1; const dot=A*C+B*D; const len=C*C+D*D; let t=len?dot/len:-1; t=Math.max(0,Math.min(1,t)); const xx=x1+t*C, yy=y1+t*D; const dx=px-xx, dy=py-yy; return Math.sqrt(dx*dx+dy*dy) }
  async function snapshotToTakeaway(x:number,y:number,w:number,h:number){ if(w<4||h<4) return; const base=canvasRef.current; if(!base) return; const dpr=window.devicePixelRatio||1; const tmp=document.createElement('canvas'); tmp.width=Math.max(1,Math.floor(w*dpr)); tmp.height=Math.max(1,Math.floor(h*dpr)); const ctx=tmp.getContext('2d')!; ctx.drawImage(base, Math.floor(x*dpr), Math.floor(y*dpr), Math.floor(w*dpr), Math.floor(h*dpr), 0,0, Math.floor(w*dpr), Math.floor(h*dpr)); const dataUrl=tmp.toDataURL('image/png'); try{ if(roomId){ await fetch(`/api/rooms/${roomId}/takeaway`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:dataUrl })}); track({ name:'room_snapshot_takeaway', props:{ roomId, w, h } }) } else { const a=document.createElement('a'); a.href=dataUrl; a.download='snapshot.png'; a.click() } } catch{}
  }

  useEffect(()=>{ const onKey=(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){ e.preventDefault(); if(e.shiftKey) redo(); else undo(); return } if(e.key==='Escape'&&fs){ setFs(false); return } if(e.key.toLowerCase()==='n'){ setTool('note'); return } if(e.key.toLowerCase()==='s'){ setTool('snap'); return } if(e.key.toLowerCase()==='b'){ setWeight(w=>w==='bold'?'normal':'bold'); return } }; window.addEventListener('keydown',onKey); return ()=>window.removeEventListener('keydown',onKey) },[fs,strokes,texts])

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
          <button className="tool-button" onClick={clearAll} title="クリア">🗑</button>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" onPointerDown={onPointerDown} onPointerMove={(e)=>{ drawingRef.current.last=getPos(e); onPointerMove(e) }} onPointerUp={onPointerUp} onDoubleClick={onDoubleClick} />
      <canvas ref={overlayRef} className="w-full h-full block absolute inset-0 pointer-events-none" />
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
    </div>
  )

  function commitText(){ if(!textbox) return; const v=textbox.value.trim(); if(v){ pushHistory(); setTexts(arr=>[...arr,{ x:textbox.x, y:textbox.y, text:v, color, size, weight }]) } setTextbox(null) }
  function commitNoteEdit(){ if(!noteEdit) return; pushHistory(); setNotes(arr=>arr.map((n,i)=> i!==noteEdit.idx? n : { ...n, text: noteEdit.value })); setNoteEdit(null) }
}

function wrapFillText(ctx:CanvasRenderingContext2D, text:string, x:number, y:number, maxWidth:number, lineHeight:number){
  const words = text.split(/\s+/); let line=''; let yy=y
  for(let n=0;n<words.length;n++){ const test=line+(line?' ':'')+words[n]; const w=ctx.measureText(test).width; if(w>maxWidth && n>0){ ctx.fillText(line,x,yy); line=words[n]; yy+=lineHeight } else { line=test } }
  ctx.fillText(line,x,yy)
}

