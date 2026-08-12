import { useEffect, type ReactElement, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { assetUrl } from '../utils/assetUrl'
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
  const diagramUrl = assetUrl('sub-wait/architecture-diagram-v2.svg')

  useEffect(() => {
    const previousTitle = document.title
    document.title = "Architecture | Sub-Wait"

    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        <Link to="/sub-wait/">Home</Link>
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
        src={diagramUrl}
        alt="Architecture diagram: at build time the MTA Stations.csv is turned into a bundled stations.json by a generator script; at runtime the browser polls the MTA GTFS-Realtime feeds, decodes protobuf with gtfs-realtime-bindings, and renders station pages, while a service worker caches the app shell and never caches feed data."
        width={860}
        height={560}
      />
      <p className={styles.docsDiagramCaption}>
        Diagram source lives in{' '}
        <code>scripts/architecture-diagram.mmd</code> (Mermaid) and is rendered
        to a checked-in SVG by <code>scripts/render-architecture-diagram.mjs</code>,
        so the site ships no diagramming code.
      </p>

      <DocsSection number={1} title="A quick GTFS primer">
        <p>
          <strong>GTFS</strong> (General Transit Feed Specification) is the
          industry standard for describing a transit system. It comes in two
          halves. <em>Static GTFS</em> is a zip of CSV-like tables —{' '}
          <code>stops.txt</code>, <code>routes.txt</code>, <code>trips.txt</code>,
          scheduled timetables — that changes only when the system itself
          changes. <em>GTFS-Realtime</em> is a live companion feed of what is
          actually happening right now: trip updates (predictions), vehicle
          positions, and service alerts.
        </p>
        <p>
          GTFS-Realtime is served as <strong>Protocol Buffers</strong>{' '}
          (protobuf), a compact binary format — a full line-group feed is a
          few tens of kilobytes instead of megabytes of JSON, which matters
          when every rider&apos;s phone polls it repeatedly. Each feed is one{' '}
          <code>FeedMessage</code> containing a header (with the feed&apos;s
          generation timestamp) and a list of entities. Each entity we care
          about holds a <code>TripUpdate</code>: one train&apos;s trip (trip
          ID, route ID) plus its list of <code>StopTimeUpdate</code>s — the
          predicted arrival/departure time at each stop it has yet to make.
        </p>
        <p>
          Stops are identified by GTFS stop IDs. The NYCT convention is a
          station ID like <code>F16</code> (East Broadway) plus a directional
          suffix: <code>F16N</code> is the railroad-north platform,{' '}
          <code>F16S</code> the railroad-south one. That suffix is how
          Sub-Wait splits arrivals into the two direction boards, and it maps
          one-to-one onto the <code>/station/:id/:direction</code> deep links.
          A train&apos;s destination is read from the last{' '}
          <code>StopTimeUpdate</code> in its trip — more reliable than trying
          to match NYCT&apos;s irregular trip IDs against static timetables.
        </p>
      </DocsSection>

      <DocsSection number={2} title="Static station data, generated at build time">
        <p>
          The real-time feeds only carry stop IDs, so the app bundles a
          station dataset generated from the MTA&apos;s official{' '}
          <code>Stations.csv</code> by{' '}
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

      <DocsSection number={3} title="Live arrivals from the GTFS-Realtime feeds">
        <p>
          The MTA publishes eight subway feeds, one per line group (1–7/S,
          A/C/E, B/D/F/M, G, J/Z, L, N/Q/R/W, SIR). They are keyless and
          CORS-open, so the browser fetches them directly —{' '}
          <code>data/feeds.ts</code> maps a station&apos;s routes to the
          smallest set of feeds needed. The three shuttles all appear as
          &ldquo;S&rdquo; in the station data but live in different feeds, so
          &ldquo;S&rdquo; fans out to every shuttle feed and the results are
          filtered by stop ID. Each feed is decoded in the browser with{' '}
          <code>gtfs-realtime-bindings</code>.
        </p>
      </DocsSection>

      <DocsSection number={4} title="Polling lifecycle">
        <p>
          <code>useArrivals</code> refreshes every 25 seconds — the feeds
          themselves regenerate roughly every 15–30 seconds, so polling
          faster buys nothing. When the tab is hidden the timer stops and
          in-flight requests are aborted; when you come back it refreshes
          immediately and resumes. Previous arrivals stay on screen during
          background refreshes, and the &ldquo;Live · updated&rdquo; stamp
          counts up from the feed header timestamp so stale data is obvious.
        </p>
      </DocsSection>

      <DocsSection number={5} title="Routing and deep links">
        <p>
          Every station has a shareable page at{' '}
          <code>/sub-wait/station/:id</code>, and each direction has its own
          page at <code>/sub-wait/station/:id/:direction</code> (
          <code>N</code> or <code>S</code>) — bookmark the platform you stand
          on every morning. The full borough-grouped directory lives at{' '}
          <code>/sub-wait/stations</code>. GitHub Pages serves a copied{' '}
          <code>404.html</code> so deep links resolve on a static host.
        </p>
      </DocsSection>

      <DocsSection number={6} title="Nearby and search">
        <p>
          Everything personal stays on the device. Nearby stations come from
          the Geolocation API — requested only after you tap &ldquo;Use my
          location&rdquo; — with distances computed by the haversine formula
          over the bundled coordinates and shown as walk-time estimates. No
          location data ever leaves the browser.
        </p>
      </DocsSection>

      <DocsSection number={7} title="PWA and caching strategy">
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

      <DocsSection number={8} title="Theming">
        <p>
          The palette is deliberately neutral black/white/gray for now, with
          light and dark variants switched by a <code>data-theme</code>{' '}
          attribute. The default follows <code>prefers-color-scheme</code>;
          the masthead toggle stores an explicit override in{' '}
          <code>localStorage</code>. Everything is CSS custom properties, so a
          future color scheme is a drop-in. Route bullets keep the official
          MTA line colors.
        </p>
      </DocsSection>

      <DocsSection number={9} title="Licensing and IP notes">
        <p>
          Sub-Wait is an independent project, <strong>not affiliated with or
          endorsed by the MTA</strong>. The real-time and static data are used
          under the MTA&apos;s open data terms. The colored route bullets and
          the official subway map are MTA trademarks/copyrighted works; this
          app renders its own generic bullets to identify actual train lines
          and draws its map page from raw coordinates rather than the official
          map artwork. Any future commercial use would need a review of the
          MTA&apos;s licensing program (route symbols in particular) and its
          data terms.
        </p>
      </DocsSection>

      <DocsSection number={10} title="Analytics">
        <p>
          Google Analytics 4 is already loaded globally in{' '}
          <code>index.html</code> with measurement ID{' '}
          <code>G-5MLNJQ7789</code>. Sub-Wait shares that site-wide property;
          there is no separate analytics SDK inside this feature.
        </p>
        <p>
          <a
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noreferrer"
          >
            Open Google Analytics
          </a>{' '}
          and choose the GA4 property connected to that measurement ID. To
          check that Sub-Wait is reporting:
        </p>
        <ol className={styles.analyticsSteps}>
          <li>
            Open <strong>Reports → Realtime</strong> in Google Analytics.
          </li>
          <li>
            Visit a Sub-Wait page in another tab or private window.
          </li>
          <li>
            Confirm a <code>page_view</code> appears with a{' '}
            <code>/sub-wait/…</code> page path, then inspect device and traffic
            source as needed.
          </li>
        </ol>
        <p>
          <strong>Note to future Leon:</strong> verify that GA4 Enhanced
          Measurement has browser-history page views enabled. React Router
          changes routes without a full document reload; if those navigation
          events do not appear, add explicit <code>page_view</code> events on
          route changes before relying on the reports. PR previews also load
          the global tag, so filter or disable <code>/previews/</code> traffic
          before treating the data as production-only.
        </p>
      </DocsSection>
    </main>
  )
}
