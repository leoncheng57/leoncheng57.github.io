import type {
  CurrentConditions,
  DailyPoint,
  HourlyPoint,
  WeatherData,
} from '../types'

/** Lower Manhattan; close enough for a citywide forecast. */
export const NYC = { latitude: 40.7128, longitude: -74.006 }

export const NYC_TIMEZONE = 'America/New_York'

export const PAST_DAYS = 7
export const FORECAST_DAYS = 7

const FORECAST_HOST = 'https://api.open-meteo.com'
const AIR_QUALITY_HOST = 'https://air-quality-api.open-meteo.com'

export function forecastUrl(): string {
  const params = new URLSearchParams({
    latitude: String(NYC.latitude),
    longitude: String(NYC.longitude),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
    ].join(','),
    hourly: ['temperature_2m', 'precipitation_probability', 'precipitation'].join(
      ',',
    ),
    current: ['temperature_2m', 'weather_code', 'is_day'].join(','),
    temperature_unit: 'fahrenheit',
    precipitation_unit: 'inch',
    past_days: String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
    timezone: NYC_TIMEZONE,
  })
  return `${FORECAST_HOST}/v1/forecast?${params.toString()}`
}

export function airQualityUrl(): string {
  const params = new URLSearchParams({
    latitude: String(NYC.latitude),
    longitude: String(NYC.longitude),
    hourly: 'us_aqi',
    current: 'us_aqi',
    past_days: String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
    timezone: NYC_TIMEZONE,
  })
  return `${AIR_QUALITY_HOST}/v1/air-quality?${params.toString()}`
}

export type ForecastResponse = {
  current?: {
    temperature_2m?: number
    weather_code?: number
    is_day?: number
  }
  daily?: {
    time?: string[]
    weather_code?: (number | null)[]
    temperature_2m_max?: (number | null)[]
    temperature_2m_min?: (number | null)[]
    precipitation_probability_max?: (number | null)[]
    precipitation_sum?: (number | null)[]
  }
  hourly?: {
    time?: string[]
    temperature_2m?: (number | null)[]
    precipitation_probability?: (number | null)[]
    precipitation?: (number | null)[]
  }
}

export type AirQualityResponse = {
  current?: { us_aqi?: number | null }
  hourly?: {
    time?: string[]
    us_aqi?: (number | null)[]
  }
}

function at<T>(values: (T | null)[] | undefined, index: number): T | null {
  const value = values?.[index]
  return value ?? null
}

/**
 * Merges the forecast and air-quality responses into one normalized payload.
 * AQI arrives hourly only, so the daily AQI is the max of that day's hours.
 */
export function parseWeather(
  forecast: ForecastResponse,
  airQuality: AirQualityResponse,
  fetchedAt: number,
): WeatherData {
  const aqiByHour = new Map<string, number>()
  const aqTimes = airQuality.hourly?.time ?? []
  const aqValues = airQuality.hourly?.us_aqi ?? []
  aqTimes.forEach((time, index) => {
    const value = aqValues[index]
    if (typeof value === 'number') aqiByHour.set(time, value)
  })

  const aqiMaxByDate = new Map<string, number>()
  aqiByHour.forEach((value, time) => {
    const date = time.slice(0, 10)
    const max = aqiMaxByDate.get(date)
    if (max === undefined || value > max) aqiMaxByDate.set(date, value)
  })

  const daily: DailyPoint[] = (forecast.daily?.time ?? []).map(
    (date, index) => ({
      date,
      tempMax: at(forecast.daily?.temperature_2m_max, index),
      tempMin: at(forecast.daily?.temperature_2m_min, index),
      precipProbMax: at(forecast.daily?.precipitation_probability_max, index),
      precipSum: at(forecast.daily?.precipitation_sum, index),
      weatherCode: at(forecast.daily?.weather_code, index),
      aqiMax: aqiMaxByDate.get(date) ?? null,
    }),
  )

  const hourly: HourlyPoint[] = (forecast.hourly?.time ?? []).map(
    (time, index) => ({
      time,
      temp: at(forecast.hourly?.temperature_2m, index),
      precipProb: at(forecast.hourly?.precipitation_probability, index),
      precipitation: at(forecast.hourly?.precipitation, index),
      usAqi: aqiByHour.get(time) ?? null,
    }),
  )

  const current: CurrentConditions = {
    temp: forecast.current?.temperature_2m ?? 0,
    weatherCode: forecast.current?.weather_code ?? 0,
    isDay: forecast.current?.is_day !== 0,
    usAqi: airQuality.current?.us_aqi ?? null,
  }

  return { fetchedAt, current, daily, hourly }
}
