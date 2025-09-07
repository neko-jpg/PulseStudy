"use client"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="p-4 text-center">
      <div className="mb-2">読み込みに失敗しました。</div>
      <button className="underline" onClick={() => reset()}>再試行</button>
    </div>
  )
}

