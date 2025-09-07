import { NextResponse } from 'next/server';

export async function GET() {
  // 本番環境では、ログイン中のユーザーに基づいてデータベースなどからデータを取得します。
  // このモックでは、静的なデータを返します。

  await new Promise(resolve => setTimeout(resolve, 500)); // 意図的な遅延をシミュレート

  const mockData = {
    // 「続きから」のデータ
    quickstart: {
      moduleId: 'demo-quad',
      moduleName: '二次関数の基礎',
      progress: 60, // 60%完了
    },
    // 「今日の3タスク」のデータ
    tasks: [
      {
        id: 'task-1',
        moduleId: 'lin-eq',
        title: '一次方程式をマスターしよう',
        subject: '数学',
        icon: 'brain-circuit',
      },
      {
        id: 'task-2',
        moduleId: 'tri-func',
        title: '三角関数の応用',
        subject: '数学',
        icon: 'atom',
      },
      {
        id: 'task-3',
        moduleId: 'eng-vocab-101',
        title: '基本英単語100',
        subject: '英語',
        icon: 'book-open',
      },
    ],
    // 未読通知の件数
    unread: 5,
  };

  return NextResponse.json(mockData);
}
