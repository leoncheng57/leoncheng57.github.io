import { useEffect, useMemo, useState } from 'react'
import {
  ApiUnavailableError,
  fetchPages,
  fetchQuality,
  fetchSummary,
  fetchTraffic,
  isDemoMode,
  type PageRow,
  type QualityResponse,
  type SummaryResponse,
  type TrafficResponse,
} from './api'
import { ALL_GROUPS } from './appGroups'
import { groupByApp, toShare } from './charts'
import { AppLines, AppShareArea } from './components/AppLineChart'
import KpiCards from './components/KpiCards'
import QualitySection from './components/QualitySection'
import RangePicker from './components/RangePicker'
import SparklineGrid from './components/SparklineGrid'
import StaticNotice from './components/StaticNotice'
import TopPagesTable from './components/TopPagesTable'
import { PRESETS, autoGranularity, previousPeriod, type DateRange } from './dates'
import styles from './dashboard.module.css'

// Optional deep link to the GA4 report for this property (set in .env.local).
const GA_REPORT_URL = import.meta.env.VITE_GA_REPORT_URL as string | undefined

const METRIC_SECTIONS = [
  { metric: 'screenPageViews', title: 'Views by app' },
  { metric: 'activeUsers', title: 'Active users by app' },
  { metric: 'sessions', title: 'Sessions by app' },
] as const

export default function App() {
  const [range, setRange] = useState<DateRange>(() => PRESETS[2].range()) // 90 days
  const [hidden, setHidden] = useState<Set<string>>(new Set(['preview']))

  const [traffic, setTraffic] = useState<TrafficResponse | null>(null)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [prevSummary, setPrevSummary] = useState<SummaryResponse | null>(null)
  const [pages, setPages] = useState<PageRow[] | null>(null)
  const [quality, setQuality] = useState<QualityResponse | null>(null)

  const [apiUnavailable, setApiUnavailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const granularity = autoGranularity(range)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    setLoading(true)
    setError(null)

    const handle = (err: unknown) => {
      if ((err as Error).name === 'AbortError') return
      if (err instanceof ApiUnavailableError) setApiUnavailable(true)
      else setError(String(err))
    }

    Promise.all([
      fetchTraffic(range, granularity, signal).then(setTraffic),
      fetchSummary(range, signal).then(setSummary),
      fetchSummary(previousPeriod(range), signal).then(setPrevSummary),
      fetchPages(range, signal).then((body) => setPages(body.rows)),
      fetchQuality(range, granularity, signal).then(setQuality),
    ])
      .catch(handle)
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [range, granularity])

  const volumeSeries = useMemo(() => {
    if (!traffic) return null
    return {
      screenPageViews: groupByApp(traffic.rows, 'screenPageViews', traffic.granularity),
      activeUsers: groupByApp(traffic.rows, 'activeUsers', traffic.granularity),
      sessions: groupByApp(traffic.rows, 'sessions', traffic.granularity),
    }
  }, [traffic])

  const shareData = useMemo(
    () => (volumeSeries ? toShare(volumeSeries.screenPageViews) : null),
    [volumeSeries],
  )

  const toggle = (name: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  if (apiUnavailable) {
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Alpha projs / GA traffic dashboard</p>
          <h1>Traffic by app</h1>
          <StaticNotice />
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Alpha projs / GA traffic dashboard</p>
            <h1>
              Traffic by app
              {isDemoMode() && <span className={styles.demoBadge}>demo data</span>}
            </h1>
          </div>
          {GA_REPORT_URL && (
            <a
              className={styles.headerLinks}
              href={GA_REPORT_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Analytics
            </a>
          )}
        </header>

        <RangePicker range={range} onChange={setRange} />

        <div className={styles.pillRow}>
          {ALL_GROUPS.map((group) => (
            <button
              key={group.name}
              onClick={() => toggle(group.name)}
              className={styles.pill}
              style={{
                borderColor: group.color,
                background: hidden.has(group.name) ? 'transparent' : group.color,
                color: hidden.has(group.name) ? group.color : '#fff',
              }}
            >
              {group.name}
            </button>
          ))}
          {loading && <span className={styles.loading}>loading…</span>}
        </div>

        {error && (
          <p className={styles.error}>
            {error} - is the API server running with valid credentials?
          </p>
        )}

        <section className={styles.section}>
          <KpiCards current={summary} previous={prevSummary} />
        </section>

        {volumeSeries &&
          METRIC_SECTIONS.map(({ metric, title }) => (
            <section key={metric} className={styles.section}>
              <h2>{title}</h2>
              <div className={styles.card}>
                <AppLines
                  data={volumeSeries[metric].chartData}
                  groupNames={volumeSeries[metric].groupNames}
                  hidden={hidden}
                />
              </div>
            </section>
          ))}

        {volumeSeries && shareData && (
          <section className={styles.section}>
            <h2>Share of traffic</h2>
            <p className={styles.sectionNote}>
              Each app&apos;s percentage of total views over time.
            </p>
            <div className={styles.card}>
              <AppShareArea
                data={shareData}
                groupNames={volumeSeries.screenPageViews.groupNames}
                hidden={hidden}
              />
            </div>
          </section>
        )}

        {volumeSeries && (
          <section className={styles.section}>
            <h2>Per-app trend</h2>
            <p className={styles.sectionNote}>
              Views over the selected range; arrow compares the second half to
              the first.
            </p>
            <SparklineGrid series={volumeSeries.screenPageViews} />
          </section>
        )}

        {pages && (
          <section className={styles.section}>
            <h2>Top pages</h2>
            <TopPagesTable rows={pages} />
          </section>
        )}

        {quality && pages && (
          <QualitySection quality={quality} pages={pages} hidden={hidden} />
        )}
      </div>
    </main>
  )
}
