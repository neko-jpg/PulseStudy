"use client";

import React, { useEffect, useState } from 'react';
import './analytics-new.css';
import NewAnalyticsHeader from '@/components/analytics/NewAnalyticsHeader';
import NewSummaryCards from '@/components/analytics/NewSummaryCards';
import NewHeatmap from '@/components/analytics/NewHeatmap';
import NewTopImprovements from '@/components/analytics/NewTopImprovements';
import { useNoStoreFetch } from '@/hooks/useNoStoreFetch';
type SummaryResp = { summary?: { mins: number; acc: number; avgFocus?: number }; heatmap?: Array<{ date: string; value: number }> }

export default function AnalyticsPage() {
  const { data, loading, error, retry } = useNoStoreFetch<SummaryResp>('/api/analytics/summary', { timeoutMs: 5000 })
  const [clientAvg, setClientAvg] = useState<number | null>(null)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO === '1') {
      try {
        let v: number | null = null
        const ls = Number(localStorage.getItem('lastAvgFocus') || '')
        if (Number.isFinite(ls)) v = ls
        if (v == null) {
          const m = (document.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith('lastAvgFocus='))
          if (m) {
            const n = Number(decodeURIComponent(m.split('=')[1] || ''))
            if (Number.isFinite(n)) v = n
          }
        }
        if (v != null) setClientAvg(v)
      } catch {}
    }
  }, [])

  const mins = data?.summary?.mins ?? 0
  const acc = (data?.summary?.acc ?? 0) * 100
  const avg = clientAvg ?? (data?.summary?.avgFocus ?? 0)

  return (
    <main className="main-content flex-1 p-8">
      <NewAnalyticsHeader />
      <NewSummaryCards isLoading={loading} totalStudyMinutes={mins} averageFocus={avg} accuracy={acc} />
      <NewHeatmap items={data?.heatmap ?? []} />
      <NewTopImprovements />
      {error && (
        <div className="mt-4 text-sm text-amber-300">
          データの取得に時間がかかっています。
          <button className="underline ml-2" onClick={retry}>再試行</button>
        </div>
      )}
    </main>
  );
}
