import type { Wallet } from '@/types/api'
import { cx } from '@/lib/cx'
import { Money } from '@/components/ui'
import styles from './WalletCard.module.css'

export function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <article className={cx(styles.card, styles[wallet.currency])}>
      <p className={styles.label}>{wallet.currency} wallet</p>
      <p className={styles.balance}>
        <Money amount={wallet.balance} currency={wallet.currency} />
      </p>
    </article>
  )
}
