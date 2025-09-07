export type NotifItem = {
  id: string
  type: 'learning' | 'social' | 'system'
  moduleId?: string
  title: string
  text: string
  unread: boolean
  ts: number
}

declare global {
  // eslint-disable-next-line no-var
  var __notifState: NotifItem[] | undefined
}

function seed(): NotifItem[] {
  return [
    {
      id: 'n1',
      type: 'learning',
      moduleId: 'm101',
      title: '学習リマインダー',
      text: '続きのモジュールを再開しましょう。',
      unread: true,
      ts: Date.now() - 10 * 60 * 1000,
    },
    {
      id: 'n2',
      type: 'social',
      title: '友人アクティビティ',
      text: '健太さんが新しいチャレンジを開始',
      unread: true,
      ts: Date.now() - 60 * 60 * 1000,
    },
    {
      id: 'n3',
      type: 'system',
      title: 'システム更新',
      text: '新バージョンが利用可能です。',
      unread: false,
      ts: Date.now() - 24 * 60 * 60 * 1000,
    },
  ]
}

function ensure() {
  if (!globalThis.__notifState) globalThis.__notifState = seed()
  return globalThis.__notifState!
}

export function getItems(): NotifItem[] {
  return ensure().map((i) => ({ ...i }))
}

export function setRead(id: string, unread: boolean) {
  const items = ensure()
  const idx = items.findIndex((i) => i.id === id)
  if (idx >= 0) items[idx] = { ...items[idx], unread }
}

export function setAllRead() {
  const items = ensure()
  for (let i = 0; i < items.length; i++) items[i] = { ...items[i], unread: false }
}

export function getUnreadCount(): number {
  return ensure().reduce((acc, i) => acc + (i.unread ? 1 : 0), 0)
}

