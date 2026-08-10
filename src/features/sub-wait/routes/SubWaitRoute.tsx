import { useLayoutEffect, type ReactElement } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import SubWaitPwa from '../components/SubWaitPwa'
import useTheme from '../hooks/useTheme'
import styles from '../sub-wait.module.css'
import ArchitectureRoute from './ArchitectureRoute'
import HomeRoute from './HomeRoute'
import InstallRoute from './InstallRoute'
import MapRoute from './MapRoute'
import StationRoute from './StationRoute'
import StationsRoute from './StationsRoute'

export default function SubWaitRoute(): ReactElement {
  const { theme, toggleTheme } = useTheme()

  useLayoutEffect(() => {
    if (window.location.pathname === '/sub-wait') {
      window.history.replaceState(window.history.state, '', '/sub-wait/')
    }
  }, [])

  return (
    <div className={styles.page} data-theme={theme}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <Link className={styles.brand} to="/sub-wait/">
            <span className={styles.wordmark}>Sub-Wait</span>
            <span className={styles.betaBadge}>BETA</span>
          </Link>
          <div className={styles.mastheadActions}>
            <nav className={styles.mastheadNav} aria-label="Sub-Wait">
              <NavLink
                className={styles.mastheadLink}
                to="/sub-wait/stations"
              >
                Stations
              </NavLink>
              <NavLink className={styles.mastheadLink} to="/sub-wait/map">
                Map
              </NavLink>
              <NavLink
                className={styles.mastheadLink}
                to="/sub-wait/architecture"
              >
                Architecture
              </NavLink>
            </nav>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>
        <SubWaitPwa />

        <Routes>
          <Route index element={<HomeRoute />} />
          <Route path="station/:stationId" element={<StationRoute />} />
          <Route
            path="station/:stationId/:direction"
            element={<StationRoute />}
          />
          <Route path="stations" element={<StationsRoute />} />
          <Route path="install" element={<InstallRoute />} />
          <Route path="map" element={<MapRoute />} />
          <Route path="architecture" element={<ArchitectureRoute />} />
        </Routes>

        <footer className={styles.footer}>
          <span>
            Sub-Wait · <Link to="/sub-wait/install">Install</Link> ·{' '}
            <Link to="/sub-wait/architecture">How it works</Link>
          </span>
          <span>
            Real-time data from the{' '}
            <a href="https://api.mta.info/">MTA GTFS-Realtime feeds</a>
          </span>
        </footer>
      </div>
    </div>
  )
}
