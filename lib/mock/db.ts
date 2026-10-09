/**
 * Mock backend for the take-home assignment. OUT OF SCOPE.
 *
 * Everything under `lib/mock` and `app/api` simulates the real backend. Treat it like a
 * third-party API whose contract is described in API.md. Don't import from here in app code.
 */

export type Currency = 'NGN' | 'USD' | 'GHS'

export type TransactionType =
  'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'conversion' | 'card_payment' | 'bill_payment'

export type TransactionStatus = 'successful' | 'pending' | 'failed'

export interface Transaction {
  id: string
  reference: string
  type: TransactionType
  status: TransactionStatus
  currency: Currency
  amount: number
  fee: number
  narration: string
  counterparty: string | null
  createdAt: string
}

export interface Wallet {
  currency: Currency
  balance: number
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  tier: 'basic' | 'verified' | 'premium'
  wallets: Wallet[]
}

// Deterministic PRNG so every candidate sees the same data.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261008)
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

const TYPES: readonly TransactionType[] = [
  'deposit',
  'withdrawal',
  'transfer_in',
  'transfer_out',
  'conversion',
  'card_payment',
  'bill_payment',
]

const COUNTERPARTIES = [
  'Ada Okafor',
  'Kwame Mensah',
  'Tunde Bakare',
  'Efua Asante',
  'Chidi Nwosu',
  'Zainab Bello',
  'Kofi Boateng',
  'Ngozi Eze',
]

const MERCHANTS = ['Netflix', 'Spotify', 'Amazon', 'Apple', 'Jumia', 'Uber', 'Bolt', 'Google Cloud']
const BILLERS = ['Ikeja Electric', 'DSTV', 'MTN Airtime', 'Spectranet', 'GOtv', 'Airtel Data']

export const CONVERSION_FEE_RATE = 0.015

const RANGES: Record<Currency, [number, number]> = {
  NGN: [500_00, 2_500_000_00],
  USD: [1_00, 2_000_00],
  GHS: [5_00, 15_000_00],
}

function narrationFor(type: TransactionType, counterparty: string | null, currency: Currency): string {
  switch (type) {
    case 'deposit':
      return 'Wallet top-up via bank transfer'
    case 'withdrawal':
      return `Withdrawal to ${pick(['GTBank', 'Access Bank', 'Zenith', 'Ecobank', 'MTN MoMo'])} ****${between(1000, 9999)}`
    case 'transfer_in':
      return `Transfer from ${counterparty}`
    case 'transfer_out':
      return `Transfer to ${counterparty}`
    case 'conversion':
      return `Converted ${currency === 'NGN' ? 'USD' : 'NGN'} to ${currency}`
    case 'card_payment':
      return `Card payment - ${pick(MERCHANTS)}`
    case 'bill_payment':
      return `Bill payment - ${pick(BILLERS)}`
  }
}

/** Fee in the transaction's own currency. Conversions charge 1.5%, the same as POST /api/convert. */
function feeFor(type: TransactionType, amount: number): number {
  if (type === 'conversion') return Math.round(amount * CONVERSION_FEE_RATE)
  if (type === 'withdrawal' || type === 'transfer_out') return Math.round(amount * 0.01)
  return 0
}

// Dates are relative to the start of today (UTC) so the data always looks fresh.
const DAY_MS = 24 * 60 * 60 * 1000
const BASE_DATE = Math.floor(Date.now() / DAY_MS) * DAY_MS

