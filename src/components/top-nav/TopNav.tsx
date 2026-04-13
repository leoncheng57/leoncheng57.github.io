import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styles from './top-nav.module.css'

export default function TopNav(): ReactElement {
  return (
    <nav aria-label="Primary" className={styles.nav}>
      <div className={styles.logoRow}>
        <Link to="/">
          <img src="/lc-logo.svg" alt="LC Logo" className={styles.logo} />
        </Link>
      </div>
      <div className={styles.linksRow}>
        <Link to="/">Home</Link>
        <Link to="/blog">Blogs</Link>
      </div>
    </nav>
  )
}
