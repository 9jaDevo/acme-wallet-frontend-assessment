import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types/api'
import { groupTransactions, isCreditTransaction, parseTransactionUrlState } from './transactions'

const transaction = (id: string, createdAt: string): Transaction => ({
  id,
  createdAt,
  reference: id,
  type: 'deposit',
  status: 'successful',
  currency: 'NGN',
  amount: 100,
  fee: 0,
  narration: id,
  counterparty: null,
})

describe('transaction helpers', () => {
  it('uses transaction semantics for direction', () => {
    expect(isCreditTransaction('deposit')).toBe(true)
    expect(isCreditTransaction('transfer_in')).toBe(true)
    expect(isCreditTransaction('withdrawal')).toBe(false)
  })

  it('groups today, yesterday and older transactions', () => {
    const groups = groupTransactions(
      [
        transaction('today', '2026-10-12T12:00:00Z'),
        transaction('yesterday', '2026-10-11T12:00:00Z'),
        transaction('older', '2026-10-05T12:00:00Z'),
      ],
      new Date('2026-10-12T15:00:00Z')
    )
    expect(groups.map((group) => group.label)).toEqual(['TODAY', 'YESTERDAY', 'MON, 5 OCT 2026'])
  })

  it('validates URL state and preserves diagnostic scenarios', () => {
    const state = parseTransactionUrlState(
      new URLSearchParams('q=netflix&type=card_payment&status=reversed&page=nope&__scenario=slow')
    )
    expect(state).toMatchObject({
      q: 'netflix',
      type: 'card_payment',
      status: undefined,
      page: 1,
      scenario: 'slow',
    })
  })
})
