import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

const GA_DASHBOARD_CODE_URL =
  'https://github.com/leoncheng57/leoncheng57.github.io/tree/main/alpha-projs/ga-traffic-dashboard'

// Reference links into GA4. They only load for signed-in users with access
// to the property; for everyone else GA shows an access-denied page.
const GA_PAGES_AND_SCREENS_URL =
  'https://analytics.google.com/analytics/web/#/a178477487p316439166/reports/explorer?r=all-pages-and-screens'
const GA_PER_APP_ROWS_URL =
  'https://analytics.google.com/analytics/web/#/a178477487p316439166/reports/explorer?params=_u.dateOption%3DyearToDate%26_u..nav%3Dmaui%26_r.explorerCard..dateGranularity%3DnthWeek%26_r.explorerCard..selectedRows%3D%5B%22%252Fsub-wait%252F%22,%22%252Fblog%22,%22%252Fapps%22,%22%252Fgeorgies-board-game-nights%22,%22%252F%22%5D%26_r.explorerCard..startRow%3D0&ruid=871a8f2c-5b49-4dca-bf07-590a458637e9&collectionId=11107990393&r=all-pages-and-screens'

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
                <h3>Tuzi</h3>
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
                <h3>GA Traffic Dashboard</h3>
                <span className={styles.alphaBadge}>Alpha</span>
              </div>
              <p>
                Local-only dashboard charting traffic per app on this site,
                powered by the GA4 Data API. It runs on my machine with private
                credentials, so there is no hosted version - the code is
                public.
              </p>
              <p className={styles.projectLinks}>
                <a
                  href={GA_DASHBOARD_CODE_URL}
                  className={styles.projectLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  View code on GitHub
                </a>
                <a
                  href={GA_PAGES_AND_SCREENS_URL}
                  className={styles.projectLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  GA: Pages and Screens
                </a>
                <a
                  href={GA_PER_APP_ROWS_URL}
                  className={styles.projectLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  GA: per-app rows
                </a>
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
