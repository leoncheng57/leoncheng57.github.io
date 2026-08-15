import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import FeedbackTrigger from '../../../components/feedback/FeedbackTrigger'
import useGuidesTheme from '../hooks/useGuidesTheme'
import styles from '../guides.module.css'
import GuideChapterRoute from './GuideChapterRoute'
import GuideOverviewRoute from './GuideOverviewRoute'

/**
 * A single guide reads as its own small documentation site: it owns a
 * minimal masthead (just the theme toggle), footer, and chapter routes
 * instead of the main site chrome. The guides index at /guides stays on
 * the main site and links in here.
 */
export default function GuidesRoute(): ReactElement {
  const { theme, setTheme } = useGuidesTheme()

  // Take over the document canvas so the scrollbar and overscroll area follow
  // the guide theme; restore the main site styling on unmount.
  useEffect(() => {
    document.documentElement.dataset.guidesTheme = theme
    return () => {
      delete document.documentElement.dataset.guidesTheme
    }
  }, [theme])

  return (
    <div className={styles.page} data-theme={theme}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <span className={styles.betaBadge}>BETA</span>
          <div className={styles.themePill} role="group" aria-label="Color theme">
            <button
              type="button"
              className={theme === 'light' ? styles.themeOptionActive : styles.themeOption}
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              Light
            </button>
            <button
              type="button"
              className={theme === 'dark' ? styles.themeOptionActive : styles.themeOption}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              Dark
            </button>
          </div>
        </header>

        <Routes>
          <Route index element={<GuideOverviewRoute />} />
          <Route path=":chapterSlug" element={<GuideChapterRoute />} />
        </Routes>

        <footer className={styles.footer}>
          <Link to="/">&larr; LeonCheng.dev</Link>
          <span>Guides are living documents and are revised over time.</span>
          <FeedbackTrigger />
        </footer>
      </div>
    </div>
  )
}
