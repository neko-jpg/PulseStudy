"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { GoalCard } from '@/components/profile/GoalCard'
import { NotifPrefsCard } from '@/components/profile/NotifPrefsCard'
import { PrivacyCard } from '@/components/profile/PrivacyCard'
import { DataSection } from '@/components/profile/DataSection'
import { UpgradeCard } from '@/components/profile/UpgradeCard'
import './profile.css'
import { BadgeShelf } from '@/components/profile/BadgeShelf'
import { BestTimeCard } from '@/components/profile/BestTimeCard'

type Summary = { mins:number; acc:number; streak:number; badges:number }
type Goals = { dailyMins:number; weeklyMins:number }
type Notifs = { learn:boolean; challenge:boolean; social:boolean }
type Privacy = { mode: 'private'|'link'|'public' }

type Payload = {
  user: { name:string; handle:string; avatar?:string }
  summary: Summary
  goals: Goals
  notifs: Notifs
  quiet?: { start:string; end:string }
  privacy: Privacy
  plan: { tier: 'free' | 'plus' }
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Payload | null>(null)
  const [saving, setSaving] = useState({ goals:false, notifs:false, privacy:false, export:false, delete:false })
  const [plan, setPlan] = useState<'free'|'plus'>('free')

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/profile', { cache: 'no-store', signal: controller.signal })
        if (!res.ok) throw new Error('failed')
        const j = await res.json(); setData(j); setPlan(j.plan?.tier || 'free')
      } catch (e:any) {
        if (e?.name === 'AbortError') setError('timeout')
        else if (typeof navigator !== 'undefined' && !navigator.onLine) router.push('/offline?from=/profile')
        else setError('network')
      } finally {
        setLoading(false)
        clearTimeout(timeout)
      }
    }
    load()
    return () => { controller.abort(); clearTimeout(timeout) }
  }, [router])

  async function saveGoals(v: Goals) {
    try { setSaving(s => ({...s, goals:true})); await fetch('/api/settings/goals', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(v) }); track({ name:'settings_save_goal', props:v }); toast({ description:'目標を保存しました' }) } finally { setSaving(s => ({...s, goals:false})) }
  }
  async function saveNotifs(v: Notifs & { quietStart?: string, quietEnd?: string }) {
    try { setSaving(s => ({...s, notifs:true})); await fetch('/api/settings/notifications', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(v) }); track({ name:'notif_settings_change', props:v }); toast({ description:'通知設定を保存しました' }) } finally { setSaving(s => ({...s, notifs:false})) }
  }
  async function savePrivacy(m: Privacy['mode']) {
    try { setSaving(s => ({...s, privacy:true})); await fetch('/api/settings/privacy', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mode:m }) }); track({ name:'privacy_mode_change', props:{mode:m} }); toast({ description:'プライバシー設定を保存しました' }) } finally { setSaving(s => ({...s, privacy:false})) }
  }
  async function doExport() {
    try { setSaving(s => ({...s, export:true})); const res = await fetch('/api/data/export', { method:'POST' }); const json = await res.json(); track({ name:'data_export' }); toast({ description:`エクスポートを開始しました (Job: ${json.jobId})` }) } finally { setSaving(s => ({...s, export:false})) }
  }
  async function doDelete() {
    try { setSaving(s => ({...s, delete:true})); await fetch('/api/data/delete', { method:'POST' }); track({ name:'data_delete' }); toast({ description:'アカウントを削除しました' }); router.push('/') } finally { setSaving(s => ({...s, delete:false})) }
  }

  if (loading) return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
  if (error) return (
    <div className="p-6 text-center">
      <div className="mb-3">読み込みに失敗しました。</div>
      <button className="underline" onClick={() => location.reload()}>再試行</button>
    </div>
  )
  if (!data) return null

  return (
    <div className="p-4 space-y-3">
      <ProfileHeader user={data.user} summary={data.summary} />
      {plan === 'plus' ? <BestTimeCard /> : <UpgradeCard onUpgraded={() => setPlan('plus')} />}
      <GoalCard value={data.goals} onSave={saveGoals} saving={saving.goals} />
      <NotifPrefsCard value={data.notifs} onSave={saveNotifs} saving={saving.notifs} quiet={data.quiet} />
      <PrivacyCard mode={data.privacy.mode} onSave={savePrivacy} saving={saving.privacy} />
      <BadgeShelf />
      <DataSection onExport={doExport} onDelete={doDelete} exporting={saving.export} deleting={saving.delete} />
    </div>
  )
}
