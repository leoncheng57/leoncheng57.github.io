import { useState, type ReactElement } from 'react'
import {
  formatMinutes,
  minutesUntil,
  type Arrival,
} from '../data/arrivals'
import type { ArrivalsStatus } from '../hooks/useArrivals'
import styles from '../sub-wait.module.css'
import RouteBullet from './RouteBullet'

const INITIAL_ROWS = 4

export default function ArrivalBoard({
  arrivals,
  status,
  onRetry,
}: {
  arrivals: Arrival[]
  status: ArrivalsStatus
  onRetry: () => void
}): ReactElement {
  const [expanded, setExpanded] = useState(false)

  if (status === 'loading' && arrivals.length === 0) {
    return <p className={styles.placeholderNote}>Loading arrivals…</p>
  }

  if (status === 'error' && arrivals.length === 0) {
    return (
      <p className={styles.placeholderNote} role="alert">
        Could not reach the MTA feed.{' '}
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          Try again
        </button>
      </p>
    )
  }

  if (arrivals.length === 0) {
    return (
      <p className={styles.placeholderNote}>
        No upcoming trains in this direction right now.
      </p>
    )
  }

  const now = Date.now() / 1000
  const visible = expanded ? arrivals : arrivals.slice(0, INITIAL_ROWS)

  return (
    <>
      <ul className={styles.arrivalList}>
        {visible.map((arrival) => (
          <li
            key={`${arrival.tripId}-${arrival.time}`}
            className={styles.arrivalRow}
          >
            <span className={styles.arrivalMinutes}>
              {formatMinutes(minutesUntil(arrival, now))}
            </span>
            <RouteBullet route={arrival.route} size="medium" />
            <span className={styles.arrivalDestination}>
              {arrival.destination ?? 'Unknown destination'}
            </span>
          </li>
        ))}
      </ul>
      {arrivals.length > INITIAL_ROWS ? (
        <button
          type="button"
          className={styles.showMoreButton}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded
            ? 'show fewer trains'
            : `show more trains (${arrivals.length - INITIAL_ROWS})`}
        </button>
      ) : null}
    </>
  )
}
