import { Suspense } from 'react'
import { TransactionsPage } from '@/components/transactions/TransactionsPage'
import { TransactionSkeleton } from '@/components/transactions/TransactionStates'

export const metadata = { title: 'Transactions' }

export default function TransactionsRoute() {
  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <TransactionsPage />
    </Suspense>
  )
}
