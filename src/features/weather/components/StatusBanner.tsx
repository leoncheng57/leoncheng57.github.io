import type { ReactElement } from 'react'
import { useWeatherContext } from '../hooks/WeatherContext'
import { formatUpdatedTime } from '../utils/format'
import styles from '../weather.module.css'

/**
 * Cross-page fetch status: silent when fresh data is loading or loaded,
 * a stale-data notice when offline with a cached payload, and a retry
 * prompt when there is nothing to show at all.
 */
export default function StatusBanner(): ReactElement | null {
  const { status, data, refresh } = useWeatherContext()

  if (status === 'error' && data) {
    return (
      <div className={styles.staleBanner} role="status">
        <span>
          ⚡ Offline — showing data from {formatUpdatedTime(data.fetchedAt)}
        </span>
        <button type="button" onClick={refresh}>
          Retry
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.errorPanel} role="alert">
        <p>Could not load weather data.</p>
        <button type="button" onClick={refresh}>
          Try again
        </button>
      </div>
    )
  }

  return null
}
