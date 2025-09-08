"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bell, Flame, Users } from 'lucide-react'
import { QuickStartCard } from '@/components/home/QuickStartCard'
import { TaskCard } from '@/components/home/TaskCard'
import { PulseCard } from '@/components/home/PulseCard'
import { ChallengeStrip } from '@/components/home/ChallengeStrip'
import { track } from '@/lib/analytics'
import { useHomeStore, type ModuleSummary } from '@/store/homeStore'
import { usePulseStore } from '@/store/pulse'
import './home.css'

type HomeApi = {
  quickstart: ModuleSummary
  tasks: ModuleSummary[]
  unread: number
  streakDays: number
  pulse: number
}

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HomeApi | null>(null)
  const setUnread = useHomeStore((s) => s.setUnread)
  const setPulse = useHomeStore((s) => s.setPulse)
  const setStreakDays = useHomeStore((s) => s.setStreakDays)
  const setCurrentModuleId = useHomeStore((s) => s.setCurrentModuleId)
  const unread = useHomeStore((s) => s.unread)
  const pulseScore = usePulseStore((s) => s.score)
  const pulseRunning = usePulseStore((s) => s.running)

  const today = useMemo(() => new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }), [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    async function load() {
      if (typeof navigator !== 'undefined' && !navigator.onLine) { router.push('/offline?from=/home'); return }
      try {
        setLoading(true); setError(null)
        const res = await fetch('/api/home', { cache: 'no-store', signal: controller.signal })
        if (!res.ok) { if (res.status === 401) return router.push('/login'); throw new Error('failed') }
        const json: HomeApi = await res.json()
        if (!active) return
        setData(json); setUnread(json.unread); setPulse(json.pulse); setStreakDays(json.streakDays)
        if (json.quickstart?.moduleId) setCurrentModuleId(json.quickstart.moduleId)
      } catch (e: any) { setError(e?.name === 'AbortError' ? 'timeout' : 'network') }
      finally { if (active) setLoading(false) }
    }

    track({ name: 'home_view' })
    load()

    let pollTimer: any
    async function syncUnread() {
      try { const r = await fetch('/api/notifications/unread-count', { cache: 'no-store' }); if (r.ok) { const { unread } = await r.json(); setUnread(unread ?? 0) } } catch {}
    }
    pollTimer = setInterval(syncUnread, 30000)
    const onVis = () => { if (document.visibilityState === 'visible') syncUnread() }
    window.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', syncUnread)
    return () => { active = false; clearTimeout(timeout); controller.abort(); clearInterval(pollTimer); window.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', syncUnread) }
  }, [router, setCurrentModuleId, setPulse, setStreakDays, setUnread])

  const tasks = data?.tasks ?? []
  const showEmptyTasks = !loading && tasks.length === 0

  useEffect(() => {
    if (!loading && data) {
      track({ name: 'home_impression_quickstart', props: { moduleId: data.quickstart?.moduleId } })
      const ids = (data.tasks || []).slice(0, 3).map((t) => t.moduleId)
      if (ids.length) track({ name: 'home_impression_task', props: { moduleIds: ids } })
    }
  }, [loading, data])

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-top">
          <div className="user-info">
            <Link href="/profile" aria-label="プロフィールへ">
              <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
            </Link>
            <div>
              <div>葵さん</div>
              <div className="streak" aria-live="polite">
                <Flame className="h-4 w-4" />
                <span className="streak-count">{data?.streakDays ?? 0}日</span>
              </div>
            </div>
          </div>
          <div className="notification">
            <Link href="/notifications" aria-label="通知へ">
              <div className="relative" role="button">
                <Bell />
                {unread > 0 && (
                  <span aria-label={`${unread}件の未読`} className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] rounded-full bg-red-500 text-white w-4 h-4">{unread}</span>
                )}
              </div>
            </Link>
          </div>
        </div>
        <div className="greeting"><h1>今日も学びを高めましょう</h1></div>
        <div className="date" aria-live="polite">{today}</div>
      </header>

      <div className="container-inner">
        <section className="quick-start" aria-label="続きから">
          <div className="section-title">
            <span>今日のおすすめ</span>
            <Link href="/learn-top" className="see-all" aria-label="おすすめをすべて見る">すべて見る</Link>
          </div>

          <QuickStartCard
            data={data?.quickstart}
            loading={loading}
            error={error === 'timeout' || error === 'network' ? 'error' : null}
            onRetry={() => location.reload()}
            onQuickStart={() => track({ name: 'home_click_quickstart' })}
          />

          {loading && (
            <div className="grid grid-cols-1 gap-3 mt-3">
              <TaskCard loading />
              <TaskCard loading />
              <TaskCard loading />
            </div>
          )}

          {!loading && showEmptyTasks && (
            <div className="mt-3" role="status" aria-live="polite">
              <div className="p-4 text-sm">今日のタスクはありません。おすすめから始めましょう</div>
              <div className="px-4 pb-4">
                <Link href="/learn-top"><Button variant="secondary" className="w-full">おすすめを見る</Button></Link>
              </div>
            </div>
          )}

          {!loading && tasks.length > 0 && (
            <div className="grid grid-cols-1 gap-3 mt-3">
              {tasks.slice(0, 3).map((m) => (
                <TaskCard key={m.id} module={m} onClick={() => track({ name: 'home_click_task', props: { moduleId: m.moduleId } })} onImpression={() => track({ name: 'home_impression_task', props: { moduleId: m.moduleId } })} />
              ))}
            </div>
          )}
        </section>

        <section className="pulse-section" aria-label="集中度">
          <PulseCard value={pulseRunning ? Math.round(pulseScore * 100) : (data?.pulse ?? 0)} />
        </section>

        <section className="challenge-section" aria-label="チャレンジ">
          <ChallengeStrip streakDays={data?.streakDays ?? 0} />
        </section>

        <section className="community-section" aria-label="友人アクティビティ">
          <Link href="/notifications?tab=social" className="flex items-center gap-3 rounded-lg border p-3" onClick={() => track({ name: 'home_click_social' })} aria-label="友人アクティビティを見る">
            <Users className="h-5 w-5" aria-hidden />
            <div>
              <div className="text-sm font-medium">友人アクティビティ</div>
              <div className="text-xs text-muted-foreground">最新の仲間の動きをチェック</div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  )
}
