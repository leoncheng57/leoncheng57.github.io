import { readFileSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Load .env.local (gitignored) so private config never lives in the repo.
const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
try {
  const envFile = readFileSync(path.join(projectRoot, '.env.local'), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match || match[1] in process.env) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
} catch {
  // no .env.local - rely on the shell environment
}

const PORT = Number(process.env.PORT ?? 8787)
const PROPERTY_ID = process.env.GA_PROPERTY_ID

if (!PROPERTY_ID) {
  console.error(
    'GA_PROPERTY_ID is not set. Copy .env.example to .env.local and fill it in.',
  )
  process.exit(1)
}

// Credentials: set GOOGLE_APPLICATION_CREDENTIALS to the path of a service
// account key JSON that has Viewer access on the GA4 property.
const client = new BetaAnalyticsDataClient()

async function runTrafficReport({ start, end, granularity, metric }) {
  const dateDimension = granularity === 'week' ? 'yearWeek' : 'date'
  const [response] = await client.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: [{ name: dateDimension }, { name: 'pagePath' }],
    metrics: [{ name: metric }],
    limit: 250000,
  })
  return (response.rows ?? []).map((row) => ({
    date: row.dimensionValues[0].value,
    pagePath: row.dimensionValues[1].value,
    value: Number(row.metricValues[0].value),
  }))
}

const ALLOWED_METRICS = new Set([
  'screenPageViews',
  'activeUsers',
  'sessions',
])

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (url.pathname !== '/api/traffic') {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }

  const start = url.searchParams.get('start') ?? '90daysAgo'
  const end = url.searchParams.get('end') ?? 'today'
  const granularity =
    url.searchParams.get('granularity') === 'week' ? 'week' : 'day'
  const metric = url.searchParams.get('metric') ?? 'screenPageViews'

  if (!ALLOWED_METRICS.has(metric)) {
    res.writeHead(400, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: `metric must be one of ${[...ALLOWED_METRICS].join(', ')}` }))
    return
  }

  try {
    const rows = await runTrafficReport({ start, end, granularity, metric })
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ granularity, metric, rows }))
  } catch (error) {
    console.error(error)
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: String(error.message ?? error) }))
  }
})

server.listen(PORT, () => {
  console.log(`GA proxy listening on http://localhost:${PORT}`)
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn(
      'WARNING: GOOGLE_APPLICATION_CREDENTIALS is not set. ' +
        'API calls will fail until you point it at a service account key.',
    )
  }
})
