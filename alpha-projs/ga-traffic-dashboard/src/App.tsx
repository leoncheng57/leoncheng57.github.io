import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ALL_GROUPS, colorForGroup, groupForPath } from './appGroups'

type ApiRow = { date: string; pagePath: string; value: number }
type ApiResponse = {
  granularity: 'day' | 'week'
  metric: string
  rows: ApiRow[]
  error?: string
}

const RANGES = [
  { label: '30 days', start: '30daysAgo' },
  { label: '90 days', start: '90daysAgo' },
  { label: '6 months', start: '180daysAgo' },
  { label: '12 months', start: '365daysAgo' },
]

const METRICS = [
  { label: 'Views', value: 'screenPageViews' },
  { label: 'Active users', value: 'activeUsers' },
  { label: 'Sessions', value: 'sessions' },
]

// Optional deep link to the GA4 report for this property. Kept out of the
// repo: set VITE_GA_REPORT_URL in .env.local (see .env.example).
const GA_REPORT_URL = import.meta.env.VITE_GA_REPORT_URL as string | undefined

function formatDateLabel(raw: string, granularity: 'day' | 'week'): string {
  if (granularity === 'week') {
    // yearWeek arrives as YYYYWW
    return `${raw.slice(0, 4)}-W${raw.slice(4)}`
  }
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`
}

export default function App() {
  const [start, setStart] = useState('90daysAgo')
  const [metric, setMetric] = useState('screenPageViews')
  const [granularity, setGranularity] = useState<'day' | 'week'>('week')
  const [hidden, setHidden] = useState<Set<string>>(new Set(['preview']))
  const [data, setData] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiUnavailable, setApiUnavailable] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setApiUnavailable(false)
    fetch(
      `/api/traffic?start=${start}&end=today&granularity=${granularity}&metric=${metric}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        const contentType = response.headers.get('content-type') ?? ''
        if (!contentType.includes('application/json')) {
          // Static hosting (e.g. GitHub Pages) has no /api route and
          // answers with an HTML 404 page instead of JSON.
          setApiUnavailable(true)
          return
        }
        const body = (await response.json()) as ApiResponse
        if (!response.ok) throw new Error(body.error ?? response.statusText)
        setData(body)
      })
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return
        if (err instanceof TypeError) {
          // Network-level failure: no server listening at all.
          setApiUnavailable(true)
          return
        }
        setError(String(err))
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [start, metric, granularity])

  const { chartData, groupNames } = useMemo(() => {
    if (!data) return { chartData: [], groupNames: [] as string[] }

    const byDate = new Map<string, Record<string, number | string>>()
    const totals = new Map<string, number>()

    for (const row of data.rows) {
      const group = groupForPath(row.pagePath)
      totals.set(group, (totals.get(group) ?? 0) + row.value)
      let bucket = byDate.get(row.date)
      if (!bucket) {
        bucket = { date: formatDateLabel(row.date, data.granularity) }
        byDate.set(row.date, bucket)
      }
      bucket[group] = ((bucket[group] as number) ?? 0) + row.value
    }

    const names = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)

    const rows = [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, bucket]) => bucket)

    return { chartData: rows, groupNames: names }
  }, [data])

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
      <main style={{ fontFamily: 'system-ui', margin: '3rem auto', maxWidth: 640, padding: '0 1rem' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Traffic by app - leoncheng57.github.io</h1>
        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: 12,
            padding: '1.5rem',
            marginTop: '1rem',
            background: '#f9fafb',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
            This is a static deployment - no data here
          </h2>
          <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
            The chart needs a local API server that queries Google Analytics
            with private credentials, so it only works on your machine. Static
            hosts like GitHub Pages can&apos;t run it.
          </p>
          <p style={{ marginBottom: '0.5rem' }}>Run it locally:</p>
          <pre
            style={{
              background: '#111827',
              color: '#e5e7eb',
              borderRadius: 8,
              padding: '0.9rem 1rem',
              fontSize: '0.85rem',
              overflowX: 'auto',
              marginBottom: '1rem',
            }}
          >
            {`git clone git@github.com:leoncheng57/leoncheng57.github.io.git
cd leoncheng57.github.io/alpha-projs/ga-traffic-dashboard
npm install
cp .env.example .env.local   # fill in your GA4 property + key path
npm run dev
# open http://localhost:5199`}
          </pre>
          <p style={{ lineHeight: 1.6 }}>
            {GA_REPORT_URL ? (
              <>
                Or view the full data directly in{' '}
                <a href={GA_REPORT_URL} target="_blank" rel="noreferrer">
                  Google Analytics - Pages and screens
                </a>
                .
              </>
            ) : (
              'Or view the full data directly in Google Analytics.'
            )}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: 'system-ui', margin: '2rem auto', maxWidth: 1100, padding: '0 1rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.4rem' }}>Traffic by app - leoncheng57.github.io</h1>
        {GA_REPORT_URL && (
          <a href={GA_REPORT_URL} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem' }}>
            Open in Google Analytics
          </a>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', margin: '1rem 0' }}>
        <label>
          Range{' '}
          <select value={start} onChange={(e) => setStart(e.target.value)}>
            {RANGES.map((r) => (
              <option key={r.start} value={r.start}>{r.label}</option>
            ))}
          </select>
        </label>
        <label>
          Metric{' '}
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>
        <label>
          Granularity{' '}
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as 'day' | 'week')}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {ALL_GROUPS.map((group) => (
          <button
            key={group.name}
            onClick={() => toggle(group.name)}
            style={{
              border: `2px solid ${group.color}`,
              borderRadius: 999,
              padding: '0.2rem 0.7rem',
              background: hidden.has(group.name) ? 'transparent' : group.color,
              color: hidden.has(group.name) ? group.color : '#fff',
              cursor: 'pointer',
            }}
          >
            {group.name}
          </button>
        ))}
      </div>

      {error && (
        <p style={{ color: '#b91c1c' }}>
          {error} - is the API server running with valid credentials?
        </p>
      )}
      {loading && <p>Loading...</p>}

      <ResponsiveContainer width="100%" height={480}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          {groupNames
            .filter((name) => !hidden.has(name))
            .map((name) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colorForGroup(name)}
                strokeWidth={2}
                dot={{ r: 2.5, strokeWidth: 0, fill: colorForGroup(name) }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </main>
  )
}
