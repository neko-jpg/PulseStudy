import { NextResponse } from 'next/server'

export async function POST() { return NextResponse.json({ id: 'a' + Math.random().toString(36).slice(2,6) }) }

