import { NextResponse } from 'next/server'

export async function GET() { return NextResponse.json({ items: [ { id: 'a1', title: '二次関数 基礎', status: 'published', dueAt: new Date(Date.now()+3*24*3600e3).toISOString() }, { id: 'a2', title: '図形と計量', status: 'draft', dueAt: new Date(Date.now()+7*24*3600e3).toISOString() } ] }) }

