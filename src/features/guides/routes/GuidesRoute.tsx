import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import useGuidesTheme from '../hooks/useGuidesTheme'
import styles from '../guides.module.css'
import GuideChapterRoute from './GuideChapterRoute'
import GuideOverviewRoute from './GuideOverviewRoute'

/**
 * A single guide reads as its own small documentation site: it owns a masthead,
 * footer, theme toggle, and chapter routes instead of the main site chrome.
 * The guides index at /guides stays on the main site and links in here.
 */
export default function GuidesRoute(): ReactElement {
  const { theme, toggleTheme } = useGuidesTheme()

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
          <Link to="/guides" className={styles.brand}>
            <span className={styles.brandMark}>/</span>
            <span>guides</span>
            <span className={styles.brandTag}>leoncheng.dev</span>
          </Link>
          <nav className={styles.mastheadNav} aria-label="Guides navigation">
            <Link to="/guides">All guides</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/">Main site</Link>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </nav>
        </header>

        <Routes>
          <Route index element={<GuideOverviewRoute />} />
          <Route path=":chapterSlug" element={<GuideChapterRoute />} />
        </Routes>

        <footer className={styles.footer}>
          <Link to="/">&larr; LeonCheng.dev</Link>
          <span>Guides are living documents and are revised over time.</span>
        </footer>
      </div>
    </div>
  )
}
