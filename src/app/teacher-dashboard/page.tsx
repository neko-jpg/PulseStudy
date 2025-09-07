"use client"

import { useEffect, useState } from 'react'
import { useTeacherStore } from '@/store/teacher'
import { useAuthStore } from '@/store/authStore'
import { ClassSummaryCards } from '@/components/teacher/ClassSummaryCards'
import { AssignmentWizard } from '@/components/teacher/AssignmentWizard'
import { AssignmentList } from '@/components/teacher/AssignmentList'
import { StudentTable } from '@/components/teacher/StudentTable'
import { QuickActions } from '@/components/teacher/QuickActions'
import { ClassCompare } from '@/components/teacher/ClassCompare'
import { Button } from '@/components/ui/button'
import './teacher-dashboard.css'

export default function TeacherDashboardPage() {
  const role = useAuthStore(s => s.role)
  const classId = useTeacherStore(s => s.classId)
  const setClassId = useTeacherStore(s => s.setClassId)
  const classes = useTeacherStore(s => s.classes)
  const setClasses = useTeacherStore(s => s.setClasses)
  const summary = useTeacherStore(s => s.summary)
  const setSummary = useTeacherStore(s => s.setSummary)
  const setAssignments = useTeacherStore(s => s.setAssignments)
  const wizardOpen = useTeacherStore(s => s.wizardOpen)
  const openWizard = useTeacherStore(s => s.openWizard)
  const closeWizard = useTeacherStore(s => s.closeWizard)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role !== 'teacher') return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    async function init() {
      try {
        setLoading(true)
        setError(null)
        const cs = await fetch('/api/classes', { cache:'no-store', signal: controller.signal }).then(r=>r.json())
        setClasses(cs.items || [])
        const cid = (cs.items?.[0]?.id) || 'c1'
        setClassId(cid)
      } catch (e:any) {
        if (e?.name === 'AbortError') setError('timeout')
        else setError('network')
      } finally {
        setLoading(false)
        clearTimeout(timeout)
      }
    }
    init()
    return () => { controller.abort(); clearTimeout(timeout) }
  }, [role, setClassId, setClasses])

  useEffect(() => {
    if (!classId) return
    // summary
    fetch(`/api/classes/${classId}/summary`, { cache:'no-store' }).then(r=>r.json()).then(setSummary)
    // assignments
    fetch(`/api/classes/${classId}/assignments`, { cache:'no-store' }).then(r=>r.json()).then(j=>setAssignments(j.items || []))
  }, [classId, setSummary, setAssignments])

  if (role !== 'teacher') return <div className="p-6 text-sm">教師権限が必要です。</div>
  if (loading) return <div className="p-6">読み込み中…</div>
  if (error) return <div className="p-6 text-sm">読み込みに失敗しました。<button className="underline ml-2" onClick={()=>location.reload()}>再試行</button></div>

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="md:col-span-3 space-y-3">
        <div className="flex items-center gap-2">
          <select className="border rounded p-2 text-sm" value={classId} onChange={(e)=>setClassId(e.target.value)} aria-label="クラス選択">
            {classes.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <Button size="sm" onClick={openWizard} aria-label="課題を作成">課題を作成</Button>
        </div>
        {summary && <ClassSummaryCards mins={summary.mins} acc={summary.acc} flow={summary.flow} />}
        <ClassCompare />
        <AssignmentList />
        <StudentTable classId={classId} />
      </div>
      <div className="space-y-3">
        <QuickActions />
      </div>
      <AssignmentWizard open={wizardOpen} onOpenChange={o=> o?openWizard():closeWizard()} />
    </div>
  )
}
