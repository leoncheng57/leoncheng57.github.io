import { NYC_TIMEZONE } from '../data/openMeteo'

/** Today's ISO date (YYYY-MM-DD) in New York, regardless of device zone. */
export function nycToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: NYC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/**
 * The current hour as an ISO local time in New York, e.g. "2026-08-20T14:00",
 * matching the shape of `HourlyPoint.time`. Device-local `getHours()` would
 * point at the wrong hour for anyone outside Eastern time.
 */
export function nycNowHour(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: NYC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const part = (type: string): string =>
    parts.find((entry) => entry.type === type)?.value ?? '00'
  // Some ICU builds render midnight as hour "24" under hour12: false.
  const hour = part('hour') === '24' ? '00' : part('hour')
  return `${part('year')}-${part('month')}-${part('day')}T${hour}:00`
}

/** Parses an ISO date as noon UTC so day-level formatting never shifts. */
function dateAtNoonUtc(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`)
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return !Number.isNaN(dateAtNoonUtc(value).getTime())
}

/** "Wed, Aug 20" */
export function formatDayLong(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(dateAtNoonUtc(isoDate))
}

/** "Wed" */
export function formatWeekday(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
  }).format(dateAtNoonUtc(isoDate))
}

/** Day-of-month label for chart x-axes, e.g. "20". */
export function formatDayOfMonth(isoDate: string): string {
  return String(Number(isoDate.slice(8, 10)))
}

/** "2 PM" from an Open-Meteo hourly time like "2026-08-20T14:00". */
export function formatHourLabel(isoTime: string): string {
  const hour = Number(isoTime.slice(11, 13))
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

export function addDays(isoDate: string, days: number): string {
  const date = dateAtNoonUtc(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export type AqiCategory = {
  label: string
  /** CSS class suffix, also used for chart band colors. */
  tone: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous'
}

export function aqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return { label: 'Good', tone: 'good' }
  if (aqi <= 100) return { label: 'Moderate', tone: 'moderate' }
  if (aqi <= 150)
    return { label: 'Unhealthy for Sensitive Groups', tone: 'sensitive' }
  if (aqi <= 200) return { label: 'Unhealthy', tone: 'unhealthy' }
  if (aqi <= 300) return { label: 'Very Unhealthy', tone: 'veryUnhealthy' }
  return { label: 'Hazardous', tone: 'hazardous' }
}

/** WMO weather interpretation codes → label + emoji. */
export function weatherCodeInfo(code: number | null): {
  label: string
  emoji: string
} {
  if (code === null) return { label: 'Unknown', emoji: '·' }
  if (code === 0) return { label: 'Clear', emoji: '☀️' }
  if (code === 1) return { label: 'Mostly clear', emoji: '🌤️' }
  if (code === 2) return { label: 'Partly cloudy', emoji: '⛅' }
  if (code === 3) return { label: 'Overcast', emoji: '☁️' }
  if (code === 45 || code === 48) return { label: 'Fog', emoji: '🌫️' }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', emoji: '🌦️' }
  if (code >= 61 && code <= 67) return { label: 'Rain', emoji: '🌧️' }
  if (code >= 71 && code <= 77) return { label: 'Snow', emoji: '🌨️' }
  if (code >= 80 && code <= 82) return { label: 'Rain showers', emoji: '🌧️' }
  if (code === 85 || code === 86) return { label: 'Snow showers', emoji: '🌨️' }
  if (code >= 95) return { label: 'Thunderstorm', emoji: '⛈️' }
  return { label: 'Unknown', emoji: '·' }
}

/** "5:04 PM" in New York time. */
export function formatUpdatedTime(epochMs: number): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: NYC_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(epochMs))
}
