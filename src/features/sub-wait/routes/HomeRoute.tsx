import { useMemo, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import StationRowLink from '../components/StationRowLink'
import { STATIONS } from '../data/stations'
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

export default function HomeRoute(): ReactElement {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <img
          className={styles.heroLogo}
          src="/sub-wait/icon.svg"
          alt="Sub-Wait logo"
          width={84}
          height={84}
        />
        <h1 className={styles.heroTitle}>Sub-Wait</h1>
        <p className={styles.heroTagline}>
          How long until the train? Live NYC subway arrivals, straight from
          the MTA&apos;s real-time feeds.
        </p>
      </header>
      <SearchSection />
      <NearbySection />
      <p className={styles.allStationsLink}>
        <Link to="/sub-wait/stations">Browse all stations →</Link>
      </p>
    </main>
  )
}
