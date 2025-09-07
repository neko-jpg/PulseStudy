'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <div className="mb-3">読み込みに失敗しました。</div>
      <button className="underline" onClick={() => reset()}>再試行</button>
    </div>
  );
}

