import { useEffect, useState } from 'react'
import { Input, Select } from '@/components/ui'
import type { TransactionStatus, TransactionType } from '@/types/api'
import styles from './TransactionsPage.module.css'

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'transfer_in', label: 'Transfer in' },
  { value: 'transfer_out', label: 'Transfer out' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'card_payment', label: 'Card payment' },
  { value: 'bill_payment', label: 'Bill payment' },
]
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'successful', label: 'Successful' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'reversed', label: 'Reversed (unavailable)', disabled: true },
]

export function TransactionFilters({
  q,
  type,
  status,
  active,
  onSearch,
  onType,
  onStatus,
  onClear,
}: {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  active: boolean
  onSearch: (value: string) => void
  onType: (value?: TransactionType) => void
  onStatus: (value?: TransactionStatus) => void
  onClear: () => void
}) {
  const [search, setSearch] = useState(q)
  useEffect(() => {
    if (search === q) return
    const timer = window.setTimeout(() => onSearch(search), 300)
    return () => window.clearTimeout(timer)
  }, [onSearch, q, search])

  return (
    <div className={styles.filters}>
      <Input
        label="Search"
        leadingIcon="search"
        placeholder="Search by reference, name or narration"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={type ?? ''}
        onChange={(event) => onType((event.target.value as TransactionType) || undefined)}
        fieldClassName={styles.typeFilter}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status ?? ''}
        onChange={(event) => onStatus((event.target.value as TransactionStatus) || undefined)}
        fieldClassName={styles.statusFilter}
      />
      {active && (
        <button type="button" className={styles.clear} onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  )
}
