import { NextResponse } from 'next/server'

// Mock data for Home screen
export async function GET() {
  // Simulate small delay to show skeletons (optional)
  await new Promise((r) => setTimeout(r, 400))

  const data = {
    quickstart: {
      id: 'last',
      moduleId: 'm101',
      subject: '数学',
      title: '二次関数のグラフをマスター',
      estMins: 5,
      questions: 3,
    },
    tasks: [
      {
        id: 'm201',
        moduleId: 'm201',
        subject: '英語',
        title: '不定詞の基礎を理解',
        estMins: 5,
        questions: 4,
      },
      {
        id: 'm202',
        moduleId: 'm202',
        subject: '理科',
        title: '光合成の仕組みを学ぶ',
        estMins: 7,
        questions: 5,
      },
      {
        id: 'm203',
        moduleId: 'm203',
        subject: '社会',
        title: '日本の地形と気候',
        estMins: 6,
        questions: 4,
      },
    ],
    unread: 5,
    streakDays: 7,
    pulse: 78,
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

