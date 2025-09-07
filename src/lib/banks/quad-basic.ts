import type { ModuleDoc } from '@/lib/types'

export const quadBasic: ModuleDoc = {
  id: 'quad-basic',
  title: '二次関数のグラフ',
  subject: '数学',
  explain: [
    '二次関数 y = ax² + bx + c のグラフは放物線。a>0で下に凸、a<0で上に凸。',
    '頂点のx座標は -b/(2a)。平方完成で頂点と軸を求められる。',
  ],
  items: [
    {
      q: 'y=2x²-4x+1 の頂点は？',
      choices: ['(1,-1)', '(2,1)', '(1,2)', '(-1,2)'],
      answer: 0,
      exp: 'x=-b/2a=4/4=1, y=2(1)²-4(1)+1=-1 → (1,-1)',
    },
    {
      q: 'y=-x²+6x-5 のグラフはどちらに凸？',
      choices: ['上に凸', '下に凸', 'どちらでもない', '直線になる'],
      answer: 0,
      exp: 'x²の係数a=-1<0 なので上に凸（開口部が下向き）',
    },
    {
      q: 'y=x² をx軸方向に2, y軸方向に3だけ平行移動した式は？',
      choices: ['y=(x-2)²+3', 'y=(x+2)²+3', 'y=(x-2)²-3', 'y=(x+3)²-2'],
      answer: 0,
      exp: '一般形 y=(x-p)²+q。p=2, q=3 → y=(x-2)²+3',
    },
  ],
}

