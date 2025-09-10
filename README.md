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

## Firestore Indexes

As the number of sessions grows, you will need to create composite indexes in Firestore to support the queries in the application, especially on the Analytics page.

When you run the application against a Firestore database with data, Firestore will log an error in your browser's developer console if an index is required. This error message contains a direct link to create the necessary index in the Firebase console. This is the easiest way to create the correct index.

For example, the analytics page queries by `status`, `startedAt`, and `durationSec`. This requires a composite index on the `items` subcollection.

**Example Index:**

*   **Collection ID:** `items` (as a subcollection of `sessions/{userID}`)
*   **Fields to index:**
    1.  `status` (Ascending)
    2.  `durationSec` (Descending)
    3.  `startedAt` (Descending)

Always refer to the error message link from Firestore to ensure the correct index is created for the query being executed.
