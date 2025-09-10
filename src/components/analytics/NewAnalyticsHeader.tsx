import React from 'react';
import { Share, Bell } from 'lucide-react';

export default function NewAnalyticsHeader() {
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">分析</h2>
        <p className="text-gray-400">こんにちは、徹平さん。あなたの学習状況の概要です。</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <Share className="mr-2 h-5 w-5" />
          結果を共有
        </button>
        <button className="relative">
          <Bell className="text-gray-400 h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
        </button>
      </div>
    </header>
  );
}
