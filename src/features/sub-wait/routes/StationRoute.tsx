import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import RouteBullet from '../components/RouteBullet'
import { directionLabel, getStation } from '../data/stations'
import type { Direction, Station } from '../types'
import styles from '../sub-wait.module.css'

function DirectionSection({
  station,
  direction,
  standalone,
}: {
  station: Station
  direction: Direction
  standalone: boolean
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
      <p className={styles.placeholderNote}>
        Live arrivals are coming in the next update.
      </p>
    </section>
  )
}

export default function StationRoute(): ReactElement {
  const params = useParams<{ stationId: string; direction: string }>()
  const station = params.stationId ? getStation(params.stationId) : undefined
  const direction =
    params.direction === 'N' || params.direction === 'S'
      ? (params.direction as Direction)
      : null

  if (!station || (params.direction !== undefined && direction === null)) {
    return (
      <main className={styles.main}>
        <p className={styles.backLink}>
          <Link to="/sub-wait/">All stations</Link>
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
          <Link to="/sub-wait/">All stations</Link>
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
      </header>
      {directions.map((dir) => (
        <DirectionSection
          key={dir}
          station={station}
          direction={dir}
          standalone={direction !== null}
        />
      ))}
    </main>
  )
}
