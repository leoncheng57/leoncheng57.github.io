import type {
  PageRow,
  QualityResponse,
  SummaryResponse,
  TrafficResponse,
  TrafficRow,
} from './api'
import { fromIso, rangeLengthDays, type DateRange } from './dates'

/**
 * Deterministic fake data for demo mode (`?demo`). Numbers are generated,
 * not real: the demo exists so the UI can be previewed and screenshotted
 * without GA credentials and without exposing actual traffic.
 */

// --- deterministic noise ----------------------------------------------------

function hash(text: string): number {
  let value = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

/** Stable pseudo-random in [0, 1) for a given key. */
function noise(key: string): number {
  return (hash(key) % 10_000) / 10_000
}

// --- date buckets -------------------------------------------------------------

function isoWeekKey(date: Date): string {
  // Close-enough week bucketing for fake data; matches GA's YYYYWW shape.
  const start = new Date(date.getFullYear(), 0, 1)
  const week = Math.min(
    52,
    Math.floor((date.getTime() - start.getTime()) / (7 * 86_400_000)) + 1,
  )
  return `${date.getFullYear()}${String(week).padStart(2, '0')}`
}

function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

function buckets(range: DateRange, granularity: 'day' | 'week'): string[] {
  const keys: string[] = []
  const cursor = fromIso(range.start)
  const end = fromIso(range.end)
  const seen = new Set<string>()
  while (cursor <= end) {
    const key = granularity === 'week' ? isoWeekKey(cursor) : dayKey(cursor)
    if (!seen.has(key)) {
      seen.add(key)
      keys.push(key)
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

// --- app profiles -------------------------------------------------------------

type Profile = {
  path: string
  base: number
  growth: number // multiplier from first bucket to last
  spike?: number // 0..1 position of a one-bucket spike
}

const PROFILES: Profile[] = [
  { path: '/', base: 14, growth: 1.4 },
  { path: '/blog', base: 11, growth: 1.2, spike: 0.55 },
  { path: '/sub-wait/', base: 2, growth: 9, spike: 0.92 },
  { path: '/apps', base: 7, growth: 1.3 },
  { path: '/game-nights', base: 4, growth: 1.1, spike: 0.3 },
  { path: '/repo', base: 3, growth: 1.6 },
  { path: '/workout-lab/', base: 3, growth: 1.2, spike: 0.75 },
  { path: '/previews/pr-42/demo', base: 3, growth: 1 },
  { path: '/tuzi', base: 1.5, growth: 1.1 },
]

function viewsFor(profile: Profile, index: number, count: number, key: string): number {
  const progress = count > 1 ? index / (count - 1) : 1
  const trend = 1 + (profile.growth - 1) * progress
  const wobble = 0.5 + noise(`${profile.path}:${key}`)
  let views = profile.base * trend * wobble
  if (profile.spike !== undefined) {
    const distance = Math.abs(progress - profile.spike)
    if (distance < 0.06) views *= 5 - distance * 50
  }
  return Math.max(0, Math.round(views))
}

// --- endpoint fakes -----------------------------------------------------------

export function demoTraffic(
  range: DateRange,
  granularity: 'day' | 'week',
): TrafficResponse {
  const keys = buckets(range, granularity)
  const scale = granularity === 'week' ? 7 : 1
  const rows: TrafficRow[] = []
  keys.forEach((key, index) => {
    for (const profile of PROFILES) {
      const views = viewsFor(profile, index, keys.length, key) * scale
      if (views === 0) continue
      rows.push({
        date: key,
        pagePath: profile.path,
        screenPageViews: views,
        activeUsers: Math.max(1, Math.round(views * 0.36)),
        sessions: Math.max(1, Math.round(views * 0.48)),
      })
    }
  })
  return { granularity, rows }
}

export function demoSummary(range: DateRange): SummaryResponse {
  const { rows } = demoTraffic(range, 'day')
  return rows.reduce(
    (totals, row) => ({
      screenPageViews: totals.screenPageViews + row.screenPageViews,
      activeUsers: totals.activeUsers + row.activeUsers,
      sessions: totals.sessions + row.sessions,
    }),
    { screenPageViews: 0, activeUsers: 0, sessions: 0 },
  )
}

const DEMO_PAGES: { path: string; share: number; engaged: number }[] = [
  { path: '/', share: 0.18, engaged: 8 },
  { path: '/blog/how-i-built-this', share: 0.13, engaged: 145 },
  { path: '/sub-wait/', share: 0.12, engaged: 22 },
  { path: '/blog/notes-on-shipping', share: 0.09, engaged: 130 },
  { path: '/apps', share: 0.08, engaged: 12 },
  { path: '/sub-wait/station/A01', share: 0.07, engaged: 35 },
  { path: '/game-nights', share: 0.07, engaged: 48 },
  { path: '/repo', share: 0.05, engaged: 15 },
  { path: '/workout-lab/', share: 0.05, engaged: 28 },
  { path: '/workout-lab/exercises', share: 0.04, engaged: 61 },
  { path: '/blog/a-third-article', share: 0.04, engaged: 96 },
  { path: '/previews/pr-42/demo', share: 0.03, engaged: 2 },
  { path: '/tuzi', share: 0.03, engaged: 40 },
  { path: '/repo/alpha-projs', share: 0.02, engaged: 19 },
]

export function demoPages(range: DateRange): { rows: PageRow[] } {
  const total = demoSummary(range).screenPageViews
  return {
    rows: DEMO_PAGES.map((page) => {
      const views = Math.max(1, Math.round(total * page.share))
      return {
        pagePath: page.path,
        screenPageViews: views,
        activeUsers: Math.max(1, Math.round(views * 0.36)),
        engagementSeconds: views * page.engaged,
      }
    }),
  }
}

export function demoQuality(
  range: DateRange,
  granularity: 'day' | 'week',
): QualityResponse {
  const keys = buckets(range, granularity)
  const rates = keys.flatMap((key, index) =>
    PROFILES.map((profile) => {
      const engagement =
        0.35 + 0.4 * noise(`rate:${profile.path}:${key}`) +
        (profile.path.startsWith('/blog') ? 0.15 : 0)
      const clamped = Math.min(0.92, engagement)
      return {
        date: key,
        pagePath: profile.path,
        engagementRate: clamped,
        bounceRate: 1 - clamped,
        sessions: Math.max(
          1,
          Math.round(viewsFor(profile, index, keys.length, key) * 0.48),
        ),
      }
    }),
  )

  const sessions = demoSummary(range).sessions
  const browsers = [
    { browser: 'Chrome', share: 0.42, engaged: 34 },
    { browser: 'Safari', share: 0.31, engaged: 21 },
    { browser: 'Firefox', share: 0.09, engaged: 27 },
    { browser: 'Edge', share: 0.05, engaged: 18 },
    { browser: 'Samsung Internet', share: 0.03, engaged: 12 },
    { browser: 'HeadlessChrome', share: 0.08, engaged: 0 },
    { browser: 'Mozilla Compatible Agent', share: 0.02, engaged: 0 },
  ].map(({ browser, share, engaged }) => {
    const browserSessions = Math.max(1, Math.round(sessions * share))
    const views = Math.round(browserSessions * 2.1)
    return {
      browser,
      sessions: browserSessions,
      activeUsers: Math.max(1, Math.round(browserSessions * 0.8)),
      screenPageViews: views,
      engagementSeconds: views * engaged,
    }
  })

  return { granularity, rates, browsers }
}
