import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(req: Request){
  try{
    const body = await req.json().catch(()=>null)
    const DATA_DIR = path.join(process.cwd(), 'data')
    const FILE = path.join(DATA_DIR, 'pulse-events.log')
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.appendFile(FILE, JSON.stringify({ ...body, ts: Date.now() })+'\n', 'utf-8')
    return NextResponse.json({ ok:true })
  }catch{
    return NextResponse.json({ ok:false }, { status: 400 })
  }
}

