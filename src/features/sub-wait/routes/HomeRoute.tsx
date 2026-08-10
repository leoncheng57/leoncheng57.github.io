import { useMemo, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import RouteBullet from '../components/RouteBullet'
import { BOROUGHS, stationsByBorough } from '../data/stations'
import styles from '../sub-wait.module.css'

function BoroughGroup({ borough }: { borough: string }): ReactElement | null {
  // Station rows are only rendered once the group is opened; rendering all
  // 496 stations (and their route bullets) up front makes the page sluggish.
  const [open, setOpen] = useState(false)
  const stations = useMemo(() => stationsByBorough(borough), [borough])
  if (stations.length === 0) return null

  return (
    <details
      className={styles.boroughGroup}
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
    >
      <summary className={styles.boroughSummary}>
        {borough}
        <span className={styles.boroughCount}>{stations.length} stations</span>
      </summary>
      {open ? (
        <ul className={styles.stationList}>
          {stations.map((station) => (
            <li key={station.id} className={styles.stationRow}>
              <Link
                className={styles.stationRowLink}
                to={`/sub-wait/station/${station.id}`}
              >
                <span className={styles.stationRowName}>{station.name}</span>
                <span className={styles.bulletRow}>
                  {station.routes.map((route) => (
                    <RouteBullet key={route} route={route} size="small" />
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  )
}

export default function HomeRoute(): ReactElement {
  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>How long until the train?</h1>
      <p className={styles.pageLede}>
        Pick a station to see it on its own page. Live arrival times, nearby
        stations, and favorites are on the way.
      </p>
      {BOROUGHS.map((borough) => (
        <BoroughGroup key={borough} borough={borough} />
      ))}
    </main>
  )
}
