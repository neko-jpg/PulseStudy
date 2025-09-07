import { NextResponse } from 'next/server'

export async function GET() { return NextResponse.json({ mins: 320, acc: 0.68, flow: 61 }) }

