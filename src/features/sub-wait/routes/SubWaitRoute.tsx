import { useLayoutEffect, type ReactElement } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import FeedbackButton from '../components/FeedbackButton'
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
          <nav className={styles.mastheadNav} aria-label="Sub-Wait">
            <NavLink className={styles.mastheadLink} to="/sub-wait/stations">
              Stations
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/sub-wait/map">
              Map
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/sub-wait/install">
              Install
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/sub-wait/architecture">
              Architecture
            </NavLink>
          </nav>
          <div className={styles.mastheadActions}>
            <FeedbackButton />
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 15.3A8.5 8.5 0 0 1 8.7 4a8.5 8.5 0 1 0 11.3 11.3Z" />
                </svg>
              )}
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
            <a href="https://leoncheng.dev/">← LeonCheng.dev</a>
          </span>
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
