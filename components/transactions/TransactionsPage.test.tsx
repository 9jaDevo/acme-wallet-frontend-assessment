import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@/types/api'
import { getTransaction, getTransactions } from '@/lib/api/endpoints'
import { TransactionsPage } from './TransactionsPage'

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/transactions',
  useRouter: () => ({ push: navigation.push, replace: navigation.replace, back: navigation.back }),
  useSearchParams: () => navigation.params,
}))

vi.mock('@/lib/api/endpoints', () => ({ getTransactions: vi.fn(), getTransaction: vi.fn() }))

const transaction: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 1549,
  fee: 0,
  narration: 'Card payment - Netflix',
  counterparty: null,
  createdAt: '2026-10-12T14:22:00.000Z',
}

const response = (data: Transaction[] = [transaction]) => ({
  data,
  meta: { page: 1, limit: 20, total: data.length, totalPages: data.length ? 1 : 0 },
})

beforeEach(() => {
  navigation.params = new URLSearchParams()
  navigation.push.mockReset()
  navigation.replace.mockReset()
  navigation.back.mockReset()
  vi.mocked(getTransactions).mockReset().mockResolvedValue(response())
  vi.mocked(getTransaction).mockReset()
})

describe('TransactionsPage', () => {
  it('shows initial loading and then API results', async () => {
    let resolveRequest!: (value: ReturnType<typeof response>) => void
    vi.mocked(getTransactions).mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )
    render(<TransactionsPage />)
    expect(await screen.findByLabelText('Loading transactions')).toBeInTheDocument()
    resolveRequest(response())
    expect(await screen.findByText('Card payment - Netflix')).toBeInTheDocument()
  })

  it('restores valid filters and pagination from the URL', async () => {
    navigation.params = new URLSearchParams(
      'q=netflix&type=card_payment&status=successful&page=2&__scenario=slow'
    )
    vi.mocked(getTransactions).mockResolvedValue({
      data: [transaction],
      meta: { page: 2, limit: 20, total: 21, totalPages: 2 },
    })
    render(<TransactionsPage />)
    await waitFor(() => expect(getTransactions).toHaveBeenCalled())
    expect(vi.mocked(getTransactions).mock.calls[0][0]).toMatchObject({
      q: 'netflix',
      type: 'card_payment',
      status: 'successful',
      page: 2,
      __scenario: 'slow',
    })
    expect(screen.getByLabelText('Search')).toHaveValue('netflix')
  })

  it('resets pagination when a filter changes', async () => {
    navigation.params = new URLSearchParams('page=2')
    render(<TransactionsPage />)
    await screen.findByText('Card payment - Netflix')
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'card_payment' } })
    expect(navigation.push).toHaveBeenCalledWith('/transactions?type=card_payment', { scroll: false })
  })

  it('clears application filters while preserving diagnostic parameters', async () => {
    navigation.params = new URLSearchParams(
      'q=netflix&type=card_payment&status=successful&page=2&__scenario=slow'
    )
    render(<TransactionsPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Clear filters' }))
    expect(navigation.push).toHaveBeenCalledWith('/transactions?__scenario=slow', { scroll: false })
  })

  it('opens transaction details through URL state', async () => {
    render(<TransactionsPage />)
    const narration = await screen.findByText('Card payment - Netflix')
    fireEvent.click(narration.closest('button')!)
    expect(navigation.push).toHaveBeenCalledWith('/transactions?transaction=txn_1', { scroll: false })
  })

  it('renders filtered no-results and clears it', async () => {
    navigation.params = new URLSearchParams('q=missing')
    vi.mocked(getTransactions).mockResolvedValue(response([]))
    render(<TransactionsPage />)
    expect(await screen.findByText('No transactions match your filters')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Clear filters' })[1])
    expect(navigation.push).toHaveBeenCalledWith('/transactions', { scroll: false })
  })

  it('renders empty history separately from filtered no-results', async () => {
    vi.mocked(getTransactions).mockResolvedValue(response([]))
    render(<TransactionsPage />)
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
  })

  it('retries after an API failure', async () => {
    vi.mocked(getTransactions).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(response())
    render(<TransactionsPage />)
    fireEvent.click(await screen.findByRole('button', { name: /Try again/ }))
    expect(await screen.findByText('Card payment - Netflix')).toBeInTheDocument()
    expect(getTransactions).toHaveBeenCalledTimes(2)
  })

  it('aborts an older request when URL state changes', async () => {
    vi.mocked(getTransactions).mockReturnValue(new Promise(() => {}))
    const { rerender } = render(<TransactionsPage />)
    await waitFor(() => expect(getTransactions).toHaveBeenCalledOnce())
    const firstSignal = vi.mocked(getTransactions).mock.calls[0][1]?.signal
    navigation.params = new URLSearchParams('page=2')
    rerender(<TransactionsPage />)
    await waitFor(() => expect(getTransactions).toHaveBeenCalledTimes(2))
    expect(firstSignal?.aborted).toBe(true)
  })
})
