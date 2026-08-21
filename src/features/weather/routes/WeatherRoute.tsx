import { useLayoutEffect, type ReactElement } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import PalettePicker from '../components/PalettePicker'
import WeatherPwa from '../components/WeatherPwa'
import { WeatherContext } from '../hooks/WeatherContext'
import useTheme from '../hooks/useTheme'
import useWeather from '../hooks/useWeather'
import styles from '../weather.module.css'
import AlertsRoute from './AlertsRoute'
import DayRoute from './DayRoute'
import HourlyRoute from './HourlyRoute'
import WeeklyRoute from './WeeklyRoute'

export default function WeatherRoute(): ReactElement {
  const { theme, palette, setAppearance } = useTheme()
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
          <PalettePicker
            value={palette}
            theme={theme}
            onChange={setAppearance}
          />
        </header>
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
