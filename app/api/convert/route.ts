import { NextResponse } from 'next/server'
import { applyConversion, CONVERSION_FEE_RATE, CURRENCIES, getRate, user, type Currency } from '@/lib/mock/db'
import { errorResponse, simulateNetwork } from '@/lib/mock/simulate'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: { from?: Currency; to?: Currency; amount?: number } | null
  try {
    body = await req.json()
  } catch {
    body = null
  }
  if (typeof body !== 'object' || body === null) {
    return errorResponse(400, 'INVALID_BODY', 'Body must be a JSON object')
  }

  const { from, to, amount } = body
  if (!from || !to || !CURRENCIES.includes(from) || !CURRENCIES.includes(to) || from === to) {
    return errorResponse(400, 'INVALID_CURRENCY', 'from and to must be different supported currencies')
  }
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    return errorResponse(400, 'INVALID_AMOUNT', 'amount must be a positive integer in minor units')
  }

  const rate = getRate(from, to)
  const received = Math.floor(amount * rate)
  if (received < 1) {
    return errorResponse(400, 'INVALID_AMOUNT', `amount is too small to convert to ${to}`)
  }

  const failure = await simulateNetwork(req)
  if (failure) return failure

  const wallet = user.wallets.find((w) => w.currency === from)
  const fee = Math.round(amount * CONVERSION_FEE_RATE)
  if (!wallet || wallet.balance < amount + fee) {
    return errorResponse(422, 'INSUFFICIENT_FUNDS', 'Insufficient balance for this conversion')
  }

  const tx = applyConversion(from, to, amount, fee, rate, received)

  return NextResponse.json({
    data: {
      id: tx.id,
      from,
      to,
      amount,
      fee,
      rate,
      received,
      status: 'successful',
    },
  })
}
