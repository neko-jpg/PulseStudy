import { NextResponse } from 'next/server';

// 正解のモックデータ。キーは questionId, 値は選択肢のラベルとします。
const correctAnswers: Record<string, any> = {
  'quad-1-check': '下に凸',
  'quad-1-practice-1': '(x-1)(x-3)',
  'quad-1-practice-2': '(1, 5)',
  'quad-1-practice-3': '上に凸',
};

// 不正解時の解説モックデータ
const explanations: Record<string, string> = {
  'quad-1-check': 'グラフがx軸と交わる点が、方程式の解に対応します。この場合は2点で交わっていますね。',
  'quad-1-practice-1': '因数分解の符号が逆かもしれません。もう一度展開して確認してみましょう。',
  'quad-1-practice-2': '頂点の座標を求めるには、平方完成が必要です。y = a(x-p)^2 + q の形を思い出してください。',
  'quad-1-practice-3': 'x²の係数が負の場合、グラフは上に凸（山なり）になります。',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, answer } = body;

    // ネットワークの遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 400));

    // 簡単なバリデーション
    if (questionId === undefined || answer === undefined) {
      return NextResponse.json({ error: '`questionId` and `answer` are required.' }, { status: 400 });
    }

    const isCorrect = correctAnswers[questionId] === answer;

    if (isCorrect) {
      return NextResponse.json({
        correct: true,
      });
    } else {
      return NextResponse.json({
        correct: false,
        explain: explanations[questionId] || '残念、不正解です。もう一度よく考えてみましょう。',
      });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
