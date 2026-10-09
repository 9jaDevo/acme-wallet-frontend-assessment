import { NextResponse } from 'next/server'
import { transactions } from '@/lib/mock/db'
import { errorResponse, simulateNetwork } from '@/lib/mock/simulate'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const failure = await simulateNetwork(req, { minMs: 150, maxMs: 800 })
  if (failure) return failure

  const tx = transactions.find((t) => t.id === id)
  if (!tx) return errorResponse(404, 'NOT_FOUND', `Transaction ${id} not found`)

  return NextResponse.json({ data: tx })
}
