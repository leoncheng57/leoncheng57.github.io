import type { DateRange } from './dates'

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

export function fetchTraffic(
  range: DateRange,
  granularity: 'day' | 'week',
  signal: AbortSignal,
): Promise<TrafficResponse> {
  return getJson('/api/traffic', { ...range, granularity }, signal)
}

export function fetchSummary(
  range: DateRange,
  signal: AbortSignal,
): Promise<SummaryResponse> {
  return getJson('/api/summary', { ...range }, signal)
}

export function fetchPages(
  range: DateRange,
  signal: AbortSignal,
): Promise<{ rows: PageRow[] }> {
  return getJson('/api/pages', { ...range }, signal)
}

export function fetchQuality(
  range: DateRange,
  granularity: 'day' | 'week',
  signal: AbortSignal,
): Promise<QualityResponse> {
  return getJson('/api/quality', { ...range, granularity }, signal)
}
