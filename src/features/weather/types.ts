/** One calendar day in the 14-day window (7 past + 7 forecast). */
export type DailyPoint = {
  /** ISO date in America/New_York, e.g. "2026-08-20". */
  date: string
  tempMax: number | null
  tempMin: number | null
  /** Highest hourly precipitation probability for the day, 0-100. */
  precipProbMax: number | null
  /** Total precipitation in inches. */
  precipSum: number | null
  /** WMO weather interpretation code. */
  weatherCode: number | null
  /** Highest hourly US AQI for the day. */
  aqiMax: number | null
}

/** One hour of data, used by the day detail page. */
export type HourlyPoint = {
  /** ISO local time in America/New_York, e.g. "2026-08-20T14:00". */
  time: string
  temp: number | null
  /** Precipitation probability, 0-100. */
  precipProb: number | null
  /** Precipitation amount in inches. */
  precipitation: number | null
  usAqi: number | null
}

export type CurrentConditions = {
  temp: number
  weatherCode: number
  isDay: boolean
  usAqi: number | null
}

export type WeatherData = {
  /** Epoch ms when this payload was fetched. */
  fetchedAt: number
  current: CurrentConditions
  daily: DailyPoint[]
  hourly: HourlyPoint[]
}

export type WeatherAlert = {
  id: string
  event: string
  headline: string | null
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'
  /** ISO timestamp when the alert ends, if provided. */
  ends: string | null
  description: string
  instruction: string | null
}
