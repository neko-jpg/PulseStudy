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
      q: '以下のグラフで表される二次関数の式として正しいものを選択肢から選びなさい。',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIzMtk-gwQkqtKiMhVPnCGeVS8u6I4h5cYLv_zptALw6pSQzbLIdfs1KQaQYY4n5n-6adkko_5SJKVoP4blmJiHYFpEcSyaAH7B9WOLy0dpKAaQKICE93DVq5s1eZLvyOsIx4pHYi82stYgouvqkLA-FgUfuJsPFv8DpMTmWxhj6WOj1yyWYy1bgWc9gfCGlxvx-Fo2hHRjkfaLI24bvpOgAtM6EyTIvhjTpSSH6Zlwc3IxO_kaRfQieIkwcrfJSZnBrPdgTGADlo',
      imageAlt: 'graph of a parabola',
      choices: ['y = x^2 - 2x + 1', 'y = -x^2 + 4', 'y = 2x^2', 'y = x^2 + 2x - 3'],
      answer: 3,
      exp: 'グラフは頂点が(-1, -4)で、(1, 0)を通る下に凸の放物線です。y = x^2 + 2x - 3 はこれらの条件を満たします。',
    },
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

