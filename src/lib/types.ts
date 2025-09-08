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
  // Whiteboard (collaborative drawing)
  board?: BoardState
  boardLastClientId?: string
  live?: LiveBoard
  // Ops
  boardLocked?: boolean
  takeaways?: { ts: number; text: string; authorId?: string }[]
}

// Whiteboard types
export type BoardPoint = { x: number; y: number }
export type BoardStroke = { color: string; size: number; points: BoardPoint[] }
export type BoardShape = { t: 'line'|'rect'; x:number; y:number; w:number; h:number; color:string; size:number }
export type BoardText = { x:number; y:number; text:string; color:string; size:number; weight:'normal'|'bold' }
export type BoardNote = { x:number; y:number; w:number; h:number; color:string; text:string }

export type BoardState = {
  strokes: BoardStroke[]
  shapes: BoardShape[]
  texts: BoardText[]
  notes: BoardNote[]
  rev: number // monotonically increasing revision
}

// Live stroke (in-progress) streaming
export type LiveStroke = {
  id: string
  clientId: string
  color: string
  size: number
  points: BoardPoint[]
  updatedAt: number
}

export type LiveBoard = {
  strokes: Record<string, LiveStroke>
  cursors?: Record<string, { x:number; y:number; color:string; updatedAt:number }>
}
