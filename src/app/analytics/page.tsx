"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { Heatmap } from '@/components/analytics/Heatmap';
import { TopImprovements } from '@/components/analytics/TopImprovements';
import { track } from '@/lib/analytics';
import './analytics.css';

type Summary = { mins: number; acc: number; flow: number };
type HeatCell = { date: string; value: number };
type TrendPoint = { date: string; mins: number; acc: number; flow: number };
type AnalyticsPayload = { summary: Summary; heatmap: HeatCell[]; trends?: TrendPoint[]; top3: string[] };

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[] | null>(null);
  const [modal, setModal] = useState<'none' | 'summary'>('none');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/analytics', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        if (e?.name === 'AbortError') setError('timeout');
        else setError('network');
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    }
    load();
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  async function fetchLogs(date: string) {
    try {
      setActiveDate(date);
      setLogs(null);
      const res = await fetch(`/api/analytics?date=${date}`, { cache: 'no-store' });
      if (res.ok) setLogs((await res.json()).logs);
      track({ name: 'analytics_heatmap_click', props: { date } });
    } catch {}
  }

  const trends = data?.trends ?? [];

  return (
    <main className="main-content flex-1 p-8">
      <AnalyticsHeader />

      {loading && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="card p-6 text-center">
          <p>読み込みに失敗しました。</p>
          <button className="underline mt-2" onClick={() => location.reload()}>
            再試行
          </button>
        </div>
      )}

      {data && (
        <>
          <SummaryCards
            mins={data.summary.mins}
            acc={data.summary.acc}
            flow={data.summary.flow}
            onOpen={(m) => {
              setModal('summary');
              track({ name: 'analytics_card_open', props: { metric: m } });
            }}
          />

          <Heatmap cells={data.heatmap} onClick={fetchLogs} />

          {activeDate && (
            <div className="card p-6 my-8">
              <div className="text-sm font-medium mb-2">{activeDate} のログ</div>
              {!logs && <Skeleton className="h-8 w-full" />}
              {logs && logs.length > 0 ? (
                <ul className="text-sm mt-2 space-y-1">
                  {logs.map((l, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{l.time}</span>
                      <span className="text-muted-foreground">{l.moduleId}</span>
                      <span>{l.mins}分</span>
                      <span>{Math.round(l.acc * 100)}%</span>
                      <span>{l.flow}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-sm text-gray-400">この日の学習ログはありません。</p>
              )}
            </div>
          )}

          <TopImprovements items={data.top3} onClick={(id) => track({ name: 'improvement_click', props: { moduleId: id } })} />

          <Dialog open={modal === 'summary'} onOpenChange={(o) => setModal(o ? 'summary' : 'none')}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>サマリー詳細</DialogTitle>
              </DialogHeader>
              <div className="text-sm space-y-1">
                {trends.slice(-7).map((t) => (
                  <div key={t.date} className="flex justify-between">
                    <span>{t.date}</span>
                    <span>{t.mins}分</span>
                    <span>{Math.round(t.acc * 100)}%</span>
                    <span>{t.flow}%</span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </main>
  );
}
