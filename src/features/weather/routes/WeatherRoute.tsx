import { useLayoutEffect, type ReactElement } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import WeatherPwa from '../components/WeatherPwa'
import { WeatherContext } from '../hooks/WeatherContext'
import useTheme from '../hooks/useTheme'
import useWeather from '../hooks/useWeather'
import { PALETTES, type Palette } from '../palettes'
import styles from '../weather.module.css'
import AlertsRoute from './AlertsRoute'
import DayRoute from './DayRoute'
import HourlyRoute from './HourlyRoute'
import WeeklyRoute from './WeeklyRoute'

export default function WeatherRoute(): ReactElement {
  const { theme, toggleTheme, palette, setPalette } = useTheme()
  const weather = useWeather()

  useLayoutEffect(() => {
    if (window.location.pathname === '/weather') {
      window.history.replaceState(window.history.state, '', '/weather/')
    }
  }, [])

  return (
    <div className={styles.page} data-theme={theme} data-palette={palette}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <Link className={styles.brand} to="/weather/">
            <span className={styles.wordmark}>NYC Weather</span>
            <span className={styles.betaBadge}>BETA</span>
          </Link>
          <nav className={styles.mastheadNav} aria-label="NYC Weather">
            <NavLink className={styles.mastheadLink} to="/weather/" end>
              Hourly
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/weather/weekly">
              Weekly
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/weather/alerts">
              Alerts
            </NavLink>
          </nav>
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
        </header>
        <div className={styles.paletteBar}>
          <label className={styles.paletteLabel} htmlFor="wx-palette">
            Theme preview
          </label>
          <select
            id="wx-palette"
            className={styles.paletteSelect}
            value={palette}
            onChange={(event) => setPalette(event.target.value as Palette)}
          >
            {PALETTES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.paletteHint}>beta · pick a favorite</span>
        </div>
        <WeatherPwa />

        <WeatherContext.Provider value={weather}>
          <Routes>
            <Route index element={<HourlyRoute />} />
            <Route path="weekly" element={<WeeklyRoute />} />
            <Route path="day/:date" element={<DayRoute />} />
            <Route path="alerts" element={<AlertsRoute />} />
          </Routes>
        </WeatherContext.Provider>

        <footer className={styles.footer}>
          <span>
            NYC Weather · <Link to="/weather/weekly">Weekly</Link> ·{' '}
            <Link to="/weather/alerts">Alerts</Link>
          </span>
          <span>
            Weather and air quality by{' '}
            <a href="https://open-meteo.com/">Open-Meteo</a> · Alerts from{' '}
            <a href="https://www.weather.gov/">NWS</a>
          </span>
        </footer>
      </div>
    </div>
  )
}
