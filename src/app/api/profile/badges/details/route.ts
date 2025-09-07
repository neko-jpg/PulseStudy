import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id') || 'b1'
  const base = {
    b1: {
      id: 'b1',
      name: '朝活スター',
      desc: '朝7時までに学習を完了する',
      conditions: [
        '平日のいずれか1日、07:00までに学習完了',
        '学習時間 5分以上',
      ],
      progress: { value: 1, target: 1 },
    },
    b2: {
      id: 'b2',
      name: 'ストリーク王',
      desc: '7日連続で学習する',
      conditions: ['連続学習日数 7日達成'],
      progress: { value: 4, target: 7 },
    },
    b3: {
      id: 'b3',
      name: '集中マスター',
      desc: '没入度80%以上で学習を完了',
      conditions: ['没入度 80% 以上で 1回学習完了'],
      progress: { value: 1, target: 1 },
    },
  } as any
  return NextResponse.json(base[id] || base.b1, { headers: { 'Cache-Control': 'no-store' } })
}

