"use client"

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'
import './collab.css'

type RoomState = { id: string; topic?: string; members: { id: string; name: string }[]; stamps: { like: number; ask: number; idea: number } }
type QuizQA = { q: string; choices: string[] }
function CollabInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<RoomState | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // stamps
  const [bursts, setBursts] = useState<{ id: number; type: 'like' | 'ask' | 'idea' }[]>([])

  // quiz
  const [quiz, setQuiz] = useState<QuizQA | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<null | { correct: boolean }>(null)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<any>(null)

  // whiteboard
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef<{ drawing: boolean; color: string; last?: { x: number; y: number } }>({ drawing: false, color: '#111827' })
  const [penColor, setPenColor] = useState('#111827')

  // chat
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Array<{ id: number; sender: string; text: string; kind: 'incoming'|'outgoing'|'system' }>>([
    { id: 1, sender: 'system', text: 'ようこそ。スタンプやミニクイズで盛り上がろう！', kind: 'system' },
  ])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('displayName') || '' : ''
    if (saved) setDisplayName(saved)
  }, [])

  // enter + poll
  useEffect(() => {
    let active = true
    let pollTimer: any
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    async function enter() {
      try {
        setLoading(true); setError(null)
        const roomParam = params.get('room')
        const topic = params.get('topic') || undefined
        let id = roomParam || ''
        if (!roomParam || roomParam === 'new') {
          const res = await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic }) })
          const js = await res.json(); id = js.id
          track({ name: 'room_create', props: { id, topic } })
        }
        const name = displayName || 'ゲスト'
        const j = await fetch('/api/rooms/' + id + '/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }), signal: controller.signal })
        if (!j.ok) throw new Error('join failed')
        track({ name: 'room_join', props: { id } })
        if (!active) return
        setRoom({ id, topic, members: [], stamps: { like: 0, ask: 0, idea: 0 } })
        // poll state
        let delay = 2000
        async function loop() {
          try {
            const r = await fetch('/api/rooms/' + id + '/state', { cache: 'no-store' })
            if (r.ok) { const js = await r.json(); setRoom(js); delay = 2000 } else { delay = Math.min(10000, delay * 1.5) }
          } catch { delay = Math.min(10000, delay * 1.5) }
          pollTimer = setTimeout(loop, delay)
        }
        loop()
      } catch (e: any) {
        if (!active) return
        if (e?.name === 'AbortError') setError('timeout')
        else setError('network')
      } finally {
        if (active) setLoading(false); clearTimeout(timeout)
      }
    }
    enter()
    return () => { active = false; clearTimeout(timeout); controller.abort(); clearTimeout(pollTimer) }
  }, [params, displayName])

  // setup whiteboard canvas
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const parent = c.parentElement as HTMLElement
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      c.width = parent.clientWidth * dpr
      c.height = parent.clientHeight * dpr
      const ctx = c.getContext('2d')!
      ctx.scale(dpr, dpr)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, parent.clientWidth, parent.clientHeight)
    }
    resize()
    const getPos = (ev: MouseEvent | TouchEvent) => {
      const rect = c.getBoundingClientRect()
      const t = (ev as TouchEvent).touches && (ev as TouchEvent).touches[0]
      const clientX = t ? t.clientX : (ev as MouseEvent).clientX
      const clientY = t ? t.clientY : (ev as MouseEvent).clientY
      return { x: clientX - rect.left, y: clientY - rect.top }
    }
    const onDown = (e: MouseEvent | TouchEvent) => { drawingRef.current.drawing = true; drawingRef.current.last = getPos(e) }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawingRef.current.drawing) return
      const ctx = c.getContext('2d')!
      const { x, y } = getPos(e)
      const last = drawingRef.current.last
      if (!last) return
      ctx.strokeStyle = drawingRef.current.color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); ctx.stroke()
      drawingRef.current.last = { x, y }
    }
    const onUp = () => { drawingRef.current.drawing = false; drawingRef.current.last = undefined }
    window.addEventListener('resize', resize)
    c.addEventListener('mousedown', onDown)
    c.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    c.addEventListener('touchstart', onDown as any, { passive: true } as any)
    c.addEventListener('touchmove', onMove as any, { passive: true } as any)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('resize', resize)
      c.removeEventListener('mousedown', onDown)
      c.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      c.removeEventListener('touchstart', onDown as any)
      c.removeEventListener('touchmove', onMove as any)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  useEffect(() => { drawingRef.current.color = penColor }, [penColor])

  // shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!room) return
      if (e.key === '1') sendStamp('like')
      if (e.key === '2') sendStamp('ask')
      if (e.key === '3') sendStamp('idea')
      if (e.key === 'q' || e.key === 'Q') startQuiz()
      if (quiz && (e.key >= '1' && e.key <= '4')) setSelected(parseInt(e.key, 10) - 1)
      if (quiz && e.key === 'Enter' && selected != null) submitAnswer()
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveTakeaway()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [room, quiz, selected])

  async function sendStamp(type: 'like' | 'ask' | 'idea') {
    if (!room) return
    try {
      await fetch('/api/rooms/' + room.id + '/stamp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) })
      const bid = Date.now() + Math.floor(Math.random() * 1000)
      setBursts((b) => [...b, { id: bid, type }])
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== bid)), 1200)
      track({ name: 'room_stamp', props: { id: room.id, type } })
    } catch {}
  }

  async function startQuiz() {
    if (!room) return
    try {
      const res = await fetch('/api/rooms/' + room.id + '/quiz_round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ask' }) })
      const js = await res.json()
      setQuiz(js); setSelected(null); setResult(null)
      setCountdown(20)
      if (timerRef.current) clearInterval(timerRef.current)
      const end = Date.now() + 20000
      timerRef.current = setInterval(() => {
        const remain = Math.max(0, Math.ceil((end - Date.now()) / 1000))
        setCountdown(remain)
        if (remain <= 0) { clearInterval(timerRef.current); submitAnswerTimeout() }
      }, 250)
      track({ name: 'room_quiz_round', props: { id: room.id, action: 'ask' } })
    } catch { toast({ description: 'ミニクイズ開始に失敗しました' }) }
  }

  async function submitAnswer() {
    if (!room || !quiz || selected == null) return
    try {
      const res = await fetch('/api/rooms/' + room.id + '/quiz_round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'answer', choice: selected }) })
      const js = await res.json(); setResult(js.result)
      track({ name: 'room_quiz_round', props: { id: room.id, action: 'answer', correct: js.result?.correct } })
    } catch { toast({ description: '採点に失敗しました' }) }
    finally { if (timerRef.current) clearInterval(timerRef.current) }
  }

  async function submitAnswerTimeout() {
    if (!room || !quiz) return
    try {
      const res = await fetch('/api/rooms/' + room.id + '/quiz_round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'answer', choice: -1 }) })
      const js = await res.json(); setResult(js.result)
      track({ name: 'room_quiz_round', props: { id: room.id, action: 'answer', correct: js.result?.correct, reason: 'timeout' } })
    } catch { toast({ description: '採点に失敗しました' }) }
  }

  async function saveTakeaway() {
    if (!room) return
    const val = (document.getElementById('takeaway-input') as HTMLTextAreaElement | null)?.value || ''
    if (!val.trim()) return
    try {
      await fetch('/api/rooms/' + room.id + '/takeaway', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: val }) })
      track({ name: 'room_takeaway_export', props: { id: room.id } })
      toast({ description: '保存しました', duration: 2000 })
      ;(document.getElementById('takeaway-input') as HTMLTextAreaElement | null)!.value = ''
    } catch { toast({ description: '保存に失敗しました' }) }
  }

  async function onLeave() {
    if (!room) return
    try { await fetch('/api/rooms/' + room.id + '/leave', { method: 'POST' }); track({ name: 'room_leave', props: { id: room.id } }) } finally { router.push('/home') }
  }

  function shareRoom() {
    if (!room) return
    const url = `${location.origin}/collab?room=${room.id}`
    if (navigator.share) navigator.share({ title: '一緒に学ぼう', text: 'このルームに参加してね', url }).catch(() => {})
    else navigator.clipboard.writeText(url).then(() => toast({ description: '招待リンクをコピーしました' })).catch(() => {})
    track({ name: 'room_share', props: { id: room.id } })
  }

  const members = room?.members || []
  const stamps = room?.stamps || { like: 0, ask: 0, idea: 0 }

  if (loading) return <div className="p-6">読み込み中…</div>
  if (error) return (
    <div className="p-6 text-center">
      <div className="mb-3">入室に失敗しました。</div>
      <Button onClick={() => router.refresh()}>再試行</Button>
    </div>
  )
  if (!room) return null

  return (
    <div className="collab-container">
      <header className="room-header">
        <div className="room-info">
          <h1>ルーム {room.id}{room.topic ? ` / ${room.topic}` : ''}</h1>
          <div className="room-meta"><span>参加者 {members.length}</span></div>
        </div>
        <div className="room-actions">
          <button className="icon-button" onClick={() => setSidebarOpen((o) => !o)} aria-label="参加者パネル切替">☰</button>
          <button className="icon-button" onClick={shareRoom} aria-label="共有">⇪</button>
          <Button variant="outline" onClick={onLeave}>退出</Button>
        </div>
      </header>

      <div className="room-main">
        <aside className={`participants-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <span>参加者</span>
            <span className="participants-count">{members.length}</span>
          </div>
          <div className="participants-list">
            {members.map((m) => (
              <div key={m.id} className="participant-card">
                <div className="avatar-circle">{m.name.slice(0,1).toUpperCase()}</div>
                <div className="participant-name">{m.name}</div>
              </div>
            ))}
          </div>
        </aside>

        <div className="room-content">
          {/* bursts overlay */}
          <div className="relative h-0">
            {bursts.map((b) => (
              <div key={b.id} className={`stamp-burst ${b.type}`} aria-hidden>
                {b.type === 'like' ? '👍' : b.type === 'ask' ? '❓' : '💡'}
              </div>
            ))}
          </div>

          <div className="whiteboard-container">
            <canvas ref={canvasRef} className="whiteboard" aria-label="ホワイトボード" />
            <div className="whiteboard-tools" role="toolbar" aria-label="ホワイトボードツール">
              <button className={`tool-button${penColor === '#111827' ? ' active' : ''}`} onClick={() => setPenColor('#111827')} title="ペン(黒)">●</button>
              <button className={`tool-button${penColor === '#dc2626' ? ' active' : ''}`} onClick={() => setPenColor('#dc2626')} title="ペン(赤)" style={{ color: '#dc2626' }}>●</button>
              <button className={`tool-button${penColor === '#2563eb' ? ' active' : ''}`} onClick={() => setPenColor('#2563eb')} title="ペン(青)" style={{ color: '#2563eb' }}>●</button>
              <button className="tool-button" onClick={() => { const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return; ctx.clearRect(0,0,c.width,c.height) }} title="クリア">↺</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            <div className="rounded border bg-white p-3">
              <div className="text-sm font-semibold mb-2">スタンプ</div>
              <div className="flex items-center gap-2">
                <Button onClick={() => sendStamp('like')}>👍 いいね ({stamps.like})</Button>
                <Button onClick={() => sendStamp('ask')} variant="secondary">❓ 質問 ({stamps.ask})</Button>
                <Button onClick={() => sendStamp('idea')} variant="outline">💡 ひらめき ({stamps.idea})</Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">ショートカット: 1 / 2 / 3</div>
            </div>

            <div className="rounded border bg-white p-3">
              <div className="text-sm font-semibold mb-2">ミニクイズ</div>
              {!quiz && (
                <Button onClick={startQuiz}>出題する (Q)</Button>
              )}
              {quiz && (
                <div>
                  <div className="text-sm mb-2">残り {countdown} 秒</div>
                  <div className="font-medium mb-2">{quiz.q}</div>
                  <div className="grid gap-2">
                    {quiz.choices.map((c, i) => (
                      <Button key={i} variant={selected === i ? 'secondary' : 'outline'} onClick={() => setSelected(i)}>
                        {i + 1}. {c}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button onClick={submitAnswer} disabled={selected == null}>送信 (Enter)</Button>
                    {result && <span className="text-sm">{result.correct ? '正解！' : '不正解'}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded border bg-white p-3 m-3">
            <div className="text-sm font-semibold mb-2">今日の学び（テイクアウェイ）</div>
            <textarea id="takeaway-input" className="w-full border rounded p-2" rows={3} placeholder="気づきや学びをメモ (Ctrl/⌘+Enterで保存)" />
            <div className="mt-2">
              <Button onClick={saveTakeaway}>保存</Button>
            </div>
          </div>

          <div className="chat-container" style={{ height: 280 }}>
            <div className="chat-header">
              <div className="chat-tabs">
                <div className="chat-tab active">メッセージ</div>
              </div>
            </div>
            <div className="chat-messages" aria-live="polite">
              {messages.map(m => (
                <div key={m.id} className={`message message-${m.kind}`}>
                  {m.kind !== 'system' && <div className="message-sender">{m.sender}</div>}
                  <div className="message-content">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="メッセージを入力（Ctrl/⌘+Enterで送信）" onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { const name = displayName || 'ゲスト'; const t = chatInput.trim(); if (!t) return; setMessages(v => [...v, { id: Date.now(), sender: name, text: t, kind: 'outgoing' }]); setChatInput('') } }} />
              <button className="send-button" aria-label="送信" onClick={() => { const name = displayName || 'ゲスト'; const t = chatInput.trim(); if (!t) return; setMessages(v => [...v, { id: Date.now(), sender: name, text: t, kind: 'outgoing' }]); setChatInput('') }}>➤</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CollabPage() {
  return (
    <Suspense fallback={<div className="p-6">読み込み中…</div>}>
      <CollabInner />
    </Suspense>
  )
}

