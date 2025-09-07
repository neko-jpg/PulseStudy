import type { ModuleDoc } from '@/lib/types'

export const enIrregs: ModuleDoc = {
  id: 'en-irregs',
  title: '英語・不規則動詞（基礎）',
  subject: '英語',
  explain: [
    '不規則動詞は過去形・過去分詞が規則変化しない動詞群。',
    '代表例: go-went-gone, see-saw-seen, have-had-had など。',
  ],
  items: [
    {
      q: '「go」の過去形は？',
      choices: ['goed', 'went', 'gone', 'go'],
      answer: 1,
      exp: 'go-went-gone',
    },
    {
      q: '「see」の過去分詞は？',
      choices: ['saw', 'seen', 'seed', 'see'],
      answer: 1,
      exp: 'see-saw-seen',
    },
  ],
}

