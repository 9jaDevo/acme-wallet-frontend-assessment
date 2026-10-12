import { Button, Icon } from '@/components/ui'
import styles from './TransactionsPage.module.css'

export function TransactionSkeleton() {
  return (
    <div className={styles.skeleton} aria-label="Loading transactions" aria-live="polite">
      {Array.from({ length: 6 }, (_, index) => (
        <div className={styles.skeletonRow} key={index}>
          <span className={styles.skeletonAvatar} />
          <span className={styles.skeletonCopy}>
            <i />
            <i />
          </span>
          <span className={styles.skeletonEnd}>
            <i />
            <i />
          </span>
        </div>
      ))}
    </div>
  )
}

export function TransactionState({
  kind,
  onAction,
}: {
  kind: 'filtered' | 'empty' | 'error'
  onAction: () => void
}) {
  const config =
    kind === 'filtered'
      ? {
          icon: 'search' as const,
          title: 'No transactions match your filters',
          text: 'Try a different search term or remove some filters.',
          action: 'Clear filters',
        }
      : kind === 'empty'
        ? {
            icon: 'inbox' as const,
            title: 'No transactions yet',
            text: 'When you add money, send a transfer or pay with your card, it will show up here.',
            action: '',
          }
        : {
            icon: 'alert' as const,
            title: 'We couldn’t load your transactions',
            text: 'Check your connection and try again.',
            action: 'Try again',
          }
  return (
    <div className={styles.state} role={kind === 'error' ? 'alert' : 'status'}>
      <span className={`${styles.stateIcon} ${kind === 'error' ? styles.errorIcon : ''}`}>
        <Icon name={config.icon} size={24} />
      </span>
      <h2>{config.title}</h2>
      <p>{config.text}</p>
      {config.action && (
        <Button
          variant={kind === 'error' ? 'primary' : 'secondary'}
          size="sm"
          iconLeft={kind === 'error' ? 'refresh' : undefined}
          onClick={onAction}
        >
          {config.action}
        </Button>
      )}
    </div>
  )
}
