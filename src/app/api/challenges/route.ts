import { NextResponse } from 'next/server'
import type { ChallengeItem, ChallengeKind } from '@/lib/types'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const tab = (url.searchParams.get('tab') ?? 'daily') as ChallengeKind
  await new Promise((r) => setTimeout(r, 250))

  const base: ChallengeItem[] = [
    { id:'d1', kind:'daily', title:'5分朝活', desc:'今朝の1モジュールを完了', goal:{type:'minutes', value:5}, progress:3, deadline:new Date(Date.now()+6*3600e3).toISOString(), reward:{badge:'朝活スター'}, moduleId:'quad-basic' },
    { id:'d2', kind:'daily', title:'3問連続正解', desc:'任意のモジュールで3問', goal:{type:'solve', value:3}, progress:0, deadline:new Date(Date.now()+12*3600e3).toISOString(), moduleId:'en-irregs' },
    { id:'w1', kind:'weekly', title:'今週の合計15分', desc:'合計15分の学習を達成', goal:{type:'minutes', value:15}, progress:10, deadline:new Date(Date.now()+5*24*3600e3).toISOString(), reward:{badge:'集中バッジ', xp:150}, moduleId:'quad-basic' },
    { id:'s1', kind:'special', title:'7日連続学習', desc:'連続学習ストリークを7日に', goal:{type:'streak', value:7}, progress:4, deadline:new Date(Date.now()+10*24*3600e3).toISOString(), reward:{badge:'ストリーク王'}, moduleId:'en-irregs' },
  ]

  return NextResponse.json({ items: base.filter(c => c.kind === tab) }, { headers: { 'Cache-Control': 'no-store' } })
}

