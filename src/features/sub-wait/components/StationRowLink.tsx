import type { ReactElement, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Station } from '../types'
import styles from '../sub-wait.module.css'
import RouteBullet from './RouteBullet'

export default function StationRowLink({
  station,
  detail,
}: {
  station: Station
  detail?: ReactNode
}): ReactElement {
  return (
    <Link
      className={styles.stationRowLink}
      to={`/sub-wait/station/${station.id}`}
    >
      <span className={styles.stationRowText}>
        <span className={styles.stationRowName}>{station.name}</span>
        {detail ? <span className={styles.stationRowDetail}>{detail}</span> : null}
      </span>
      <span className={styles.bulletRow}>
        {station.routes.map((route) => (
          <RouteBullet key={route} route={route} size="small" />
        ))}
      </span>
    </Link>
  )
}
