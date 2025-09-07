import { NextResponse } from 'next/server';

const allChallenges = [
  // Daily
  { id: 'd1', type: 'daily', title: '今日の5分学習', description: '任意のモジュールを5分間学習しよう', reward: { type: 'points', value: 50 }, moduleId: 'any', progress: 80 },
  { id: 'd2', type: 'daily', title: '数学クイズ3問', description: '数学カテゴリの問題を3問正解しよう', reward: { type: 'points', value: 75 }, moduleId: 'math-general' },

  // Weekly
  { id: 'w1', type: 'weekly', title: 'ウィークリー数学マスター', description: '1週間で3つの数学モジュールを完了する', reward: { type: 'badge', value: 'Math_Whiz_W1' }, moduleId: 'math-mix', progress: 45 },
  { id: 'w2', type: 'weekly', title: '英語漬けウィーク', description: '毎日英語モジュールを学習しよう', reward: { type: 'points', value: 500 }, moduleId: 'eng-general', progress: 60 },

  // Special
  { id: 's1', type: 'special', title: '夏休みスペシャル', description: '夏休み期間中に10モジュールを完了！', reward: { type: 'badge', value: 'Summer_Champ_2025' }, moduleId: 'any' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'daily';

  await new Promise(resolve => setTimeout(resolve, 300));

  const items = allChallenges.filter(c => c.type === tab);

  return NextResponse.json({ items });
}
