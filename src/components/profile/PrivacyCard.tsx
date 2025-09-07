"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type Mode = 'private' | 'link' | 'public'

export function PrivacyCard({ mode, onSave, saving }: { mode: Mode, onSave: (m: Mode) => void, saving?: boolean }) {
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const m = (form.elements.namedItem('privacy') as RadioNodeList).value as Mode
    onSave(m)
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">プライバシー</div>
        <form onSubmit={onSubmit} className="grid gap-3">
          <RadioGroup defaultValue={mode} name="privacy">
            <div className="flex items-center space-x-2"><RadioGroupItem id="p1" value="private" /><Label htmlFor="p1">非公開</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem id="p2" value="link" /><Label htmlFor="p2">リンク共有</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem id="p3" value="public" /><Label htmlFor="p3">公開</Label></div>
          </RadioGroup>
          <div><Button type="submit" disabled={saving} aria-label="プライバシー設定を保存">{saving ? '保存中...' : '保存'}</Button></div>
        </form>
      </CardContent>
    </Card>
  )
}

