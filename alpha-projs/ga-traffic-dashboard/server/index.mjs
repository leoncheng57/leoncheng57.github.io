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

const client = new BetaAnalyticsDataClient()

// ---------------------------------------------------------------------------
// Shared helpers

const DATE_RE = /^(\d{4}-\d{2}-\d{2}|\d+daysAgo|today|yesterday)$/

function parseRange(url) {
  const start = url.searchParams.get('start') ?? '90daysAgo'
  const end = url.searchParams.get('end') ?? 'today'
  if (!DATE_RE.test(start) || !DATE_RE.test(end)) {
    throw Object.assign(
      new Error('start/end must be YYYY-MM-DD, NdaysAgo, today, or yesterday'),
      { statusCode: 400 },
    )
  }
  const granularity =
    url.searchParams.get('granularity') === 'week' ? 'week' : 'day'
  return { start, end, granularity }
}

const cache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

async function cached(key, fn) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value
  const value = await fn()
  cache.set(key, { at: Date.now(), value })
  return value
}

async function runReport(request) {
  const [response] = await client.runReport({
    property: `properties/${PROPERTY_ID}`,
    limit: 250000,
    ...request,
  })
  return response
}

const dim = (name) => ({ name })
const met = (name) => ({ name })
const num = (value) => Number(value ?? 0)

// ---------------------------------------------------------------------------
// Endpoint implementations

// Charts 1-5: per-date, per-path rows carrying all three volume metrics.
async function getTraffic({ start, end, granularity }) {
  const dateDimension = granularity === 'week' ? 'yearWeek' : 'date'
  const response = await runReport({
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: [dim(dateDimension), dim('pagePath')],
    metrics: [met('screenPageViews'), met('activeUsers'), met('sessions')],
  })
  return {
    granularity,
    rows: (response.rows ?? []).map((row) => ({
      date: row.dimensionValues[0].value,
      pagePath: row.dimensionValues[1].value,
      screenPageViews: num(row.metricValues[0].value),
      activeUsers: num(row.metricValues[1].value),
      sessions: num(row.metricValues[2].value),
    })),
  }
}

// KPI cards: totals for the requested range and the previous equal-length
// period, in one request (GA4 supports two dateRanges per call).
async function getSummary({ start, end }) {
  const response = await runReport({
    dateRanges: [
      { startDate: start, endDate: end, name: 'current' },
      // GA4 has no relative "previous period" syntax, so the client sends
      // explicit YYYY-MM-DD for both ranges when it wants deltas.
    ],
    dimensions: [],
    metrics: [met('screenPageViews'), met('activeUsers'), met('sessions')],
  })
  const row = response.rows?.[0]
  return {
    screenPageViews: num(row?.metricValues[0]?.value),
    activeUsers: num(row?.metricValues[1]?.value),
    sessions: num(row?.metricValues[2]?.value),
  }
}

// Table 6 + chart 8: per-page volume and engagement time.
async function getPages({ start, end }) {
  const response = await runReport({
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: [dim('pagePath')],
    metrics: [
      met('screenPageViews'),
      met('activeUsers'),
      met('userEngagementDuration'),
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 250,
  })
  return {
    rows: (response.rows ?? []).map((row) => ({
      pagePath: row.dimensionValues[0].value,
      screenPageViews: num(row.metricValues[0].value),
      activeUsers: num(row.metricValues[1].value),
      engagementSeconds: num(row.metricValues[2].value),
    })),
  }
}

// Section 7: bounce/engagement rate per date+path so the client can group
// into apps. Section 9: browser breakdown for the automation diagnostic.
async function getQuality({ start, end, granularity }) {
  const dateDimension = granularity === 'week' ? 'yearWeek' : 'date'
  const [rates, browsers] = await Promise.all([
    runReport({
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [dim(dateDimension), dim('pagePath')],
      metrics: [met('bounceRate'), met('engagementRate'), met('sessions')],
    }),
    runReport({
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [dim('browser')],
      metrics: [
        met('sessions'),
        met('activeUsers'),
        met('userEngagementDuration'),
        met('screenPageViews'),
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50,
    }),
  ])
  return {
    granularity,
    rates: (rates.rows ?? []).map((row) => ({
      date: row.dimensionValues[0].value,
      pagePath: row.dimensionValues[1].value,
      bounceRate: Number(row.metricValues[0].value ?? 0),
      engagementRate: Number(row.metricValues[1].value ?? 0),
      sessions: num(row.metricValues[2].value),
    })),
    browsers: (browsers.rows ?? []).map((row) => ({
      browser: row.dimensionValues[0].value,
      sessions: num(row.metricValues[0].value),
      activeUsers: num(row.metricValues[1].value),
      engagementSeconds: num(row.metricValues[2].value),
      screenPageViews: num(row.metricValues[3].value),
    })),
  }
}

// ---------------------------------------------------------------------------
// HTTP server

const ROUTES = {
  '/api/traffic': getTraffic,
  '/api/summary': getSummary,
  '/api/pages': getPages,
  '/api/quality': getQuality,
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const handler = ROUTES[url.pathname]

  if (!handler) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }

  try {
    const params = parseRange(url)
    const key = `${url.pathname}?start=${params.start}&end=${params.end}&g=${params.granularity}`
    const body = await cached(key, () => handler(params))
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(body))
  } catch (error) {
    console.error(error)
    res.writeHead(error.statusCode ?? 500, {
      'content-type': 'application/json',
    })
    res.end(JSON.stringify({ error: String(error.message ?? error) }))
  }
})

server.listen(PORT, () => {
  console.log(`GA proxy listening on http://localhost:${PORT}`)
})
