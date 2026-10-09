import type { TransactionStatus } from '@/types/api'
import { cx } from '@/lib/cx'
import { TRANSACTION_STATUS_LABELS } from '@/lib/format'
import styles from './StatusDot.module.css'

export function StatusDot({ status }: { status: TransactionStatus }) {
  const label = TRANSACTION_STATUS_LABELS[status]
  return <span className={cx(styles.dot, styles[status])} role="img" aria-label={label} title={label} />
}
