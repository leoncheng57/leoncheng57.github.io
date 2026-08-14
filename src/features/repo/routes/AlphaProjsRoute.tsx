import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

export default function AlphaProjsRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / alpha projs</p>
          <h1>Alpha Projs</h1>
        </header>

        <section aria-labelledby="alpha-projects-heading">
          <h2 id="alpha-projects-heading" className={styles.eyebrow}>
            Active experiments
          </h2>
          <article className={styles.projectCard}>
            <img src="/app-icons/tuzi.svg" alt="" width="72" height="72" />
            <div className={styles.projectCardBody}>
              <div className={styles.projectCardHeading}>
                <h3>
                  <Link to="/tuzi/">Tuzi</Link>
                </h3>
                <span className={styles.alphaBadge}>Alpha</span>
              </div>
              <p>
                A demonstration prototype for comparing books head-to-head and
                building an Elo-ranked shelf. Rankings currently reset on reload.
              </p>
              <Link to="/tuzi/" className={styles.projectLink}>
                Start ranking
              </Link>
            </div>
          </article>
          <article className={styles.projectCard}>
            <img
              src="/app-icons/ga-traffic-dashboard.svg"
              alt=""
              width="72"
              height="72"
            />
            <div className={styles.projectCardBody}>
              <div className={styles.projectCardHeading}>
                <h3>
                  <Link to="/repo/alpha-projs/ga-traffic-dashboard">
                    GA Traffic Dashboard
                  </Link>
                </h3>
                <span className={styles.alphaBadge}>Alpha</span>
                <span className={styles.privateBadge}>local-only</span>
              </div>
              <p>
                Local-only dashboard charting traffic per app on this site,
                powered by the GA4 Data API.
              </p>
              <Link
                to="/repo/alpha-projs/ga-traffic-dashboard"
                className={styles.projectLink}
              >
                Read more
              </Link>
            </div>
          </article>
          <article className={styles.projectCard}>
            <img
              src="/app-icons/gmail-reader.svg"
              alt=""
              width="72"
              height="72"
            />
            <div className={styles.projectCardBody}>
              <div className={styles.projectCardHeading}>
                <h3>
                  <Link to="/repo/alpha-projs/gmail-reader">Gmail Reader</Link>
                </h3>
                <span className={styles.alphaBadge}>Alpha</span>
                <span className={styles.privateBadge}>local-only</span>
              </div>
              <p>
                Local-only Gmail organizer: full-inbox index in SQLite, grouped
                bulk archive/label with a review queue, audit history with undo,
                and a local analytics dashboard.
              </p>
              <Link
                to="/repo/alpha-projs/gmail-reader"
                className={styles.projectLink}
              >
                Read more
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
