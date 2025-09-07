"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export function NotifPrefsCard({ value, onSave, saving, quiet }: { value: { learn: boolean; challenge: boolean; social: boolean }, onSave: (v: { learn: boolean; challenge: boolean; social: boolean, quietStart?: string, quietEnd?: string }) => void, saving?: boolean, quiet?: { start: string, end: string } }) {
  const [v, setV] = ((): [any, any] => {
    return [(value), (nv: any) => {}]
  })()
  // lightweight controlled via form submit to keep simple
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const learn = (form.elements.namedItem('learn') as HTMLInputElement).checked
    const challenge = (form.elements.namedItem('challenge') as HTMLInputElement).checked
    const social = (form.elements.namedItem('social') as HTMLInputElement).checked
    const quietStart = (form.elements.namedItem('quietStart') as HTMLInputElement).value
    const quietEnd = (form.elements.namedItem('quietEnd') as HTMLInputElement).value
    onSave({ learn, challenge, social, quietStart, quietEnd })
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">通知プリセット</div>
        <form onSubmit={onSubmit} className="grid gap-2">
          <label className="flex items-center justify-between text-sm">学習通知 <Switch name="learn" defaultChecked={value.learn} aria-label="学習通知" /></label>
          <label className="flex items-center justify-between text-sm">チャレンジ <Switch name="challenge" defaultChecked={value.challenge} aria-label="チャレンジ通知" /></label>
          <label className="flex items-center justify-between text-sm">ソーシャル <Switch name="social" defaultChecked={value.social} aria-label="ソーシャル通知" /></label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="flex items-center justify-between">サイレント開始<input className="border rounded p-1 text-xs" name="quietStart" type="time" defaultValue={quiet?.start || '22:00'} aria-label="サイレント開始" /></label>
            <label className="flex items-center justify-between">サイレント終了<input className="border rounded p-1 text-xs" name="quietEnd" type="time" defaultValue={quiet?.end || '07:00'} aria-label="サイレント終了" /></label>
          </div>
          <div><Button type="submit" disabled={saving} aria-label="通知設定を保存">{saving ? '保存中...' : '保存'}</Button></div>
        </form>
      </CardContent>
    </Card>
  )
}
