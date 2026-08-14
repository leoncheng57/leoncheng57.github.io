import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

const CODE_URL =
  'https://github.com/leoncheng57/leoncheng57.github.io/tree/main/alpha-projs/ga-traffic-dashboard'
const PULL_REQUEST_URL =
  'https://github.com/leoncheng57/leoncheng57.github.io/pull/185'
const DATA_API_DOCS_URL =
  'https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport'

// Reference links into GA4. They only resolve for signed-in users with access
// to the property; everyone else sees an access-denied page.
const GA_PAGES_AND_SCREENS_URL =
  'https://analytics.google.com/analytics/web/#/a178477487p316439166/reports/explorer?r=all-pages-and-screens'
const GA_PER_APP_ROWS_URL =
  'https://analytics.google.com/analytics/web/#/a178477487p316439166/reports/explorer?params=_u.dateOption%3DyearToDate%26_u..nav%3Dmaui%26_r.explorerCard..dateGranularity%3DnthWeek%26_r.explorerCard..selectedRows%3D%5B%22%252Fsub-wait%252F%22,%22%252Fblog%22,%22%252Fapps%22,%22%252Fgeorgies-board-game-nights%22,%22%252F%22%5D%26_r.explorerCard..startRow%3D0&ruid=871a8f2c-5b49-4dca-bf07-590a458637e9&collectionId=11107990393&r=all-pages-and-screens'

const REQUEST_FLOW = `React UI :5199
     |
     v  /api/traffic
Node proxy :8787
     |
     v  runReport + key
GA4 Data API
     |
     v  aggregated rows
grouped JSON, one
line per app`

export default function GaTrafficDashboardRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/repo/alpha-projs">Back to alpha projs</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / alpha projs / GA traffic dashboard</p>
          <div className={styles.titleRow}>
            <h1>GA Traffic Dashboard</h1>
            <span className={styles.privateBadge}>(private-access-only)</span>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="looks-heading">
          <h2 id="looks-heading">What it looks like</h2>
          <p>
            Running locally with <strong>demo data</strong> (the screenshot
            uses generated numbers - real traffic stays private; note the
            badge):
          </p>
          <figure className={styles.screenshotFigure}>
            <img
              src="/alpha-projs/ga-dashboard-demo.png"
              alt="Full dashboard page rendered with demo data: KPI cards, per-app charts, tables"
              loading="lazy"
              width="1280"
              height="5155"
            />
            <figcaption>
              The full page at <code>localhost:5199/?demo</code>.
            </figcaption>
          </figure>
          <p>Deployed to a static host, it degrades to this instead:</p>
          <figure className={styles.screenshotFigure}>
            <img
              src="/alpha-projs/ga-dashboard-static-notice.png"
              alt="Static deployment notice with run-it-locally instructions"
              loading="lazy"
              width="998"
              height="760"
            />
            <figcaption>No credentials, no data - just instructions.</figcaption>
          </figure>
        </section>

        <section className={styles.section} aria-labelledby="how-heading">
          <h2 id="how-heading">How it works</h2>
          <p>
            A small Node proxy holds the credentials and calls{' '}
            <code>runReport</code>; the React front end only ever sees
            aggregated JSON and draws it with Recharts.
          </p>
          <pre className={styles.pipeline} aria-label="Request flow">
            <code>{REQUEST_FLOW}</code>
          </pre>
          <p>
            The proxy authenticates as a Google Cloud service account with
            Viewer access on the GA4 property, reading its configuration from a
            gitignored <code>.env.local</code>. No property IDs, key paths, or
            traffic numbers are committed.
          </p>
          <p>
            That is also why there is no hosted version: a static host has
            nowhere to run the proxy and no way to hold a secret. Deployed as a
            static build, the UI detects the missing API and shows setup
            instructions instead of an empty chart.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="run-heading">
          <h2 id="run-heading">Run it yourself</h2>
          <p>
            You need your own GA4 property, a service account key with Viewer
            access on it, and the Analytics Data API enabled.
          </p>
          <div className={styles.command} aria-label="Local setup commands">
            <span>$ git clone git@github.com:leoncheng57/leoncheng57.github.io.git</span>
            <span>$ cd leoncheng57.github.io/alpha-projs/ga-traffic-dashboard</span>
            <span>$ npm install</span>
            <span>$ cp .env.example .env.local</span>
            <span>$ npm run dev</span>
          </div>
          <p>
            Fill in <code>.env.local</code>, then open{' '}
            <code>http://localhost:5199</code>. The Vite dev server proxies{' '}
            <code>/api</code> to the Node process on port 8787.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="status-heading">
          <h2 id="status-heading">Status</h2>
          <p>
            Alpha. It currently charts views, active users, and sessions over
            fixed ranges, daily or weekly. On deck: an arbitrary date-range
            picker, a stacked-area view, and per-app detail tables.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="links-heading">
          <h2 id="links-heading">Reference links</h2>
          <ul className={styles.steps}>
            <li>
              <a href={CODE_URL} target="_blank" rel="noreferrer">
                Source code on GitHub
              </a>{' '}
              - the <code>alpha-projs/ga-traffic-dashboard</code> folder.
            </li>
            <li>
              <a href={PULL_REQUEST_URL} target="_blank" rel="noreferrer">
                Pull request #185
              </a>{' '}
              - how it landed, including the privacy constraints.
            </li>
            <li>
              <a href={GA_PAGES_AND_SCREENS_URL} target="_blank" rel="noreferrer">
                GA4: Pages and screens
              </a>{' '}
              <span className={styles.privateBadge}>(private-access-only)</span>{' '}
              - the per-page report this replaces.
            </li>
            <li>
              <a href={GA_PER_APP_ROWS_URL} target="_blank" rel="noreferrer">
                GA4: per-app rows, year to date
              </a>{' '}
              <span className={styles.privateBadge}>(private-access-only)</span>{' '}
              - the closest equivalent using plotted rows.
            </li>
            <li>
              <a href={DATA_API_DOCS_URL} target="_blank" rel="noreferrer">
                Analytics Data API: runReport
              </a>{' '}
              - the endpoint behind every chart.
            </li>
          </ul>
          <p>
            The two GA4 links need an account with access to this
            site&apos;s property; without it Google shows an access-denied
            page.
          </p>
        </section>
      </main>
    </div>
  )
}
