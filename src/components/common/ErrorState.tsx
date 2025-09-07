export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-6 text-center text-sm">
      読み込みに失敗しました。<button className="underline ml-2" onClick={onRetry}>再試行</button>
    </div>
  )
}

