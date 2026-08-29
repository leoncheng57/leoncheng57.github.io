import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../components/site-footer/SiteFooter'
import TopNav from '../components/top-nav/TopNav'
import styles from './not-found-route.module.css'

export default function NotFoundRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>404</p>
          <h1>Page not found</h1>
          <p>
            This page does not exist, or it may have moved. Try one of these
            instead:
          </p>
          <ul className={styles.links}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/apps">Apps</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/guides">Guides</Link>
            </li>
          </ul>
        </header>
      </main>
      <SiteFooter />
    </div>
  )
}