function generateTransactions(count: number): Transaction[] {
  const list: Transaction[] = []
  for (let i = 0; i < count; i++) {
    const type = pick(TYPES)
    const currency: Currency = rand() < 0.6 ? 'NGN' : rand() < 0.75 ? 'USD' : 'GHS'
    const [min, max] = RANGES[currency]
    const amount = between(min, max)
    const statusRoll = rand()
    const status: TransactionStatus =
      statusRoll < 0.82 ? 'successful' : statusRoll < 0.93 ? 'pending' : 'failed'
    const counterparty = type === 'transfer_in' || type === 'transfer_out' ? pick(COUNTERPARTIES) : null
    const createdAt = new Date(BASE_DATE - between(0, 120 * 24 * 60) * 60_000).toISOString()

    list.push({
      id: `txn_${(100000 + i).toString(36)}`,
      reference: `ACM-${between(10_000_000, 99_999_999)}`,
      type,
      status,
      currency,
      amount,
      fee: feeFor(type, amount),
      narration: narrationFor(type, counterparty, currency),
      counterparty,
      createdAt,
    })
  }

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // Everything above is dated before today, so move the two newest into today to give the list a "Today" group.
  const sinceMidnight = Date.now() - BASE_DATE
  list[0].createdAt = new Date(BASE_DATE + Math.floor(sinceMidnight * 0.8)).toISOString()
  list[1].createdAt = new Date(BASE_DATE + Math.floor(sinceMidnight * 0.3)).toISOString()

  // Real-world data the UI has to survive.

  // 1. One upstream provider sends unsanitised markup.
  Object.assign(list[2], {
    type: 'bill_payment',
    fee: 0,
    counterparty: null,
    narration: `Bill payment - Spectranet <img src="x" onerror="console.warn('narration rendered as HTML')">`,
  })

  // 2. A corporate payout with a very large amount.
  Object.assign(list[4], {
    type: 'transfer_in',
    status: 'successful',
    currency: 'NGN',
    amount: 2_499_999_999_99,
    fee: 0,
    counterparty: 'Okonkwo-Adeyemi Logistics & Haulage International Ltd',
    narration: 'Transfer from Okonkwo-Adeyemi Logistics & Haulage International Ltd',
  })

  // 3. A merchant descriptor that is far longer than anyone designed for.
  Object.assign(list[7], {
    type: 'card_payment',
    fee: 0,
    counterparty: null,
    narration:
      'Card payment - GOOGLE *CLOUD PLATFORM SUBSCRIPTION RENEWAL ANNUAL BILLING CYCLE REF 8841-2219-0034 DUBLIN IE',
  })

  return list
}

export const transactions: Transaction[] = generateTransactions(237)

export const user: User = {
  id: 'usr_7f3k2',
  firstName: 'Amara',
  lastName: 'Test',
  email: 'amara@example.com',
  avatarUrl: '/avatar.svg',
  tier: 'verified',
  wallets: [
    { currency: 'NGN', balance: 1_245_830_50 },
    { currency: 'USD', balance: 2_340_75 },
    { currency: 'GHS', balance: 85_020 },
  ],
}

/** Value of 1 unit of each currency in NGN */
const RATES_TO_NGN: Record<Currency, number> = {
  NGN: 1,
  USD: 1530.25,
  GHS: 98.4,
}

/** Six significant figures, so small rates like NGN -> USD keep their precision. */
export function getRate(from: Currency, to: Currency): number {
  return Number((RATES_TO_NGN[from] / RATES_TO_NGN[to]).toPrecision(6))
}

export const CURRENCIES: Currency[] = ['NGN', 'USD', 'GHS']

let conversionCount = 0

/**
 * Applies a conversion to the in-memory wallets and records it in the history. `fee` is in the source
 * currency; the history row is in the target currency, so its fee is converted at the same rate.
 */
export function applyConversion(
  from: Currency,
  to: Currency,
  amount: number,
  fee: number,
  rate: number,
  received: number
): Transaction {
  const source = user.wallets.find((w) => w.currency === from)!
  const target = user.wallets.find((w) => w.currency === to)!
  source.balance -= amount + fee
  target.balance += received

  conversionCount += 1
  const tx: Transaction = {
    id: `txn_cnv${conversionCount}`,
    reference: `ACM-CNV${String(conversionCount).padStart(5, '0')}`,
    type: 'conversion',
    status: 'successful',
    currency: to,
    amount: received,
    fee: Math.round(fee * rate),
    narration: `Converted ${from} to ${to}`,
    counterparty: null,
    createdAt: new Date().toISOString(),
  }
  transactions.unshift(tx)
  return tx
}
