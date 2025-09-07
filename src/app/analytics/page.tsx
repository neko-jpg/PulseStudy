'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, BarChart4, CheckCircle, Clock, Share2, TrendingUp, Lightbulb, ArrowRight, Loader2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import './analytics.css';

// --- TYPE DEFINITIONS (unchanged) ---
interface Summary { totalTime: number; accuracy: number; flowScore: number; completedModules: number; }
interface HeatmapPoint { date: string; count: number; }
interface Improvement { moduleId: string; moduleName: string; reason: string; }
interface AnalyticsData { summary: Summary; heatmap: HeatmapPoint[]; top3: Improvement[]; }

// --- SKELETON COMPONENTS (unchanged) ---
const SummaryCardSkeleton = () => <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>;
const HeatmapSkeleton = () => <div className="grid grid-cols-7 gap-1">{Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="w-full aspect-square rounded-sm" />)}</div>;
const ImprovementCardSkeleton = () => <Card className="p-4"><div className="flex items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-5 w-5" /></div></Card>;

// --- MAIN ANALYTICS PAGE ---
export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // ... fetchData logic remains the same ...
    const fetchData = async () => { setLoading(true); try { const res = await fetch('/api/analytics'); const d = await res.json(); setData(d); } catch (e) { console.error(e); } finally { setLoading(false); } };
    fetchData();
  }, []);

  const getHeatmapColor = (count: number) => { /* ... as before ... */
    if (count === 0) return 'bg-muted/50'; if (count <= 2) return 'bg-blue-200 dark:bg-blue-900'; if (count <= 4) return 'bg-blue-400 dark:bg-blue-700'; return 'bg-blue-600 dark:bg-blue-500';
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/share/analytics', { method: 'POST' });
      const { shareUrl } = await res.json();

      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "共有リンクをコピーしました！",
        description: shareUrl,
        action: <Button variant="secondary" size="sm" onClick={() => window.open(shareUrl, '_blank')}>開く</Button>,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "エラー", description: "共有リンクの作成に失敗しました。" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="flex items-center p-2 border-b bg-background z-20 sticky top-0">
        <Button variant="ghost" size="icon" onClick={() => router.push('/home')}><ArrowLeft /></Button>
        <h1 className="ml-2 font-bold text-md sm:text-lg truncate">学習分析</h1>
        <div className="flex-grow" />
        <Button variant="outline" size="sm" onClick={handleShare} disabled={isSharing}>
            {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            共有
        </Button>
      </header>

      <main className="p-4 space-y-8">
        {/* Summary Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-3">サマリー</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading || !data ? (<><SummaryCardSkeleton /><SummaryCardSkeleton /><SummaryCardSkeleton /><SummaryCardSkeleton /></>) : (
              <>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><Clock className="mr-2 h-4 w-4 text-muted-foreground"/>学習時間</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.totalTime}分</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-muted-foreground"/>平均正答率</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{(data.summary.accuracy * 100).toFixed(0)}%</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-muted-foreground"/>集中スコア</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.flowScore}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><BarChart4 className="mr-2 h-4 w-4 text-muted-foreground"/>完了数</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.summary.completedModules}</p></CardContent></Card>
              </>
            )}
          </div>
        </section>

        {/* Heatmap */}
        <section>
          <h2 className="text-lg font-semibold mb-3">学習活動ヒートマップ</h2>
          {loading || !data ? <HeatmapSkeleton /> : ( <Card><CardContent className="p-4"><div className="grid grid-cols-7 gap-1">{data.heatmap.map(day => (<div key={day.date} title={`${day.date}: ${day.count} activities`} className={cn("w-full aspect-square rounded-sm", getHeatmapColor(day.count))} />))}</div></CardContent></Card> )}
        </section>

        {/* Top 3 Improvements */}
        <section>
          <h2 className="text-lg font-semibold mb-3">伸びしろ Top 3</h2>
          <div className="space-y-4">
            {loading || !data ? (<><ImprovementCardSkeleton /><ImprovementCardSkeleton /><ImprovementCardSkeleton /></>) : (
              data.top3.map(item => (
                <Card key={item.moduleId} className="p-4 cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/learn?module=${item.moduleId}`)}>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-full"><Lightbulb className="h-5 w-5 text-yellow-500" /></div>
                        <div className="flex-1"><p className="font-semibold">{item.moduleName}</p><p className="text-sm text-muted-foreground">{item.reason}</p></div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
