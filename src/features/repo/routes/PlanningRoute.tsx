import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import OpenIssues from '../components/OpenIssues'
import styles from '../repo.module.css'

export default function PlanningRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / planning</p>
          <h1>Project planning</h1>
          <p>
            Work on this site is planned in the open. These are the GitHub
            issues currently on the backlog, fetched live from the GitHub API.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="issues-heading">
          <h2 id="issues-heading">Open issues</h2>
          <OpenIssues />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
