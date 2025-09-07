import { NextResponse } from 'next/server';
import { subHours, subMinutes, subDays } from 'date-fns';

const allNotifications = [
    { id: 'n1', type: 'learning', moduleId: 'lin-eq', message: '「一次方程式」の新しい演習問題が追加されました。', unread: true, createdAt: subMinutes(new Date(), 5).toISOString() },
    { id: 'n2', type: 'social', message: '健太さんがあなたの解答に「いいね！」しました。', unread: true, createdAt: subMinutes(new Date(), 30).toISOString() },
    { id: 'n3', type: 'system', message: '新しいアバターが利用可能になりました。', unread: true, createdAt: subHours(new Date(), 2).toISOString() },
    { id: 'n4', type: 'challenge', challengeId: 'weekly-5', message: 'ウィークリーチャレンジ「数学マスター」が開始！', unread: false, createdAt: subHours(new Date(), 8).toISOString() },
    { id: 'n5', type: 'learning', moduleId: 'tri-func', message: '「三角関数」の解説をもう一度見てみませんか？', unread: false, createdAt: subDays(new Date(), 1).toISOString() },
    { id: 'n6', type: 'social', message: 'さくらさんがあなたを学習仲間に招待しています。', unread: true, createdAt: subDays(new Date(), 2).toISOString() },
    { id: 'n7', type: 'system', message: 'v1.1へのアップデートが完了しました。', unread: false, createdAt: subDays(new Date(), 3).toISOString() },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'all';

    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay

    let items = allNotifications;

    if (tab === 'unread') {
        items = allNotifications.filter(n => n.unread);
    } else if (['learning', 'social', 'system', 'challenge'].includes(tab)) {
        items = allNotifications.filter(n => n.type === tab);
    }

    const unreadCount = allNotifications.filter(n => n.unread).length;

    return NextResponse.json({ items, unread: unreadCount });
}
