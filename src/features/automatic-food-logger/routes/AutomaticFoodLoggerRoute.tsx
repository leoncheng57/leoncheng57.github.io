import { useLayoutEffect, type ReactElement } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import AutomaticFoodLoggerPwa, { FOOD_LOGGER_APP_NAME } from '../components/AutomaticFoodLoggerPwa'
import LogMealRoute from './LogMealRoute'
import ShortcutSetupRoute from './ShortcutSetupRoute'
import styles from '../automatic-food-logger.module.css'

export default function AutomaticFoodLoggerRoute(): ReactElement {
  // The manifest scope ends in a slash; keep the installed app inside it.
  useLayoutEffect(() => {
    if (window.location.pathname === '/automatic-food-logger') {
      window.history.replaceState(window.history.state, '', '/automatic-food-logger/')
    }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <Link className={styles.brand} to="/automatic-food-logger/">
            <span className={styles.wordmark}>{FOOD_LOGGER_APP_NAME}</span>
            <span className={styles.betaBadge}>BETA</span>
          </Link>
          <nav className={styles.mastheadNav} aria-label={FOOD_LOGGER_APP_NAME}>
            <NavLink className={styles.mastheadLink} to="/automatic-food-logger/" end>
              Log
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/automatic-food-logger/setup">
              Setup
            </NavLink>
          </nav>
          <AutomaticFoodLoggerPwa />
        </header>

        <main className={styles.content}>
          <Routes>
            <Route index element={<LogMealRoute />} />
            <Route path="setup" element={<ShortcutSetupRoute />} />
          </Routes>
        </main>

        <SiteFooter>
          <span>
            Meals stay on this device and in Apple Health ·{' '}
            <Link to="/automatic-food-logger/setup">Set up the Shortcut</Link>
          </span>
        </SiteFooter>
      </div>
    </div>
  )
}
