export interface SummaryData {
  title: string;
  subject: string;
  progress: string;
  points: string[];
  imageUrl: string;
  imageAlt: string;
}

export const summaryData: Record<string, SummaryData> = {
  'math-quad-1': {
    title: '二次関数のグラフ',
    subject: '数学',
    progress: '1/3',
    points: [
      '二次関数 y = ax^2 + bx + c のグラフは放物線になる。',
      '係数 a はグラフの開き具合と向きを決める (a > 0 で下に凸, a < 0 で上に凸)。',
      '頂点の座標は (-b/2a, - (b^2 - 4ac)/4a) で求められる。',
      '軸の方程式は x = -b/2a である。',
      'y切片は (0, c) となる。',
    ],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm7o5LykUIr0uHeY-VUg3cYt-DMmX_TvnfjQWkjZT3Bu-IQb6cX15O_FIB6OyiKl1JKKWg94q71M24WTR8Gx10UDt2P67kwfKqakQrMBlbmpC38vLJAmExCvZZbmgYGNPJFrAlMU3H1v1SuIzBJbV0AccGXHpbCz_0vRjvubVg51gH_Q49GX1O8Aptc5fJVGVnpPEcsPOyT47XsKICSjUwQdX4mmYH82qXzBT09pmZuFPp-0oikVQsZl7OW5_XaFQist7ma4QvhD4',
    imageAlt: 'Graph of a quadratic function',
  },
  'eng-infinitive-1': {
    title: '不定詞の基本',
    subject: '英語',
    progress: '1/4',
    points: [
      '不定詞は「to + 動詞の原形」の形をとる。',
      '名詞的用法：「〜すること」と訳し、主語や目的語になる。',
      '形容詞的用法：「〜するための」「〜すべき」と訳し、名詞を修飾する。',
      '副詞的用法：「〜するために」「〜して」と訳し、動詞、形容詞、副詞を修飾する。',
      'It is ... for A to do B の構文を覚えよう。',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1516410529446-21e7e7811944?q=80&w=2070&auto=format&fit=crop',
    imageAlt: 'A person writing English notes',
  },
};
