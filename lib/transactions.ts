import type { Transaction, TransactionStatus, TransactionType } from '@/types/api'

export const CREDIT_TYPES: readonly TransactionType[] = ['deposit', 'transfer_in', 'conversion']
export const TRANSACTION_TYPES: readonly TransactionType[] = [
  'deposit',
  'withdrawal',
  'transfer_in',
  'transfer_out',
  'conversion',
  'card_payment',
  'bill_payment',
]
export const TRANSACTION_STATUSES: readonly TransactionStatus[] = ['successful', 'pending', 'failed']

export const isCreditTransaction = (type: TransactionType) => CREDIT_TYPES.includes(type)

export interface TransactionGroup {
  key: string
  label: string
  transactions: Transaction[]
}

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

export function groupTransactions(transactions: Transaction[], now = new Date()): TransactionGroup[] {
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const groups = new Map<string, TransactionGroup>()

  for (const transaction of transactions) {
    const date = new Date(transaction.createdAt)
    const key = dayKey(date)
    let label: string
    if (key === dayKey(now)) label = 'TODAY'
    else if (key === dayKey(yesterday)) label = 'YESTERDAY'
    else {
      label = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
        .format(date)
        .toUpperCase()
    }
    const existing = groups.get(key)
    if (existing) existing.transactions.push(transaction)
    else groups.set(key, { key, label, transactions: [transaction] })
  }
  return [...groups.values()]
}

export interface TransactionUrlState {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  page: number
  transaction?: string
  scenario?: 'slow' | 'error' | 'empty'
}

export function parseTransactionUrlState(params: URLSearchParams): TransactionUrlState {
  const type = params.get('type')
  const status = params.get('status')
  const rawPage = Number(params.get('page') ?? 1)
  const scenario = params.get('__scenario')
  return {
    q: params.get('q')?.trim() ?? '',
    type: TRANSACTION_TYPES.includes(type as TransactionType) ? (type as TransactionType) : undefined,
    status: TRANSACTION_STATUSES.includes(status as TransactionStatus)
      ? (status as TransactionStatus)
      : undefined,
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    transaction: params.get('transaction') || undefined,
    scenario: ['slow', 'error', 'empty'].includes(scenario ?? '')
      ? (scenario as TransactionUrlState['scenario'])
      : undefined,
  }
}
