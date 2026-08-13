import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styles from './top-nav.module.css'

const REPO_PAGES = [
  { to: '/repo/ci', label: 'CI checks' },
  { to: '/repo/production', label: 'Production deploys' },
  { to: '/repo/previews', label: 'Pull request previews' },
  { to: '/repo/planning', label: 'Project planning' },
  { to: '/repo/alpha-projs', label: 'Alpha Projs' },
]

export default function TopNav(): ReactElement {
  return (
    <nav aria-label="Primary" className={styles.nav}>
      <div className={styles.logoRow}>
        <Link to="/" className={styles.logoLink}>
          <img src="/lc-logo.svg" alt="LC Logo" className={styles.logo} />
        </Link>
      </div>
      <div className={styles.linksRow}>
        <Link to="/blog">Blogs</Link>
        <Link to="/apps">Apps</Link>
        <Link to="/guides">Guides</Link>
        <div className={styles.repoMenu}>
          <Link
            to="/repo"
            className={styles.repoTrigger}
            aria-label="Repo"
            title="Repo"
          >
            <svg
              aria-hidden="true"
              className={styles.wrenchIcon}
              viewBox="0 0 24 24"
            >
              <path d="M22.4 4.2a6.5 6.5 0 0 1-8.1 8.1L6.6 20a2.8 2.8 0 1 1-4-4l7.7-7.7a6.5 6.5 0 0 1 8.1-8.1l-3.7 3.7.7 2.7 2.7.7 3.7-3.7.6.6ZM5.2 16.9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />
            </svg>
          </Link>
          <div
            className={styles.repoDropdown}
            role="group"
            aria-label="Repo pages"
          >
            {REPO_PAGES.map((page) => (
              <Link key={page.to} to={page.to}>
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
