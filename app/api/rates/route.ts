import { NextResponse } from 'next/server'
import { CURRENCIES, getRate, type Currency } from '@/lib/mock/db'
import { errorResponse, simulateNetwork } from '@/lib/mock/simulate'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const from = params.get('from') as Currency
  const to = params.get('to') as Currency

  if (!CURRENCIES.includes(from) || !CURRENCIES.includes(to)) {
    return errorResponse(400, 'INVALID_CURRENCY', `Supported currencies: ${CURRENCIES.join(', ')}`)
  }

  // Rate lookups are deliberately jittery (upstream FX provider), but only fail via __scenario=error.
  const failure = await simulateNetwork(req, { minMs: 200, maxMs: 2500, failureRate: 0 })
  if (failure) return failure

  return NextResponse.json({
    data: { from, to, rate: getRate(from, to), updatedAt: new Date().toISOString() },
  })
}
