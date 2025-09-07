import { NextResponse } from 'next/server';
import { subDays, format } from 'date-fns';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Generate heatmap data for the last 30 days
  const heatmap = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      count: Math.floor(Math.random() * 5), // 0 to 4 activities
    };
  }).reverse();

  const mockData = {
    summary: {
      totalTime: 128, // minutes
      accuracy: 0.82, // 82%
      flowScore: 75,
      completedModules: 5,
    },
    heatmap: heatmap,
    top3: [
      {
        moduleId: 'tri-func',
        moduleName: '三角関数の応用',
        reason: '正答率が低い問題があります',
      },
      {
        moduleId: 'eng-passive',
        moduleName: '英語の受動態',
        reason: '最近学習していません',
      },
      {
        moduleId: 'history-edo',
        moduleName: '江戸時代の文化',
        reason: '新しいおすすめモジュールです',
      },
    ],
  };

  return NextResponse.json(mockData);
}
