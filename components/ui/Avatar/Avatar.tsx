import { cx } from '@/lib/cx'
import styles from './Avatar.module.css'

export interface AvatarProps {
  src: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  if (!src) return <span className={cx(styles.avatar, styles[size], className)} />
  // eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary CDNs
  return <img src={src} alt={alt} className={cx(styles.avatar, styles[size], className)} />
}
