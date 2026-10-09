import { NextResponse } from 'next/server'
import { user } from '@/lib/mock/db'
import { simulateNetwork } from '@/lib/mock/simulate'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const failure = await simulateNetwork(req, { minMs: 150, maxMs: 600 })
  if (failure) return failure
  return NextResponse.json({ data: user })
}
