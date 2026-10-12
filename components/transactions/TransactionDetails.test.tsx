import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { TransactionDetails } from './TransactionDetails'

const transaction: Transaction = {
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  status: 'successful',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
}

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

describe('TransactionDetails', () => {
  it('renders complete details and integer-minor-unit totals', () => {
    render(<TransactionDetails open transaction={transaction} loading={false} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
    expect(screen.getByText('GH₵1,212.00')).toBeInTheDocument()
    expect(screen.getByText('Kwame Mensah')).toBeInTheDocument()
  })

  it('copies the complete transaction reference', async () => {
    render(<TransactionDetails open transaction={transaction} loading={false} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy transaction reference' }))
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ACM-48213377'))
    expect(screen.getByRole('status')).toHaveTextContent('Reference copied')
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(<TransactionDetails open transaction={transaction} loading={false} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders the direct-link loading state', () => {
    render(<TransactionDetails open loading onClose={vi.fn()} />)
    expect(screen.getByLabelText('Loading transaction details')).toBeInTheDocument()
  })

  it('renders a dedicated transaction-not-found state', () => {
    render(
      <TransactionDetails
        open
        loading={false}
        error={new ApiError(404, 'NOT_FOUND', 'Missing')}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('Transaction not found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to transactions' })).toBeInTheDocument()
  })
})
