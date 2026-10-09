import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  /** Show a leading dot. */
  dot?: boolean
  className?: string
}

export function Badge({ children, tone = 'neutral', dot = false, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)}>
      {dot && <span className={styles.dot} aria-hidden />}
      {children}
    </span>
  )
}
