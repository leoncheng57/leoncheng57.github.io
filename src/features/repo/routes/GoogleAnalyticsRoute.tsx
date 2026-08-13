import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

export default function GoogleAnalyticsRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / analytics</p>
          <h1>Google Analytics</h1>
          <p>
            The site uses one Google Analytics 4 property to understand page
            traffic across the main site and its apps.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="analytics-setup-heading">
          <h2 id="analytics-setup-heading">Current setup</h2>
          <p>
            The global tag is loaded in <code>index.html</code> with measurement
            ID <code>G-5MLNJQ7789</code>. Every route shares this property; feature
            pages do not load separate analytics SDKs.
          </p>
          <p>
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noreferrer"
            >
              Open Google Analytics
            </a>{' '}
            and select the GA4 property connected to that measurement ID.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="analytics-verify-heading">
          <h2 id="analytics-verify-heading">Verify reporting</h2>
          <ol className={styles.steps}>
            <li>
              Open <strong>Reports → Realtime</strong> in Google Analytics.
            </li>
            <li>Visit the page being tested in another tab or private window.</li>
            <li>
              Confirm a <code>page_view</code> appears with the expected page
              path, device, and traffic source.
            </li>
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="analytics-routing-heading">
          <h2 id="analytics-routing-heading">Client-side navigation</h2>
          <p>
            The site sends an explicit <code>page_view</code> after each React
            Router navigation with the current URL, path, and route-specific
            title. Automatic tag pageviews and Enhanced Measurement
            browser-history pageviews are disabled so each initial load and
            client-side navigation is counted once.
          </p>
        </section>
      </main>
    </div>
  )
}
