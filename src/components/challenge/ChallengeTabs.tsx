"use client"

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {
  value: 'daily' | 'weekly' | 'special'
  onChange: (v: 'daily' | 'weekly' | 'special') => void
}

export function ChallengeTabs({ value, onChange }: Props) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as any)}>
      <TabsList role="tablist" aria-label="チャレンジ種別">
        <TabsTrigger value="daily" aria-selected={value==='daily'}>Daily</TabsTrigger>
        <TabsTrigger value="weekly" aria-selected={value==='weekly'}>Weekly</TabsTrigger>
        <TabsTrigger value="special" aria-selected={value==='special'}>Special</TabsTrigger>
      </TabsList>
    </Tabs>
  )}

