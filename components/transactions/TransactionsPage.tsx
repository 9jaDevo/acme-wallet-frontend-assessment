'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { PageMeta, Transaction } from '@/types/api'
import { getTransaction, getTransactions } from '@/lib/api/endpoints'
import { groupTransactions, parseTransactionUrlState } from '@/lib/transactions'
import { TransactionRow } from './TransactionRow'
import { TransactionFilters } from './TransactionFilters'
import { TransactionPagination } from './TransactionPagination'
import { TransactionSkeleton, TransactionState } from './TransactionStates'
import { TransactionDetails } from './TransactionDetails'
import styles from './TransactionsPage.module.css'

const LIMIT = 20

export function TransactionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const state = parseTransactionUrlState(new URLSearchParams(searchParams.toString()))
  const [transactions, setTransactions] = useState<Transaction[]>()
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: LIMIT, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>()
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState<Transaction>()
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<unknown>()
  const openedHere = useRef(false)

  const navigate = useCallback(
    (changes: Record<string, string | number | undefined>, mode: 'push' | 'replace' = 'push') => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(changes).forEach(([key, value]) =>
        value === undefined || value === '' || (key === 'page' && value === 1)
          ? params.delete(key)
          : params.set(key, String(value))
      )
      const href = `${pathname}${params.size ? `?${params}` : ''}`
      router[mode](href, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setLoading(true)
        setError(undefined)
      }
    })
    getTransactions(
      {
        page: state.page,
        limit: LIMIT,
        q: state.q || undefined,
        type: state.type,
        status: state.status,
        __scenario: state.scenario,
      },
      { signal: controller.signal }
    )
      .then((response) => {
        setTransactions(response.data)
        const nextMeta = response.meta ?? {
          page: state.page,
          limit: LIMIT,
          total: response.data.length,
          totalPages: response.data.length ? 1 : 0,
        }
        setMeta(nextMeta)
        if (nextMeta.totalPages > 0 && state.page > nextMeta.totalPages) {
          const params = new URLSearchParams(window.location.search)
          params.set('page', String(nextMeta.totalPages))
          window.history.replaceState(null, '', `${pathname}?${params}`)
        }
      })
      .catch((cause) => {
        if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [pathname, retry, state.page, state.q, state.scenario, state.status, state.type])

  useEffect(() => {
    if (!state.transaction) {
      return
    }
    const controller = new AbortController()
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setDetailsLoading(true)
        setDetailsError(undefined)
      }
    })
    const fromList = transactions?.find((transaction) => transaction.id === state.transaction)
    if (fromList) {
      queueMicrotask(() => {
        if (!controller.signal.aborted) {
          setSelected(fromList)
          setDetailsLoading(false)
        }
      })
      return () => controller.abort()
    }
    getTransaction(state.transaction, { signal: controller.signal })
      .then((response) => setSelected(response.data))
      .catch((cause) => {
        if (!(cause instanceof DOMException && cause.name === 'AbortError')) setDetailsError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailsLoading(false)
      })
    return () => controller.abort()
  }, [state.transaction, transactions])

  const activeFilters = Boolean(state.q || state.type || state.status)
  const clearFilters = () => {
    navigate({ q: undefined, type: undefined, status: undefined, page: undefined })
  }
  const openDetails = (transaction: Transaction) => {
    openedHere.current = true
    setSelected(transaction)
    navigate({ transaction: transaction.id })
  }
  const closeDetails = () => {
    if (openedHere.current) {
      openedHere.current = false
      router.back()
    } else navigate({ transaction: undefined }, 'replace')
  }
  const groups = groupTransactions(transactions ?? [])

  return (
    <div className={styles.page}>
      <header>
        <h1>Transactions</h1>
        <p>
          {loading && !transactions
            ? 'Loading transactions…'
            : `${meta.total} ${meta.total === 1 ? 'transaction' : 'transactions'}`}
        </p>
      </header>
      <TransactionFilters
        key={state.q}
        q={state.q}
        type={state.type}
        status={state.status}
        active={activeFilters}
        onSearch={(q) => navigate({ q: q.trim() || undefined, page: undefined }, 'replace')}
        onType={(type) => navigate({ type, page: undefined })}
        onStatus={(status) => navigate({ status, page: undefined })}
        onClear={clearFilters}
      />

      <section
        className={`${styles.list} ${loading && transactions ? styles.refreshing : ''}`}
        aria-busy={loading}
      >
        {loading && !transactions && <TransactionSkeleton />}
        {!loading && Boolean(error) && (
          <TransactionState kind="error" onAction={() => setRetry((value) => value + 1)} />
        )}
        {!error && transactions?.length === 0 && (
          <TransactionState kind={activeFilters ? 'filtered' : 'empty'} onAction={clearFilters} />
        )}
        {!error &&
          groups.map((group) => (
            <div key={group.key} className={styles.group}>
              <h2>{group.label}</h2>
              {group.transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} onSelect={openDetails} />
              ))}
            </div>
          ))}
        {loading && transactions && <span className={styles.loadingBar} aria-label="Updating transactions" />}
      </section>
      {!error && (
        <TransactionPagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPage={(page) => navigate({ page })}
        />
      )}
      <TransactionDetails
        open={Boolean(state.transaction)}
        transaction={selected}
        loading={detailsLoading}
        error={detailsError}
        onClose={closeDetails}
      />
    </div>
  )
}
