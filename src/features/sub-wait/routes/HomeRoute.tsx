import { useMemo, useState, type ReactElement } from 'react'
import StationRowLink from '../components/StationRowLink'
import { BOROUGHS, STATIONS, getStation, stationsByBorough } from '../data/stations'
import useFavorites from '../hooks/useFavorites'
import useNearbyStations from '../hooks/useNearbyStations'
import { walkMinutes } from '../utils/distance'
import styles from '../sub-wait.module.css'

const SEARCH_LIMIT = 12

function SearchSection(): ReactElement {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (needle.length < 2) return []
    return STATIONS.filter((station) =>
      station.name.toLowerCase().includes(needle),
    ).slice(0, SEARCH_LIMIT)
  }, [query])

  return (
    <section className={styles.homeSection} aria-label="Station search">
      <input
        type="search"
        className={styles.searchInput}
        placeholder="Search stations…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search stations"
      />
      {query.trim().length >= 2 ? (
        results.length > 0 ? (
          <ul className={styles.stationList} data-standalone="true">
            {results.map((station) => (
              <li key={station.id} className={styles.stationRow}>
                <StationRowLink station={station} detail={station.borough} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.placeholderNote}>
            No stations match “{query.trim()}”.
          </p>
        )
      ) : null}
    </section>
  )
}

function FavoritesSection({ favorites }: { favorites: string[] }): ReactElement | null {
  const stations = favorites
    .map((id) => getStation(id))
    .filter((station) => station !== undefined)
  if (stations.length === 0) return null

  return (
    <section className={styles.homeSection} aria-label="Favorite stations">
      <h2 className={styles.homeSectionTitle}>Favorites</h2>
      <ul className={styles.stationList} data-standalone="true">
        {stations.map((station) => (
          <li key={station.id} className={styles.stationRow}>
            <StationRowLink station={station} detail={station.borough} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function NearbySection(): ReactElement {
  const { status, nearby, locate } = useNearbyStations()

  return (
    <section className={styles.homeSection} aria-label="Nearby stations">
      <h2 className={styles.homeSectionTitle}>Nearby</h2>
      {status === 'ready' ? (
        <ul className={styles.stationList} data-standalone="true">
          {nearby.map(({ station, meters }) => (
            <li key={station.id} className={styles.stationRow}>
              <StationRowLink
                station={station}
                detail={`${walkMinutes(meters)} min walk`}
              />
            </li>
          ))}
        </ul>
      ) : status === 'locating' ? (
        <p className={styles.placeholderNote}>Finding stations near you…</p>
      ) : status === 'denied' ? (
        <p className={styles.placeholderNote}>
          Location permission was denied. Allow location access to see nearby
          stations.
        </p>
      ) : status === 'unavailable' ? (
        <p className={styles.placeholderNote}>
          Location is not available on this device.
        </p>
      ) : (
        <p className={styles.placeholderNote}>
          <button type="button" className={styles.locateButton} onClick={locate}>
            Use my location
          </button>{' '}
          to list the closest stations.
        </p>
      )}
    </section>
  )
}

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

export default function HomeRoute(): ReactElement {
  const { favorites } = useFavorites()

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>How long until the train?</h1>
      <p className={styles.pageLede}>
        Live NYC subway arrivals. Star the stations you use and they will be
        waiting here.
      </p>
      <SearchSection />
      <FavoritesSection favorites={favorites} />
      <NearbySection />
      <section className={styles.homeSection} aria-label="All stations">
        <h2 className={styles.homeSectionTitle}>All stations</h2>
        {BOROUGHS.map((borough) => (
          <BoroughGroup key={borough} borough={borough} />
        ))}
      </section>
    </main>
  )
}
