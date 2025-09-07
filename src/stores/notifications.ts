import { create } from 'zustand';

// 通知アイテムの型定義
interface NotificationItem {
  id: string;
  type: 'learning' | 'social' | 'system' | 'challenge';
  message: string;
  unread: boolean;
  createdAt: string;
  // 深層リンクのためのオプショナルな情報
  moduleId?: string;
  challengeId?: string;
  roomId?: string;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  setNotifications: (data: { items: NotificationItem[], unreadCount: number }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotifStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  setNotifications: (data) => set({ items: data.items, unreadCount: data.unreadCount }),
  markAsRead: (id) => set((state) => {
    const newItems = state.items.map(item =>
      item.id === id ? { ...item, unread: false } : item
    );
    const newUnreadCount = newItems.filter(item => item.unread).length;
    return { items: newItems, unreadCount: newUnreadCount };
  }),
  markAllAsRead: () => set((state) => ({
    items: state.items.map(item => ({ ...item, unread: false })),
    unreadCount: 0,
  })),
}));
