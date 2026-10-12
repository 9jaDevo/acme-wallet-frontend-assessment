import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TransactionSkeleton, TransactionState } from './TransactionStates'

describe('transaction states', () => {
  it('renders the initial skeleton', () => {
    render(<TransactionSkeleton />)
    expect(screen.getByLabelText('Loading transactions')).toBeInTheDocument()
  })

  it('renders empty transaction history', () => {
    render(<TransactionState kind="empty" onAction={vi.fn()} />)
    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })

  it('clears a filtered no-results state', () => {
    const onAction = vi.fn()
    render(<TransactionState kind="filtered" onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('offers retry for failures', () => {
    const onAction = vi.fn()
    render(<TransactionState kind="error" onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }))
    expect(onAction).toHaveBeenCalledOnce()
  })
})
