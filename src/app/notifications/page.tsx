"use client";

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Users, GitMerge, ChevronRight, Mail } from 'lucide-react';
import './notifications.css';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomeStore } from '@/store/homeStore';

export type NotifItem = {
  id: string;
  type: 'learning' | 'social' | 'system';
  moduleId?: string;
  title: string;
  text: string;
  unread: boolean;
  ts: number;
};

function NotificationsInner() {
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotifItem[]>([]);
  const setUnread = useHomeStore((s) => s.setUnread);

  useEffect(() => {
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [params]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/notifications', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        if (!active) return;
        const list: NotifItem[] = json.items || [];
        setItems(list);
        const cnt = list.filter((i) => i.unread).length;
        setUnread(cnt);
      } catch (e: any) {
        setError(e?.name === 'AbortError' ? 'timeout' : 'network');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [setUnread]);

  const unreadCount = useMemo(() => items.filter(i => i.unread).length, [items]);

  const markRead = async (id: string, unread: boolean) => {
    setItems((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, unread } : n));
      const cnt = next.filter((i) => i.unread).length;
      setUnread(cnt);
      import('@/lib/analytics').then((m) => m.track({ name: 'notif_mark_read', props: { id, unread } }));
      return next;
    });
    try { await fetch(`/api/notifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unread }) }) } catch {}
  };

  const markAllRead = async () => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, unread: false }));
      setUnread(0);
      import('@/lib/analytics').then((m) => m.track({ name: 'notif_mark_all_read' }));
      return next;
    });
    try { await fetch('/api/notifications/mark-all-read', { method: 'POST' }) } catch {}
  };

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'unread': return items.filter(i => i.unread);
      case 'learning': return items.filter(i => i.type === 'learning');
      case 'social': return items.filter(i => i.type === 'social');
      case 'system': return items.filter(i => i.type === 'system');
      default: return items;
    }
  }, [items, activeTab]);

  const IconFor = (t: NotifItem['type']) => t === 'learning' ? BookOpen : t === 'social' ? Users : GitMerge;

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <div className="header-top">
          <Link href="/home" className="text-white" aria-label="戻る">
            <ChevronRight className="rotate-180" />
          </Link>
          <div className="unread-count" aria-live="polite">
            <Mail size={16} />
            <span className="count-number">{unreadCount}件の未読</span>
          </div>
          <div className="header-actions">
            <button className="header-button" onClick={markAllRead} aria-label="すべて既読">既読</button>
            <Link href="/profile" className="header-button" aria-label="設定">
              <ChevronRight />
            </Link>
          </div>
        </div>
        <h1 className="notifications-title">通知 & 受信箱</h1>
        <p className="notifications-subtitle">最新の更新とメッセージ</p>
      </header>

      <div className="container-inner">
        <div className="tabs-navigation">
          {['all','unread','learning','social','system'].map(tab => (
            <button key={tab} className={`tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}>
              {tab === 'all' && 'すべて'}
              {tab === 'unread' && '未読'}
              {tab === 'learning' && '学習'}
              {tab === 'social' && 'ソーシャル'}
              {tab === 'system' && 'システム'}
            </button>
          ))}
        </div>

        <div className="notifications-list" aria-live="polite">
          {loading && (
            <>
              {[1,2,3].map(i => (
                <div key={i} className="notification-item">
                  <div className="notification-icon"><Skeleton className="h-5 w-5 rounded" /></div>
                  <div className="notification-content w-full">
                    <div className="notification-title"><Skeleton className="h-4 w-32" /></div>
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <div className="notification-meta mt-3">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && error && (
            <div className="p-4 text-sm">
              読み込みに失敗しました。<button className="underline ml-2" onClick={() => location.reload()}>再試行</button>
            </div>
          )}

          {!loading && !error && filtered.map((n) => {
            const Icon = IconFor(n.type);
            return (
              <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                <div className={`notification-icon icon-${n.type}`}>
                  <Icon size={20} />
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    <span>{n.title}</span>
                    {n.unread && <span className="notification-badge badge-new">New</span>}
                  </div>
                  <p className="notification-text">{n.text}</p>
                  <div className="notification-meta">
                    <div className="notification-time">{Math.max(1, Math.round((Date.now() - n.ts)/60000))}分前</div>
                    <div className="notification-actions">
                      {n.type === 'learning' ? (
                        <Link href={`/learn?module=${n.moduleId ?? 'last'}&source=notif`} className="action-button button-primary" aria-label="1タップで学習開始">学習する</Link>
                      ) : null}
                      <button className="action-button button-secondary ml-2" onClick={() => markRead(n.id, !n.unread)} aria-label={n.unread ? '既読にする' : '未読に戻す'}>
                        {n.unread ? '既読' : '未読へ'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="p-4">読み込み中…</div>}>
      <NotificationsInner />
    </Suspense>
  );
}
