import { useState, type ReactElement } from 'react'
import useAlerts from '../hooks/useAlerts'
import type { WeatherAlert } from '../types'
import { formatUpdatedTime } from '../utils/format'
import styles from '../weather.module.css'

const SEVERITY_ICON: Record<WeatherAlert['severity'], string> = {
  Extreme: '🔴',
  Severe: '🔴',
  Moderate: '🟡',
  Minor: '🟢',
  Unknown: '⚪',
}

function AlertCard({ alert }: { alert: WeatherAlert }): ReactElement {
  const [expanded, setExpanded] = useState(false)
  return (
    <article className={styles.alertCard}>
      <p className={styles.alertEvent}>
        {SEVERITY_ICON[alert.severity]} {alert.event.toUpperCase()}
      </p>
      {alert.ends ? (
        <p className={styles.alertMeta}>
          Until{' '}
          {new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date(alert.ends))}
        </p>
      ) : null}
      <p className={styles.alertHeadline}>{alert.headline}</p>
      <button
        type="button"
        className={styles.alertToggle}
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        {expanded ? 'Hide details ▴' : 'Read more ▾'}
      </button>
      {expanded ? (
        <div className={styles.alertDetails}>
          <p>{alert.description}</p>
          {alert.instruction ? <p>{alert.instruction}</p> : null}
        </div>
      ) : null}
    </article>
  )
}

/** Active National Weather Service alerts for the NYC point. */
export default function AlertsRoute(): ReactElement {
  const { status, alerts, checkedAt } = useAlerts()

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Alerts</h1>

      {status === 'loading' ? (
        <p className={styles.loading} role="status">
          Checking for alerts…
        </p>
      ) : status === 'error' ? (
        <p className={styles.errorPanel} role="alert">
          Could not load alerts from the National Weather Service.
        </p>
      ) : alerts.length === 0 ? (
        <div className={styles.emptyAlerts}>
          <p className={styles.emptyAlertsIcon} aria-hidden="true">
            ☀️
          </p>
          <p>No active alerts for NYC</p>
          {checkedAt ? (
            <p className={styles.updatedAt}>
              Checked {formatUpdatedTime(checkedAt)}
            </p>
          ) : null}
        </div>
      ) : (
        <div className={styles.alertList}>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      <p className={styles.sourceNote}>Source: weather.gov (NWS)</p>
    </main>
  )
}
