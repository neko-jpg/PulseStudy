"use client";

import { Button } from '@/components/ui/button';

export function AnalyticsHeader() {
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">分析</h2>
        <p className="text-gray-400">こんにちは、徹平さん。あなたの学習状況の概要です。</p>
      </div>
      <div className="flex items-center space-x-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <span className="material-icons mr-2">share</span>
          結果を共有
        </Button>
        <button className="relative">
          <span className="material-icons text-gray-400">notifications</span>
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
        </button>
      </div>
    </header>
  );
}
