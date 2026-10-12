import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Drawer, Icon, Money } from '@/components/ui'
import { ApiError } from '@/lib/api/client'
import { formatDateTime, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { isCreditTransaction } from '@/lib/transactions'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import styles from './TransactionDetails.module.css'

export function TransactionDetails({
  open,
  transaction,
  loading,
  error,
  onClose,
}: {
  open: boolean
  transaction?: Transaction
  loading: boolean
  error?: unknown
  onClose: () => void
}) {
  const [copyMessage, setCopyMessage] = useState('')
  const notFound = error instanceof ApiError && error.status === 404
  const copyReference = async () => {
    if (!transaction) return
    try {
      await navigator.clipboard.writeText(transaction.reference)
      setCopyMessage('Reference copied')
    } catch {
      setCopyMessage('Could not copy reference')
    }
  }

  return (
    <Drawer open={open} title="Transaction details" onClose={onClose}>
      {loading && <DetailsSkeleton />}
      {!loading && notFound && (
        <div className={styles.notFound}>
          <span>
            <Icon name="search" size={24} />
          </span>
          <h3>Transaction not found</h3>
          <p>It may have been removed, or the link is wrong.</p>
          <Button variant="secondary" onClick={onClose}>
            Back to transactions
          </Button>
        </div>
      )}
      {!loading && Boolean(error) && !notFound && (
        <div className={styles.notFound} role="alert">
          <span className={styles.danger}>
            <Icon name="alert" size={24} />
          </span>
          <h3>Couldn’t load transaction details</h3>
          <p>Check your connection, close this panel and try again.</p>
        </div>
      )}
      {!loading && transaction && (
        <>
          <div className={styles.summaryHero}>
            <span className={styles.avatar}>
              {transaction.counterparty
                ?.split(/\s+/)
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || <Icon name="wallet" size={20} />}
            </span>
            <p>{transaction.narration}</p>
            <Money
              amount={transaction.amount}
              currency={transaction.currency}
              sign={isCreditTransaction(transaction.type) ? 'credit' : 'debit'}
              className={styles.heroAmount}
            />
            <TransactionStatusBadge status={transaction.status} />
          </div>
          <section className={styles.section}>
            <h3>DETAILS</h3>
            <dl>
              <div>
                <dt>Reference</dt>
                <dd>
                  <code>{transaction.reference}</code>
                  <button type="button" onClick={copyReference} aria-label="Copy transaction reference">
                    <Icon name="copy" size={16} />
                  </button>
                </dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{formatDateTime(transaction.createdAt)}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{TRANSACTION_TYPE_LABELS[transaction.type]}</dd>
              </div>
              <div>
                <dt>Counterparty</dt>
                <dd>{transaction.counterparty ?? 'Not available'}</dd>
              </div>
              <div>
                <dt>Narration</dt>
                <dd>{transaction.narration}</dd>
              </div>
            </dl>
          </section>
          <section className={styles.section}>
            <h3>SUMMARY</h3>
            <dl>
              <div>
                <dt>Amount</dt>
                <dd>
                  <Money amount={transaction.amount} currency={transaction.currency} />
                </dd>
              </div>
              <div>
                <dt>Fee</dt>
                <dd>
                  <Money amount={transaction.fee} currency={transaction.currency} />
                </dd>
              </div>
              <div className={styles.total}>
                <dt>Total</dt>
                <dd>
                  <Money amount={transaction.amount + transaction.fee} currency={transaction.currency} />
                </dd>
              </div>
            </dl>
          </section>
          <p className="visually-hidden" role="status" aria-live="polite">
            {copyMessage}
          </p>
        </>
      )}
    </Drawer>
  )
}

function DetailsSkeleton() {
  return (
    <div className={styles.detailsSkeleton} aria-label="Loading transaction details">
      <span className={styles.skeletonCircle} />
      <i />
      <i className={styles.wide} />
      <i />
      <hr />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index}>
          <i />
          <i />
        </div>
      ))}
    </div>
  )
}
