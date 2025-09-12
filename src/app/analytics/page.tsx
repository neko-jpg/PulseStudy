"use client";

import React from 'react';
import './analytics-new.css';
import NewAnalyticsHeader from '@/components/analytics/NewAnalyticsHeader';
import NewSummaryCards from '@/components/analytics/NewSummaryCards';
import NewHeatmap from '@/components/analytics/NewHeatmap';
import NewTopImprovements from '@/components/analytics/NewTopImprovements';
import { useNoStoreFetch } from '@/hooks/useNoStoreFetch';
type SummaryResp = { summary?: { mins: number; acc: number } }

export default function AnalyticsPage() {
  const { data, loading, error, retry } = useNoStoreFetch<SummaryResp>('/api/analytics/summary', { timeoutMs: 5000 })
  const mins = data?.summary?.mins ?? 0
  const acc = data?.summary?.acc ?? 0

  return (
    <main className="main-content flex-1 p-8">
      <NewAnalyticsHeader />
      <NewSummaryCards isLoading={loading} totalStudyMinutes={mins} averageFocus={acc*100} />
      <NewHeatmap />
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
