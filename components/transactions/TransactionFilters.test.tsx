import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TransactionFilters } from './TransactionFilters'

const handlers = () => ({
  onSearch: vi.fn(),
  onType: vi.fn(),
  onStatus: vi.fn(),
  onClear: vi.fn(),
})

afterEach(() => vi.useRealTimers())

describe('TransactionFilters', () => {
  it('debounces search changes', () => {
    vi.useFakeTimers()
    const events = handlers()
    render(<TransactionFilters q="" active={false} {...events} />)
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'netflix' } })
    expect(events.onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(events.onSearch).toHaveBeenCalledWith('netflix')
  })

  it('maps type and status controls to API values', () => {
    const events = handlers()
    render(<TransactionFilters q="" active={false} {...events} />)
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'card_payment' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'successful' } })
    expect(events.onType).toHaveBeenCalledWith('card_payment')
    expect(events.onStatus).toHaveBeenCalledWith('successful')
  })

  it('shows clear filters only for active filters', () => {
    const events = handlers()
    const { rerender } = render(<TransactionFilters q="" active={false} {...events} />)
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
    rerender(<TransactionFilters q="netflix" active {...events} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(events.onClear).toHaveBeenCalledOnce()
  })

  it('displays Reversed as unavailable rather than sending an unsupported value', () => {
    render(<TransactionFilters q="" active={false} {...handlers()} />)
    expect(screen.getByRole('option', { name: 'Reversed (unavailable)' })).toBeDisabled()
  })
})
