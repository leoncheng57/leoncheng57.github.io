import { useEffect, useState, type ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import ArrivalBoard from '../components/ArrivalBoard'
import RouteBullet from '../components/RouteBullet'
import type { Arrival } from '../data/arrivals'
import { directionLabel, getStation } from '../data/stations'
import useArrivals, { type ArrivalsState } from '../hooks/useArrivals'
import type { Direction, Station } from '../types'
import styles from '../sub-wait.module.css'

function DirectionSection({
  station,
  direction,
  standalone,
  arrivals,
  state,
}: {
  station: Station
  direction: Direction
  standalone: boolean
  arrivals: Arrival[]
  state: ArrivalsState
}): ReactElement | null {
  const label = directionLabel(station, direction)
  if (label === null) return null

  return (
    <section
      className={styles.directionSection}
      aria-label={`${label} arrivals`}
    >
      <div className={styles.directionHeading}>
        <h2>{label}</h2>
        {standalone ? null : (
          <Link
            className={styles.directionDeepLink}
            to={`/sub-wait/station/${station.id}/${direction}`}
          >
            Only this direction
          </Link>
        )}
      </div>
      <ArrivalBoard
        arrivals={arrivals}
        status={state.status}
        onRetry={state.refresh}
      />
    </section>
  )
}

export function formatElapsed(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}

function UpdatedStamp({ updatedAt }: { updatedAt: number | null }): ReactElement | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (updatedAt === null) return null
  return (
    <p className={styles.updatedStamp}>
      Live · updated {formatElapsed(now - updatedAt)}
    </p>
  )
}

export default function StationRoute(): ReactElement {
  const params = useParams<{ stationId: string; direction: string }>()
  const station = params.stationId ? getStation(params.stationId) : undefined
  const direction =
    params.direction === 'N' || params.direction === 'S'
      ? (params.direction as Direction)
      : null
  const arrivalsState = useArrivals(station)

  if (!station || (params.direction !== undefined && direction === null)) {
    return (
      <main className={styles.main}>
        <p className={styles.backLink}>
          <Link to="/sub-wait/stations">All stations</Link>
        </p>
        <div className={styles.notFound}>
          <h1 className={styles.pageTitle}>Station not found</h1>
          <p>That stop ID does not match any subway station.</p>
        </div>
      </main>
    )
  }

  const directions: Direction[] = direction ? [direction] : ['N', 'S']

  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        {direction ? (
          <Link to={`/sub-wait/station/${station.id}`}>Both directions</Link>
        ) : (
          <Link to="/sub-wait/stations">All stations</Link>
        )}
      </p>
      <header className={styles.stationHeader}>
        <h1 className={styles.stationTitle}>{station.name}</h1>
        <div className={styles.stationBullets}>
          {station.routes.map((route) => (
            <RouteBullet key={route} route={route} size="large" />
          ))}
        </div>
        <p className={styles.stationMeta}>{station.borough}</p>
        <UpdatedStamp updatedAt={arrivalsState.updatedAt} />
      </header>
      {directions.map((dir) => (
        <DirectionSection
          key={dir}
          station={station}
          direction={dir}
          standalone={direction !== null}
          arrivals={arrivalsState.arrivals.filter(
            (arrival) => arrival.direction === dir,
          )}
          state={arrivalsState}
        />
      ))}
    </main>
  )
}
