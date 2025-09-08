"use client"

import { Suspense, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'
import { Whiteboard } from '@/components/collab/Whiteboard'
import { ResizablePanel } from '@/components/collab/ResizablePanel'
import { InviteButton } from '@/components/collab/InviteButton'
import { HandleInput } from '@/components/collab/HandleInput'
import { useCollabStore } from '@/store/collab'
import { subscribeRoomState } from '@/lib/realtime'
import '../../collab.css'

type RoomState = { id: string; topic?: string; members: { id: string; name: string }[]; stamps: { like: number; ask: number; idea: number } }
type QuizQA = { q: string; choices: string[] }

function RoomInner() {
  const router = useRouter()
  const routeParams = useParams<{ id: string }>()
  const params = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<RoomState | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [meId, setMeId] = useState<string | null>(null)

  // stamps
  const [bursts, setBursts] = useState<{ id: number; type: 'like' | 'ask' | 'idea' }[]>([])

  // quiz
  const [quiz, setQuiz] = useState<QuizQA | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<null | { correct: boolean }>(null)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<any>(null)

  // roles
  const role = useCollabStore((s) => s.role)

  // chat
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Array<{ id: number; sender: string; text: string; kind: 'incoming'|'outgoing'|'system' }>>([
    { id: 1, sender: 'system', text: 'ようこそ！スタンプやミニクイズで盛り上がろう！', kind: 'system' },
  ])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('displayName') || '' : ''
    if (saved) setDisplayName(saved)
  }, [])

  // enter + poll
  useEffect(() => {
    let active = true
    let pollTimer: any
    let visHandler: any = null
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    async function enter() {
      try {
        setLoading(true); setError(null)
        const id = routeParams?.id
        if (!id) throw new Error('missing id')
        const topic = params.get('topic') || undefined
        const name = displayName || 'ゲスト'
        const j = await fetch('/api/rooms/' + id + '/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, t: params.get('t') || undefined }), signal: controller.signal })
        if (j.status === 202) {
          const js = await j.json()
          setMeId(js.me?.id || null)
          setRoom({ id, topic, members: [], stamps: { like: 0, ask: 0, idea: 0 } })
          toast({ description: '承認待ちです…ホストの承認をお待ちください' })
        } else if (j.ok) {
          const js = await j.json().catch(() => ({} as any))
          setMeId(js?.me?.id || null)
          track({ name: 'room_join', props: { id } })
          setRoom({ id, topic, members: [], stamps: { like: 0, ask: 0, idea: 0 } })
        } else {
          throw new Error('join failed')
        }
        if (!active) return
        setRoom({ id, topic, members: [], stamps: { like: 0, ask: 0, idea: 0 } })
        // subscribe via realtime abstraction
        const unsub = subscribeRoomState(id, (js) => setRoom(js))
        visHandler = null
        pollTimer = { unsub } as any
        // cleanup for visibility listener will be in effect cleanup below
      } catch (e: any) {
        if (!active) return
        if (e?.name === 'AbortError') {
          setError('タイムアウトしました')
        } else {
          setError(e?.message || '入室に失敗しました')
        }
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    enter()
    return () => {
      active = false
      if (pollTimer && (pollTimer as any).unsub) { (pollTimer as any).unsub() }
      if (visHandler) document.removeEventListener('visibilitychange', visHandler)
      controller.abort()
    }
  }, [routeParams?.id, params, displayName])

  // whiteboard, resizers handled in components

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

  const lastStampRef = useRef<number>(0)
  async function sendStamp(type: 'like' | 'ask' | 'idea') {
    if (!room) return
    const now = Date.now()
    if (now - lastStampRef.current < 500) {
      track({ name: 'room_stamp', props: { id: room.id, type, cooldownSkipped: true } })
      return
    }
    lastStampRef.current = now
    try {
      await fetch('/api/rooms/' + room.id + '/stamp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, userId: meId }) })
      const bid = Date.now() + Math.floor(Math.random() * 1000)
      setBursts((b) => [...b, { id: bid, type }])
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== bid)), 1200)
      track({ name: 'room_stamp', props: { id: room.id, type, cooldownSkipped: false } })
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
    } catch { toast({ description: '回答に失敗しました' }) }
    finally { if (timerRef.current) clearInterval(timerRef.current) }
  }

  async function submitAnswerTimeout() {
    if (!room || !quiz) return
    try {
      const res = await fetch('/api/rooms/' + room.id + '/quiz_round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'answer', choice: -1 }) })
      const js = await res.json(); setResult(js.result)
      track({ name: 'room_quiz_round', props: { id: room.id, action: 'answer', correct: js.result?.correct, reason: 'timeout' } })
    } catch { toast({ description: '回答に失敗しました' }) }
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

  // invite handled by InviteButton

  const members = room?.members || []
  const stamps = room?.stamps || { like: 0, ask: 0, idea: 0 }
  const solverId = (room as any)?.solverId as string | undefined
  const pendingControl = ((room as any)?.pendingControlRequests as string[] | undefined) || []
  const hostId = (room as any)?.hostId as string | undefined
  const pendingJoins = ((room as any)?.pendingJoins as { id:string; name:string }[] | undefined) || []
  const myRole = meId && solverId === meId ? 'solver' : 'viewer'
  useEffect(() => {
    // reflect into collab store for gating
    useCollabStore.getState().setRole(myRole as any)
    useCollabStore.getState().setSolver(solverId)
  }, [myRole, solverId])

  // Host toast on new pending joins
  const prevPendingRef = useRef<number>(0)
  useEffect(() => {
    if (!room) return
    const isHost = meId && hostId === meId
    if (isHost) {
      const prev = prevPendingRef.current
      const curr = pendingJoins.length
      if (curr > prev) {
        toast({ description: `入室承認待ちが${curr - prev}件届きました` })
      }
      prevPendingRef.current = curr
    } else {
      prevPendingRef.current = pendingJoins.length
    }
  }, [pendingJoins.length, hostId, meId, room])

  if (loading) return <div className="p-6">読み込み中…</div>
  if (error) return (
    <div className="p-6 text-center">
      <div className="mb-2">{error}</div>
      <Button onClick={() => { setError(null); setLoading(true); location.reload() }}>やり直す</Button>
    </div>
  )

  return (
    <div className="collab-container" data-room-id={room?.id}>
      <header className="room-header">
        <div className="room-info">
          <h1>コラボルーム</h1>
          <div className="room-meta">
            <span>トピック: {room?.topic || '（未設定）'}</span>
            <span>参加者: {members.length}</span>
          </div>
        </div>
        <div className="room-actions">
          {room && <HandleInput roomId={room.id} initial={displayName} />}
          {room && <InviteButton roomId={room.id} />}
          <Button variant="outline" onClick={onLeave}>退出</Button>
        </div>
      </header>

      <main className="room-main">
        <aside className={`participants-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <span>参加者</span>
            <button className="control-button" onClick={() => setSidebarOpen((v) => !v)} aria-label="サイドバー切替">≡</button>
          </div>
          <div className="participants-list">
            {members.map((m) => (
              <div key={m.id} className="participant-card">
                <div className="participant-avatar">{m.name?.[0] || 'U'}</div>
                <div className="participant-info">
                  <div className="participant-name">{m.name}</div>
                  <div className="participant-action">閲覧中</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <section className="room-content">
          <div className="whiteboard-container">
            <Whiteboard roomId={room?.id} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            <ResizablePanel id="stampsH" title="スタンプ" initial={140} min={36} max={320} roomId={room?.id}>
              <div className="flex items-center gap-2">
                <Button onClick={() => sendStamp('like')} aria-label="いいねスタンプ" aria-keyshortcuts="1" disabled={role==='solver'}>👍 いいね ({stamps.like})</Button>
                <Button onClick={() => sendStamp('ask')} variant="secondary" aria-label="質問スタンプ" aria-keyshortcuts="2" disabled={role==='solver'}>❓ 質問 ({stamps.ask})</Button>
                <Button onClick={() => sendStamp('idea')} variant="outline" aria-label="アイデアスタンプ" aria-keyshortcuts="3" disabled={role==='solver'}>💡 ひらめき ({stamps.idea})</Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">ショートカット: 1 / 2 / 3（Viewerのみ送信可）</div>
              {myRole === 'viewer' && meId && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={async () => { await fetch(`/api/rooms/${room!.id}/control`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'request', userId: meId }) }); track({ name: 'room_control_request', props: { id: room!.id } }) }}>操作権をリクエスト</Button>
                </div>
              )}
              {(myRole === 'solver' || (meId && hostId === meId)) && pendingControl.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-semibold mb-1">操作権リクエスト</div>
                  <div className="flex flex-col gap-2">
                    {pendingControl.map((uid) => {
                      const u = members.find(m => m.id === uid)
                      return (
                        <div key={uid} className="flex items-center justify-between text-sm">
                          <span>{u?.name || uid}</span>
                          <Button size="sm" onClick={async () => { await fetch(`/api/rooms/${room!.id}/control`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', userId: uid }) }); track({ name: 'room_control_approve', props: { id: room!.id, userId: uid } }) }}>付け替え</Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </ResizablePanel>

            <ResizablePanel id="quizH" title="ミニクイズ" initial={220} min={36} max={480} roomId={room?.id}>
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
                    <Button onClick={submitAnswer} disabled={selected == null}>回答 (Enter)</Button>
                    {result && <span className="text-sm">{result.correct ? '正解！' : '不正解'}</span>}
                  </div>
                </div>
              )}
            </ResizablePanel>
          </div>

          {(meId && hostId === meId && pendingJoins.length > 0) && (
            <ResizablePanel id="approvalH" title="入室承認待ち" initial={160} min={36} max={320} roomId={room?.id}>
              <div className="flex flex-col gap-2">
                {pendingJoins.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <span>{u.name}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="default" onClick={async () => { await fetch(`/api/rooms/${room!.id}/approval`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', userId: u.id }) }) }}>承認</Button>
                      <Button size="sm" variant="secondary" onClick={async () => { await fetch(`/api/rooms/${room!.id}/approval`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deny', userId: u.id }) }) }}>拒否</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ResizablePanel>
          )}

          <ResizablePanel id="takeawayH" title="今日の学び（テイクアウェイ）" initial={160} min={36} max={400} roomId={room?.id}>
            <textarea id="takeaway-input" className="w-full border rounded p-2" rows={3} placeholder="今日の学びを書こう（Ctrl/⌘+Enterで保存）" />
            <div className="mt-2">
              <Button onClick={saveTakeaway}>保存</Button>
            </div>
          </ResizablePanel>

          <ResizablePanel id="messagesH" title="メッセージ" initial={240} min={120} max={480} roomId={room?.id}>
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
          </ResizablePanel>
        </section>
      </main>
    </div>
  )
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="p-6">読み込み中…</div>}>
      <RoomInner />
    </Suspense>
  )
}
