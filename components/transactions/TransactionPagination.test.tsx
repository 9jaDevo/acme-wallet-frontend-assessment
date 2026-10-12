import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TransactionPagination } from './TransactionPagination'

describe('TransactionPagination', () => {
  it('disables previous on the first page and requests the next page', () => {
    const onPage = vi.fn()
    render(<TransactionPagination page={1} totalPages={12} total={237} limit={20} onPage={onPage} />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    fireEvent.click(screen.getAllByRole('button', { name: /Next/ })[0])
    expect(onPage).toHaveBeenCalledWith(2)
    expect(screen.getByText('Showing 1–20 of 237')).toBeInTheDocument()
  })

  it('disables next on the last page and marks the current page', () => {
    render(<TransactionPagination page={12} totalPages={12} total={237} limit={20} onPage={vi.fn()} />)
    expect(screen.getAllByRole('button', { name: /Next/ })[0]).toBeDisabled()
    expect(screen.getByRole('button', { name: '12' })).toHaveAttribute('aria-current', 'page')
  })
})
