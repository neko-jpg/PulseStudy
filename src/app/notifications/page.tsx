'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bell, BookOpen, CheckCheck, GitMerge, Target, Users, Sparkles, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// --- TYPE & HELPER COMPONENTS (unchanged) ---
interface Notification { id: string; type: string; moduleId?: string; challengeId?: string; message: string; unread: boolean; createdAt: string; }
const NotificationIcon = ({ type }: { type: string }) => { /* ... */
  const commonClass = "h-6 w-6";
  switch (type) {
    case 'learning': return <BookOpen className={cn(commonClass, "text-blue-500")} />;
    case 'social': return <Users className={cn(commonClass, "text-pink-500")} />;
    case 'challenge': return <Target className={cn(commonClass, "text-green-500")} />;
    case 'system': return <GitMerge className={cn(commonClass, "text-gray-500")} />;
    default: return <Bell className={cn(commonClass, "text-gray-500")} />;
  }
};
const NotificationItemSkeleton = () => ( <div className="flex items-start gap-4 p-4"><Skeleton className="h-8 w-8 rounded-full mt-1" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-3 w-12" /></div> );

// --- MAIN NOTIFICATIONS PAGE ---
export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [data, setData] = useState<{ items: Notification[], unread: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifs?tab=${activeTab}`);
      const result = await res.json();
      setData(result);
    } catch (error) { console.error("Failed to fetch notifications:", error); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNotificationClick = (item: Notification) => {
    // 1. Optimistic UI update
    if (item.unread) {
      setData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          items: prevData.items.map(n => n.id === item.id ? { ...n, unread: false } : n),
          unread: prevData.unread - 1,
        };
      });
    }

    // 2. API call in the background
    fetch(`/api/notifs/${item.id}/read`, { method: 'POST' });

    // 3. Navigation
    if (item.type === 'learning' && item.moduleId) {
      router.push(`/learn?module=${item.moduleId}`);
    } else if (item.type === 'challenge' && item.challengeId) {
      router.push(`/challenge?id=${item.challengeId}`);
    }
    // Add other navigation logic here
  };

  const handleMarkAllRead = async () => {
    if (!data || data.unread === 0) return;
    setIsMarkingAll(true);

    // Optimistic UI Update
    const originalData = { ...data };
    setData(prev => prev ? { ...prev, items: prev.items.map(i => ({...i, unread: false})), unread: 0 } : null);

    try {
      await fetch('/api/notifs/read-all', { method: 'POST' });
    } catch (error) {
      // Revert on error
      setData(originalData);
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const TABS = [ /* ... */ { value: 'all', label: 'すべて' }, { value: 'unread', label: '未読' }, { value: 'learning', label: '学習' }, { value: 'social', label: 'ソーシャル' }, { value: 'system', label: 'システム' }];

  return (
    <div className="bg-background min-h-screen">
      <header className="flex items-center p-2 border-b bg-background z-20 sticky top-0">
        <Button variant="ghost" size="icon" onClick={() => router.push('/home')}><ArrowLeft /></Button>
        <h1 className="ml-2 font-bold text-md sm:text-lg truncate">通知</h1>
        <div className="flex-grow" />
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isMarkingAll || loading || !data?.unread}>
          {isMarkingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
          すべて既読
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">{TABS.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}</TabsList>
      </Tabs>

      <main>
        {loading ? ( <div className="divide-y">{Array.from({ length: 5 }).map((_, i) => <NotificationItemSkeleton key={i} />)}</div>
        ) : data && data.items.length > 0 ? (
          <div className="divide-y">
            {data.items.map(item => (
              <div key={item.id} onClick={() => handleNotificationClick(item)} className={cn("flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50", item.unread && "bg-blue-50 dark:bg-blue-900/20")}>
                <div className="p-2 bg-muted rounded-full mt-1"><NotificationIcon type={item.type} /></div>
                <div className="flex-1">
                  <p className="font-semibold">{item.message}</p>
                  <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ja })}</p>
                </div>
                {item.unread && <div className="h-3 w-3 rounded-full bg-blue-500 mt-2" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground"><Sparkles className="mx-auto h-12 w-12 mb-4" /><p>通知はすべて確認済みです！</p></div>
        )}
      </main>
    </div>
  );
}
