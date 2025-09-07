"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'
import { useTeacherStore, type StudentRow } from '@/store/teacher'
import { StudentDrawer } from './StudentDrawer'
import { track } from '@/lib/analytics'

export function StudentTable({ classId }: { classId?: string }) {
  const students = useTeacherStore(s => s.students)
  const setStudents = useTeacherStore(s => s.setStudents)
  const [drawer, setDrawer] = useState<{ open: boolean; id?: string; name?: string }>({ open: false })
  const [logs, setLogs] = useState<any[] | null>(null)

  useEffect(() => {
    if (!classId) return
    fetch(`/api/classes/${classId}/students`, { cache: 'no-store' }).then(r => r.json()).then(j => setStudents(j.items || []))
  }, [classId, setStudents])

  async function openStudent(s: StudentRow) {
    setDrawer({ open: true, id: s.id, name: s.name })
    setLogs(null)
    track({ name: 'teacher_open_student', props: { id: s.id } })
    const res = await fetch(`/api/classes/${classId}/students/${s.id}`, { cache: 'no-store' })
    if (res.ok) setLogs((await res.json()).logs)
  }

  function exportCSV() {
    const headers = ['id','name','mins','acc','flow','progress']
    const rows = students.map(s => [s.id, s.name, s.mins, s.acc, s.flow, s.progress])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_${classId || 'class'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">生徒</div>
          <button className="text-xs underline" onClick={exportCSV} aria-label="CSVエクスポート">CSVエクスポート</button>
        </div>
        <div className="grid gap-2">
          {students.map(s => (
            <button key={s.id} className="flex items-center gap-3 border rounded p-2 text-left" onClick={() => openStudent(s)}>
              <div className="w-10 h-10 rounded bg-neutral-200 flex items-center justify-center text-sm">{s.name.charAt(0)}</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="flex items-center gap-2">
                  <Progress value={s.progress} className="h-2" />
                  <span className="text-xs text-muted-foreground">{s.progress}%</span>
                </div>
                <div className="text-xs text-muted-foreground">{s.mins}分 / {Math.round(s.acc*100)}% / {s.flow}%</div>
              </div>
            </button>
          ))}
        </div>
        <StudentDrawer open={drawer.open} onOpenChange={(o)=>setDrawer(d=>({ ...d, open:o }))} name={drawer.name} logs={logs||undefined} />
      </CardContent>
    </Card>
  )
}
