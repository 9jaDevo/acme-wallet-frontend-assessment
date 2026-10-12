import type { TransactionStatus } from '@/types/api'
import { Badge } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge/Badge'
import { TRANSACTION_STATUS_LABELS } from '@/lib/format'

const TONES: Record<TransactionStatus, BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}

export function TransactionStatusBadge({
  status,
  className,
}: {
  status: TransactionStatus
  className?: string
}) {
  return (
    <Badge tone={TONES[status]} dot className={className}>
      {TRANSACTION_STATUS_LABELS[status]}
    </Badge>
  )
}
