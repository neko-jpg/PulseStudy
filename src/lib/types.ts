export type Step = 'explain' | 'quiz' | 'result'

export type QuizItem = {
  q: string
  choices: string[]
  answer: number // index
  exp: string
}

export type ModuleDoc = {
  id: string
  title: string
  subject?: string
  explain: string[]
  items: QuizItem[]
}

export type LearnState = {
  moduleId: string
  step: Step
  idx: number // 0-based
  selected?: number
  submitting: boolean
  showExplain: boolean
  correct: number
  total: number
}

// Challenge types
export type ChallengeKind = 'daily' | 'weekly' | 'special'
export type GoalType = 'solve' | 'minutes' | 'streak'

export type ChallengeItem = {
  id: string
  kind: ChallengeKind
  title: string
  desc: string
  goal: { type: GoalType; value: number }
  progress: number
  deadline: string
  reward?: { badge: string; xp?: number }
  moduleId: string
  joined?: boolean
}
export type ChallengeList = { items: ChallengeItem[] }
export type ChallengeProgress = { rank: number; you: number; friends: { name: string; value: number }[] }

// Collab types
export type StampType = 'like' | 'ask' | 'idea'

export type RoomMember = { id: string; name: string }

export type RoomQuiz = {
  idx: number
  q: string
  choices: string[]
  answer?: number
  result?: { correct: boolean }
}

export type RoomSession = {
  id: string
  topic?: string
  members: RoomMember[]
  stamps: { like: number; ask: number; idea: number }
  quiz?: RoomQuiz
  // Extensions for collab control and privacy
  solverId?: string
  hostId?: string
  privacy?: 'open' | 'approval'
  pendingControlRequests?: string[] // userIds
  pendingJoins?: RoomMember[]
  inviteTokens?: { token: string; exp: number }[]
  lastStampAt?: Record<string, number>
}
