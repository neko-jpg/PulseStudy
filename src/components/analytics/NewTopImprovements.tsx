import React from 'react';
import Link from 'next/link';

export default function NewTopImprovements() {
  return (
    <section className="card p-6">
      <h3 className="text-lg font-bold mb-4">伸びしろ Top3</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-bold text-white">quad-basic</h4>
            <p className="text-sm text-gray-400">AIが特定したあなたの最優先課題</p>
          </div>
          <Link href="/learn/quad-basic/summary">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">今すぐ始める</button>
          </Link>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-bold text-white">en-irregs</h4>
            <p className="text-sm text-gray-400">次に克服すべき英語の不規則動詞</p>
          </div>
          <Link href="/learn/en-irregs/summary">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">今すぐ始める</button>
          </Link>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-bold text-white">m202</h4>
            <p className="text-sm text-gray-400">このモジュールで理解を深めましょう</p>
          </div>
          <Link href="/learn/m202/summary">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">今すぐ始める</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
