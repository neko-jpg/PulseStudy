"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const improvementDescriptions: Record<string, string> = {
  'quad-basic': 'AIが特定したあなたの最優先課題',
  'en-irregs': '次に克服すべき英語の不規則動詞',
  'm202': 'このモジュールで理解を深めましょう',
};

export function TopImprovements({ items, onClick }: { items: string[]; onClick: (id: string) => void }) {
  if (!items?.length) return null;

  return (
    <section className="card p-6">
      <h3 className="text-lg font-bold mb-4">伸びしろ Top3</h3>
      <div className="space-y-4">
        {items.map((id) => (
          <div key={id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-bold text-white">{id}</h4>
              <p className="text-sm text-gray-400">
                {improvementDescriptions[id] || 'このモジュールで学習を始めましょう'}
              </p>
            </div>
            <Link href={`/learn?module=${id}&source=analytics`} onClick={() => onClick(id)}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">
                今すぐ始める
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
