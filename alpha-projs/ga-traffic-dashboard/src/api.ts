import type { DateRange } from './dates'

/**
 * Demo mode (`?demo`): serve deterministic fake data so the UI can be
 * previewed and screenshotted without GA credentials. Real traffic numbers
 * never appear in demo mode.
 */
export function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).has('demo')
}

export type TrafficRow = {
  date: string
  pagePath: string
  screenPageViews: number
  activeUsers: number
  sessions: number
}

export type TrafficResponse = {
  granularity: 'day' | 'week'
  rows: TrafficRow[]
}

export type SummaryResponse = {
  screenPageViews: number
  activeUsers: number
  sessions: number
}

export type PageRow = {
  pagePath: string
  screenPageViews: number
  activeUsers: number
  engagementSeconds: number
}

export type QualityRateRow = {
  date: string
  pagePath: string
  bounceRate: number
  engagementRate: number
  sessions: number
}

export type BrowserRow = {
  browser: string
  sessions: number
  activeUsers: number
  engagementSeconds: number
  screenPageViews: number
}

export type QualityResponse = {
  granularity: 'day' | 'week'
  rates: QualityRateRow[]
  browsers: BrowserRow[]
}

export class ApiUnavailableError extends Error {}

async function getJson<T>(
  path: string,
  params: Record<string, string>,
  signal: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams(params).toString()
  let response: Response
  try {
    response = await fetch(`${path}?${query}`, { signal })
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error
    // Network-level failure: no server listening at all.
    throw new ApiUnavailableError()
  }
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    // Static hosting (e.g. GitHub Pages) answers with an HTML 404 page.
    throw new ApiUnavailableError()
  }
  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? response.statusText)
  return body
}

export async function fetchTraffic(
  range: DateRange,
  granularity: 'day' | 'week',
  signal: AbortSignal,
): Promise<TrafficResponse> {
  if (isDemoMode()) {
    const { demoTraffic } = await import('./demoData')
    return demoTraffic(range, granularity)
  }
  return getJson('/api/traffic', { ...range, granularity }, signal)
}

export async function fetchSummary(
  range: DateRange,
  signal: AbortSignal,
): Promise<SummaryResponse> {
  if (isDemoMode()) {
    const { demoSummary } = await import('./demoData')
    return demoSummary(range)
  }
  return getJson('/api/summary', { ...range }, signal)
}

export async function fetchPages(
  range: DateRange,
  signal: AbortSignal,
): Promise<{ rows: PageRow[] }> {
  if (isDemoMode()) {
    const { demoPages } = await import('./demoData')
    return demoPages(range)
  }
  return getJson('/api/pages', { ...range }, signal)
}

export async function fetchQuality(
  range: DateRange,
  granularity: 'day' | 'week',
  signal: AbortSignal,
): Promise<QualityResponse> {
  if (isDemoMode()) {
    const { demoQuality } = await import('./demoData')
    return demoQuality(range, granularity)
  }
  return getJson('/api/quality', { ...range, granularity }, signal)
}
