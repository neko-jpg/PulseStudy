"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'

export function QuickActions() {
  const { toast } = useToast()
  async function remind() {
    toast({ description: '未提出へリマインドを送信しました（モック）' })
  }
  async function repractice() {
    const res = await fetch('/api/repractice', { method: 'POST' })
    const json = await res.json()
    track({ name: 'teacher_send_repractice' })
    toast({ description: `再演習リンク: ${json.url}` })
  }
  async function notifyMissing() {
    const res = await fetch('/api/teacher/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    const json = await res.json()
    // 生成した通知深リンクを提示
    track({ name: 'teacher_notify_missing' })
    toast({ description: `通知深リンク: ${json.url}` })
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">クイックアクション</div>
        <div className="grid gap-2">
          <Button variant="secondary" onClick={remind}>未提出へリマインド</Button>
          <Button onClick={repractice}>再演習リンクを発行</Button>
          <Button variant="outline" onClick={notifyMissing}>未提出者へ通知リンク生成</Button>
        </div>
      </CardContent>
    </Card>
  )
}
