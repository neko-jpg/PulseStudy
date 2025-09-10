"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'private' | 'link' | 'public'

export function PrivacyCard({ mode, onSave, saving }: { mode: Mode, onSave: (m: Mode) => void, saving?: boolean }) {
  const options: { id: Mode, label: string }[] = [
    { id: 'private', label: '非公開' },
    { id: 'link', label: 'リンク共有' },
    { id: 'public', label: '公開' },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">プライバシー</h3>
      <div className="space-y-3">
        {options.map(option => (
          <Button
            key={option.id}
            variant={mode === option.id ? 'default' : 'secondary'}
            className={cn(
              "w-full justify-between p-3 rounded-lg text-left",
              mode === option.id
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            )}
            onClick={() => onSave(option.id)}
            disabled={saving}
          >
            <span>{option.label}</span>
            {mode === option.id && <Check className="h-4 w-4" />}
          </Button>
        ))}
      </div>
    </Card>
  )
}

