import { NextResponse } from 'next/server'
import { transactions, type Transaction } from '@/lib/mock/db'
import { errorResponse, getScenario, simulateNetwork } from '@/lib/mock/simulate'

export const dynamic = 'force-dynamic'

const MAX_LIMIT = 100

const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams

  const page = Number(params.get('page') ?? 1)
  const limit = Number(params.get('limit') ?? 20)
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return errorResponse(400, 'INVALID_PAGINATION', `page >= 1, 1 <= limit <= ${MAX_LIMIT}`)
  }

  const from = params.get('from') // YYYY-MM-DD, inclusive
  const to = params.get('to') // YYYY-MM-DD, inclusive
  if ((from && !isDate(from)) || (to && !isDate(to))) {
    return errorResponse(400, 'INVALID_DATE', 'from and to must be dates in YYYY-MM-DD format')
  }

  const failure = await simulateNetwork(req)
  if (failure) return failure

  const type = params.get('type')
  const status = params.get('status')
  const currency = params.get('currency')
  const q = params.get('q')?.trim().toLowerCase()

  let result: Transaction[] = getScenario(req) === 'empty' ? [] : transactions

  if (type) result = result.filter((t) => t.type === type)
  if (status) result = result.filter((t) => t.status === status)
  if (currency) result = result.filter((t) => t.currency === currency)
  if (from) result = result.filter((t) => t.createdAt >= `${from}T00:00:00.000Z`)
  if (to) result = result.filter((t) => t.createdAt <= `${to}T23:59:59.999Z`)
  if (q) {
    result = result.filter(
      (t) =>
        t.reference.toLowerCase().includes(q) ||
        t.narration.toLowerCase().includes(q) ||
        (t.counterparty ?? '').toLowerCase().includes(q)
    )
  }

  // Searches are slower than plain listing (upstream full-text index).
  if (q) await new Promise((r) => setTimeout(r, Math.max(0, 900 - q.length * 150)))

  const total = result.length
  const start = (page - 1) * limit

  return NextResponse.json({
    data: result.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}
