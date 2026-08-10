import type { ReactElement } from 'react'
import { routeBulletLabel, routeBulletStyle } from '../data/routeColors'
import styles from '../sub-wait.module.css'

export default function RouteBullet({
  route,
  size = 'medium',
}: {
  route: string
  size?: 'small' | 'medium' | 'large'
}): ReactElement {
  const { background, text } = routeBulletStyle(route)
  const label = routeBulletLabel(route)
  return (
    <span
      className={styles.routeBullet}
      data-size={size}
      data-long={label.length > 1 ? 'true' : undefined}
      style={{ background, color: text }}
      aria-label={`${label} train`}
    >
      {label}
    </span>
  )
}
