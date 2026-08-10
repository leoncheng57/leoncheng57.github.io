import type { ReactElement, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from '../sub-wait.module.css'

function DocsSection({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: ReactNode
}): ReactElement {
  return (
    <section className={styles.docsSection}>
      <h2 className={styles.docsSectionTitle}>
        <span className={styles.docsSectionNumber}>{number}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ArchitectureRoute(): ReactElement {
  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        <Link to="/sub-wait/">Back to stations</Link>
      </p>
      <h1 className={styles.pageTitle}>How Sub-Wait works</h1>
      <p className={styles.pageLede}>
        Sub-Wait is a fully client-side PWA: a static site on GitHub Pages that
        talks straight to the MTA&apos;s real-time feeds from your browser.
        There is no backend, no API key, and no database. This page documents
        the internal architecture.
      </p>

      <img
        className={styles.docsDiagram}
        src="/sub-wait/architecture-diagram.svg"
        alt="Architecture diagram: at build time the MTA Stations.csv is turned into a bundled stations.json by a generator script; at runtime the browser polls the MTA GTFS-Realtime feeds, decodes protobuf with gtfs-realtime-bindings, and renders station pages, while a service worker caches the app shell and never caches feed data."
        width={860}
        height={560}
      />

      <DocsSection number={1} title="Static station data, generated at build time">
        <p>
          The real-time feeds only carry GTFS stop IDs like <code>F16</code>,
          so the app bundles a station dataset generated from the MTA&apos;s
          official <code>Stations.csv</code> by{' '}
          <code>scripts/generate-subway-stations.mjs</code>. The output —{' '}
          <code>stations.json</code>, 496 stations — is checked into the repo
          so builds are deterministic and offline. Each record has the stop
          ID, name, coordinates, routes, borough, and the official{' '}
          <em>north/south direction labels</em> (&ldquo;Uptown &amp;
          Queens&rdquo;, &ldquo;Downtown &amp; Brooklyn&rdquo;) that headline
          each arrivals board. The script is re-run manually on the rare
          occasion the MTA renames or adds a station.
        </p>
      </DocsSection>

      <DocsSection number={2} title="Live arrivals from the MTA GTFS-Realtime feeds">
        <p>
          The MTA publishes eight protobuf feeds, one per line group
          (1–7/S, A/C/E, B/D/F/M, G, J/Z, L, N/Q/R/W, SIR). They are keyless
          and CORS-open, so the browser fetches them directly —{' '}
          <code>data/feeds.ts</code> maps a station&apos;s routes to the
          smallest set of feeds needed. The three shuttles all appear as
          &ldquo;S&rdquo; in the station data but live in different feeds, so
          &ldquo;S&rdquo; fans out to every shuttle feed and the results are
          filtered by stop ID.
        </p>
        <p>
          Each feed is decoded in the browser with{' '}
          <code>gtfs-realtime-bindings</code>. For every trip update the app
          keeps stop-time updates matching the station&apos;s stop ID plus an{' '}
          <code>N</code>/<code>S</code> suffix, which is also how arrivals are
          split into the two direction boards. A train&apos;s destination is
          the name of the last stop in its trip update — more reliable than
          matching NYCT trip IDs to static timetables.
        </p>
      </DocsSection>

      <DocsSection number={3} title="Polling lifecycle">
        <p>
          <code>useArrivals</code> refreshes every 25 seconds — the feeds
          themselves update roughly every 15–30 seconds, so polling faster
          buys nothing. When the tab is hidden the timer stops and in-flight
          requests are aborted; when you come back it refreshes immediately
          and resumes. Previous arrivals stay on screen during background
          refreshes, and the &ldquo;Live · updated&rdquo; stamp shows the feed
          header timestamp so stale data is visible.
        </p>
      </DocsSection>

      <DocsSection number={4} title="Routing and deep links">
        <p>
          Every station has a shareable page at{' '}
          <code>/sub-wait/station/:id</code>, and each direction has its own
          page at <code>/sub-wait/station/:id/:direction</code> (
          <code>N</code> or <code>S</code>) — bookmark the platform you stand
          on every morning. GitHub Pages serves a copied{' '}
          <code>404.html</code> so deep links resolve on a static host.
        </p>
      </DocsSection>

      <DocsSection number={5} title="Nearby, search, and favorites">
        <p>
          Everything personal stays on the device. Favorites are station IDs
          in <code>localStorage</code>. Nearby stations come from the
          Geolocation API — requested only after you tap &ldquo;Use my
          location&rdquo; — with distances computed by the haversine formula
          over the bundled coordinates and shown as walk-time estimates. No
          location data ever leaves the browser.
        </p>
      </DocsSection>

      <DocsSection number={6} title="PWA and caching strategy">
        <p>
          A service worker scoped to <code>/sub-wait/</code> precaches the app
          shell (reading the Vite build manifest for hashed assets) and serves
          same-origin requests cache-first, so the app opens instantly from
          the home screen. Requests to <code>api-endpoint.mta.info</code> are
          deliberately network-only: real-time train data must never be served
          from cache. The worker is registered only in production at the root
          base URL, so PR previews never install one.
        </p>
      </DocsSection>

      <DocsSection number={7} title="Theming">
        <p>
          Light and dark palettes are CSS custom properties switched by a{' '}
          <code>data-theme</code> attribute. The default follows{' '}
          <code>prefers-color-scheme</code>; the masthead toggle stores an
          explicit override in <code>localStorage</code> and wins until
          cleared.
        </p>
      </DocsSection>
    </main>
  )
}
