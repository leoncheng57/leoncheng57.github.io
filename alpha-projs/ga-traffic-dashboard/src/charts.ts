import type { TrafficRow } from './api'
import { groupForPath } from './appGroups'
import { formatDateLabel } from './dates'

export type ChartRow = Record<string, number | string>

export type GroupedSeries = {
  chartData: ChartRow[]
  groupNames: string[]
  totals: Map<string, number>
}

/**
 * Pivot per-path rows into one chart row per date with a numeric column per
 * app group, for a single metric.
 */
export function groupByApp(
  rows: TrafficRow[],
  metric: 'screenPageViews' | 'activeUsers' | 'sessions',
  granularity: 'day' | 'week',
): GroupedSeries {
  const byDate = new Map<string, ChartRow>()
  const totals = new Map<string, number>()

  for (const row of rows) {
    const group = groupForPath(row.pagePath)
    const value = row[metric]
    totals.set(group, (totals.get(group) ?? 0) + value)
    let bucket = byDate.get(row.date)
    if (!bucket) {
      bucket = { date: formatDateLabel(row.date, granularity) }
      byDate.set(row.date, bucket)
    }
    bucket[group] = ((bucket[group] as number) ?? 0) + value
  }

  const groupNames = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  const chartData = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, bucket]) => bucket)

  return { chartData, groupNames, totals }
}

/** Convert absolute values into per-date percentage shares (0-100). */
export function toShare(series: GroupedSeries): ChartRow[] {
  return series.chartData.map((row) => {
    const total = series.groupNames.reduce(
      (sum, name) => sum + ((row[name] as number) ?? 0),
      0,
    )
    const out: ChartRow = { date: row.date }
    for (const name of series.groupNames) {
      out[name] = total > 0 ? (((row[name] as number) ?? 0) / total) * 100 : 0
    }
    return out
  })
}

export function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60)
  const seconds = Math.round(total % 60)
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}
