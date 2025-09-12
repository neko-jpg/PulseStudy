export type ModuleMapping = {
  // UI-visible module id (e.g., cards, links)
  id: string
  // Internal/API id used by banks and generation
  apiId: string
  // Optional human-friendly title/subject
  title?: string
  subject?: string
}

// Single source of truth for module id mapping across UI, summary, and APIs.
export const MODULES: ModuleMapping[] = [
  { id: 'math-quad-1', apiId: 'quad-basic', title: '二次関数のグラフ', subject: '数学' },
  { id: 'eng-infinitive-1', apiId: 'en-irregs', title: '不定詞の基本', subject: '英語' },
  // Continuation/fallback
  { id: 'last', apiId: 'quad-basic' },
]

export function toApiId(id: string): string {
  return (MODULES.find(m => m.id === id)?.apiId) || id
}

