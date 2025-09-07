# PulseStudy

Next.js (App Router) + Tailwind + shadcn/ui の学習アプリ MVP。

主要ルート: `/home`, `/learn`, `/learn-top`, `/challenge`, `/analytics`, `/collab`, `/profile`, `/teacher-dashboard`。

開発:

- 起動: `npm install && npm run dev`
- ビルド: `npm run build`
- 型チェック: `npm run typecheck`（CI で有効化推奨）

メモ:

- レイアウトは Server Component 化。クライアント処理は `src/components/ClientShell.tsx` に集約。
- API は `src/app/api/*` にモック実装あり。`fetch(...,{ cache:'no-store' })` を基本に利用。
- グローバルのサイドバー状態は Zustand（`src/hooks/use-sidebar.ts`）。
