import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Card.module.css'

export interface CardProps {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md'
  as?: 'section' | 'div' | 'article'
  className?: string
  'aria-labelledby'?: string
}

export function Card({ children, padding = 'md', as: Tag = 'section', className, ...rest }: CardProps) {
  return (
    <Tag className={cx(styles.card, styles[padding], className)} {...rest}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, action, id }: { title: string; action?: ReactNode; id?: string }) {
  return (
    <div className={styles.header}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {action}
    </div>
  )
}
