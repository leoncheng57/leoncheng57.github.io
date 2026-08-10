import { useMemo, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import StationRowLink from '../components/StationRowLink'
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
              <StationRowLink station={station} />
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  )
}

export default function StationsRoute(): ReactElement {
  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        <Link to="/sub-wait/">Home</Link>
      </p>
      <h1 className={styles.pageTitle}>All stations</h1>
      <p className={styles.pageLede}>
        Every subway station, grouped by borough. Each one has its own page
        you can bookmark.
      </p>
      {BOROUGHS.map((borough) => (
        <BoroughGroup key={borough} borough={borough} />
      ))}
    </main>
  )
}
