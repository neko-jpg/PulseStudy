"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useTeacherStore } from '@/store/teacher'
import { track } from '@/lib/analytics'

export function AssignmentWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const addAssignment = useTeacherStore(s => s.addAssignment)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [loading, setLoading] = useState(false)
  async function onSave() {
    try {
      setLoading(true)
      const res = await fetch('/api/assignments', { method: 'POST' })
      const { id } = await res.json()
      addAssignment({ id, title: title || '新しい課題', status: 'draft', dueAt: due || new Date(Date.now()+7*24*3600e3).toISOString() })
      track({ name: 'assign_create', props: { id } })
      onOpenChange(false)
    } finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>課題作成</DialogTitle></DialogHeader>
        <div className="grid gap-2">
          <label className="text-sm">タイトル<Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例: 二次関数 基礎" /></label>
          <label className="text-sm">締切日<Input type="date" value={due} onChange={e=>setDue(e.target.value)} /></label>
          <div className="flex gap-2 justify-end"><Button onClick={onSave} disabled={loading}>{loading?'保存中…':'下書き保存'}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

