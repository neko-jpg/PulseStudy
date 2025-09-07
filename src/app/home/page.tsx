'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell, Flame, Users, ArrowRight, BarChart, BrainCircuit, Atom, BookOpen, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './home.css';

// 型定義
interface Quickstart { moduleId: string; moduleName: string; progress: number; }
interface Task { id: string; moduleId: string; title: string; subject: string; icon: string; }
interface HomeData { quickstart: Quickstart; tasks: Task[]; unread: number; }

// アイコンコンポーネント
const TaskIcon = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'brain-circuit': return <BrainCircuit className="h-6 w-6 text-muted-foreground" />;
    case 'atom': return <Atom className="h-6 w-6 text-muted-foreground" />;
    case 'book-open': return <BookOpen className="h-6 w-6 text-muted-foreground" />;
    default: return <BarChart className="h-6 w-6 text-muted-foreground" />;
  }
};

// スケルトンコンポーネント
const QuickStartSkeleton = () => (<Card className="task-card bg-primary/80 text-primary-foreground"><CardHeader><Skeleton className="h-6 w-3/4 bg-primary/50" /></CardHeader><CardContent><div className="flex justify-between items-center mb-2"><Skeleton className="h-4 w-1/3 bg-primary/50" /><Skeleton className="h-10 w-24 bg-primary/50" /></div><Skeleton className="h-2 w-full bg-primary/50" /></CardContent></Card>);
const TaskCardSkeleton = () => (<Card className="task-card-sm"><CardContent className="flex items-center justify-between p-4"><div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-4 w-[100px]" /></div></div><Skeleton className="h-5 w-5 rounded-full" /></CardContent></Card>);
const AnalyticsSummarySkeleton = () => (<Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium"><Skeleton className="h-5 w-32" /></CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4 mb-1" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-2 w-full mt-4" /></CardContent></Card>);
const FriendActivitySkeleton = () => (<Card><CardContent className="p-4 space-y-4">{[...Array(2)].map((_, i) => (<div key={i} className="flex items-center"><Skeleton className="h-9 w-9 rounded-full" /><div className="ml-4 space-y-2"><Skeleton className="h-4 w-[200px]" /><Skeleton className="h-3 w-[50px]" /></div></div>))}<Skeleton className="h-10 w-full" /></CardContent></Card>);


// ============== MAIN HOME PAGE COMPONENT ==============
export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName] = useState('葵');
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/home');
        if (!res.ok) throw new Error('Failed to fetch');
        const homeData: HomeData = await res.json();
        setData(homeData);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const greetingMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return `おはようございます、${userName}さん！`;
    if (hour >= 12 && hour < 18) return `こんにちは、${userName}さん！`;
    return `夜の学習、お疲れ様です🌃`;
  }, [userName]);

  const handleNavigate = (path: string) => router.push(path);

  return (
    <div className={cn("home-container p-4 sm:p-6 min-h-screen", focusMode ? "bg-blue-50 dark:bg-blue-950" : "bg-gray-50 dark:bg-gray-900", "transition-colors duration-300")}>
      <header className="home-header mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Link href="/profile"><Avatar className="h-10 w-10"><AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${userName}`} alt={userName} /><AvatarFallback>{userName.charAt(0)}</AvatarFallback></Avatar></Link>
            <div>
              <div className="font-semibold text-lg">{userName}さん</div>
              <div className="flex items-center text-sm text-muted-foreground"><Flame className="h-4 w-4 mr-1 text-orange-500" /><span>7日連続</span></div>
            </div>
          </div>
          <div className="flex items-center">
            <Button onClick={() => setFocusMode(!focusMode)} variant="ghost" size="icon" title="フォーカスモード切替">
              <EyeOff className={cn("h-6 w-6 transition-colors", focusMode ? 'text-primary' : 'text-muted-foreground')} />
            </Button>
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                {!loading && data && data.unread > 0 && !focusMode && (<span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 justify-center items-center text-white text-[10px]">{data.unread}</span></span>)}
              </Button>
            </Link>
          </div>
        </div>
        <div className="greeting"><h1 className="text-2xl font-bold">{greetingMessage}</h1></div>
      </header>

      <main className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">続きから</h2>
          {loading || !data ? <QuickStartSkeleton /> : (<Card onClick={() => handleNavigate(`/learn?module=${data.quickstart.moduleId}`)} className="task-card bg-primary text-primary-foreground cursor-pointer transition-transform hover:scale-105"><CardHeader><CardTitle>{data.quickstart.moduleName}</CardTitle></CardHeader><CardContent><div className="flex justify-between items-center mb-2"><p className="text-sm">学習の続きから</p><Button variant="secondary" size="sm">始める <ArrowRight className="ml-2 h-4 w-4" /></Button></div><Progress value={data.quickstart.progress} className="w-full" /></CardContent></Card>)}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">今日の3タスク</h2>
          <div className="grid gap-4">
            {loading || !data ? (<><TaskCardSkeleton /><TaskCardSkeleton /><TaskCardSkeleton /></>) : (data.tasks.map(task => (<Card key={task.id} onClick={() => handleNavigate(`/learn?module=${task.moduleId}`)} className="task-card-sm cursor-pointer transition-transform hover:scale-105"><CardContent className="flex items-center justify-between p-4"><div className="flex items-center gap-4"><div className="bg-muted p-3 rounded-full"><TaskIcon iconName={task.icon} /></div><div><p className="font-semibold">{task.title}</p><p className="text-sm text-muted-foreground">{task.subject}</p></div></div><ArrowRight className="h-5 w-5 text-muted-foreground" /></CardContent></Card>)))}
          </div>
        </section>

        {!focusMode && (<>
          <section>
              <h2 className="text-lg font-semibold mb-3">進捗サマリ</h2>
              {loading ? <AnalyticsSummarySkeleton /> : (<Card onClick={() => handleNavigate('/analytics')} className="cursor-pointer transition-transform hover:scale-105"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">学習アナリティクス</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">78%</div><p className="text-xs text-muted-foreground">先週からの平均正答率</p><div className="mt-4 h-2 w-full bg-muted rounded-full"><div style={{width: '78%'}} className="h-2 bg-primary rounded-full"></div></div></CardContent></Card>)}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">友人アクティビティ</h2>
            {loading ? <FriendActivitySkeleton /> : (<Card><CardContent className="p-4 space-y-4"><div className="flex items-center"><Avatar className="h-9 w-9"><AvatarImage src="https://api.dicebear.com/7.x/micah/svg?seed=Kenta" alt="Kenta" /><AvatarFallback>K</AvatarFallback></Avatar><div className="ml-4 space-y-1"><p className="text-sm font-medium leading-none">健太さんが「三角関数」を完了</p><p className="text-sm text-muted-foreground">12分前</p></div></div><div className="flex items-center"><Avatar className="h-9 w-9"><AvatarImage src="https://api.dicebear.com/7.x/micah/svg?seed=Sakura" alt="Sakura" /><AvatarFallback>S</AvatarFallback></Avatar><div className="ml-4 space-y-1"><p className="text-sm font-medium leading-none">さくらさんが3日連続で学習中</p><p className="text-sm text-muted-foreground">1時間前</p></div></div><Button onClick={() => handleNavigate('/notifications?tab=social')} variant="outline" className="w-full">全て見る</Button></CardContent></Card>)}
          </section>
        </>)}
      </main>
    </div>
  );
}
