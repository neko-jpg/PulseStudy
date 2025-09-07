"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ChallengeItem, ChallengeKind, ChallengeProgress } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { ChallengeTabs } from '@/components/challenge/ChallengeTabs'
import { ChallengeCard } from '@/components/challenge/ChallengeCard'
import dynamic from 'next/dynamic'
const ProgressModal = dynamic(() => import('@/components/challenge/ProgressModal').then(m => m.ProgressModal), { ssr: false })
import { SkeletonList } from '@/components/common/SkeletonList'
import { ErrorState } from '@/components/common/ErrorState'
import { Empty } from '@/components/common/Empty'
import { track } from '@/lib/analytics'
import { useToast } from '@/hooks/use-toast'
import './challenge.css'

export default function ChallengePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tab, setTab] = useState<ChallengeKind>('daily')
  const [items, setItems] = useState<ChallengeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressFor, setProgressFor] = useState<string | null>(null)
  const [progressData, setProgressData] = useState<ChallengeProgress | null>(null)
  const [progressOpen, setProgressOpen] = useState(false)

  async function loadList(kind: ChallengeKind, signal?: AbortSignal) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      router.push('/offline?from=/challenge')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/challenges?tab=${kind}`, { cache: 'no-store', signal })
      if (!res.ok) throw new Error('failed')
      const json = await res.json()
      setItems(json.items || [])
    } catch (e: any) {
      setError(e?.name === 'AbortError' ? 'timeout' : 'network')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    loadList(tab, controller.signal)
    return () => { clearTimeout(timeout); controller.abort() }
  }, [tab])

  function onTabChange(v: ChallengeKind) {
    setTab(v)
    track({ name: 'challenge_tab_change', props: { tab: v } })
  }

  async function onAccept(item: ChallengeItem) {
    try {
      await fetch('/api/challenge/accept', { method: 'POST' })
      track({ name: 'challenge_accept', props: { id: item.id, moduleId: item.moduleId } })
      toast({ description: 'チャレンジに参加しました。学習を開始します。' })
      // 参加済み表示を即時反映
      setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, joined: true } : it))
      router.push(`/learn?module=${item.moduleId}&source=challenge`)
    } catch {
      toast({ description: '参加に失敗しました。再試行してください。' })
    }
  }

  async function onViewProgress(id: string) {
    setProgressFor(id)
    setProgressOpen(true)
    track({ name: 'challenge_view_progress', props: { id } })
    try {
      const res = await fetch(`/api/challenge/progress?id=${id}`, { cache: 'no-store' })
      if (res.ok) setProgressData(await res.json())
    } catch {}
  }

  const content = useMemo(() => {
    if (loading) return <SkeletonList count={3} />
    if (error) return <ErrorState onRetry={() => setTab((t) => t)} />
    if (!items.length) return <Empty>新しいチャレンジを探しましょう</Empty>
    return (
      <div className="grid gap-3">
        {items.map((it) => (
          <ChallengeCard
            key={it.id}
            item={it}
            onAccept={onAccept}
            onViewProgress={onViewProgress}
            onImpression={(id) => track({ name: 'challenge_card_impression', props: { id } })}
          />
        ))}
      </div>
    )
  }, [loading, error, items])

  return (
      <div className="p-4 space-y-3">
        <h1 className="text-lg font-semibold">チャレンジ</h1>
        <ChallengeTabs value={tab} onChange={onTabChange} />
        {content}
        <ProgressModal open={progressOpen} onOpenChange={setProgressOpen} data={progressData} />
      </div>
  )
}
