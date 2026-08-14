export type DateRange = { start: string; end: string }

export const EARLIEST_DATA = new Date(2022, 4, 25) // 2022-05-25

export function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export type Preset = { label: string; range: () => DateRange }

export const PRESETS: Preset[] = [
  {
    label: '7 days',
    range: () => ({ start: toIso(daysAgo(6)), end: toIso(new Date()) }),
  },
  {
    label: '30 days',
    range: () => ({ start: toIso(daysAgo(29)), end: toIso(new Date()) }),
  },
  {
    label: '90 days',
    range: () => ({ start: toIso(daysAgo(89)), end: toIso(new Date()) }),
  },
  {
    label: 'This year',
    range: () => ({
      start: toIso(new Date(new Date().getFullYear(), 0, 1)),
      end: toIso(new Date()),
    }),
  },
  {
    label: 'All time',
    range: () => ({ start: toIso(EARLIEST_DATA), end: toIso(new Date()) }),
  },
]

export function rangeLengthDays({ start, end }: DateRange): number {
  const ms = fromIso(end).getTime() - fromIso(start).getTime()
  return Math.round(ms / 86_400_000) + 1
}

/** Daily for short ranges, weekly once daily would be unreadable. */
export function autoGranularity(range: DateRange): 'day' | 'week' {
  return rangeLengthDays(range) > 120 ? 'week' : 'day'
}

/** The equal-length period immediately before `range`, for KPI deltas. */
export function previousPeriod(range: DateRange): DateRange {
  const days = rangeLengthDays(range)
  const prevEnd = fromIso(range.start)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - days + 1)
  return { start: toIso(prevStart), end: toIso(prevEnd) }
}

export function formatDateLabel(
  raw: string,
  granularity: 'day' | 'week',
): string {
  if (granularity === 'week') return `${raw.slice(0, 4)}-W${raw.slice(4)}`
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`
}
