import { useCallback, useEffect, useRef, useState } from 'react'
import {
  airQualityUrl,
  forecastUrl,
  parseWeather,
  type ForecastResponse,
  type AirQualityResponse,
} from '../data/openMeteo'
import type { WeatherData } from '../types'

const CACHE_KEY = 'nyc-weather-data-v1'

export type WeatherStatus = 'loading' | 'ready' | 'error'

export type WeatherState = {
  status: WeatherStatus
  /**
   * Latest known payload. Populated from the localStorage cache immediately,
   * so the app still renders charts offline; `status === 'error'` with data
   * present means the charts are stale.
   */
  data: WeatherData | null
  refresh: () => void
}

function readCache(): WeatherData | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WeatherData
    if (!Array.isArray(parsed.daily) || !Array.isArray(parsed.hourly)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeCache(data: WeatherData): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // Cache is best-effort; the app works without it.
  }
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`)
  }
  return (await response.json()) as T
}

/**
 * 14-day NYC weather (7 past + 7 forecast) from the Open-Meteo forecast and
 * air-quality APIs. The last successful payload is cached in localStorage so
 * the installed PWA can show (stale) charts while offline.
 */
export default function useWeather(): WeatherState {
  const [status, setStatus] = useState<WeatherStatus>('loading')
  const [data, setData] = useState<WeatherData | null>(readCache)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')

    try {
      const [forecast, airQuality] = await Promise.all([
        fetchJson<ForecastResponse>(forecastUrl(), controller.signal),
        fetchJson<AirQualityResponse>(airQualityUrl(), controller.signal),
      ])
      if (controller.signal.aborted) return
      const next = parseWeather(forecast, airQuality, Date.now())
      setData(next)
      writeCache(next)
      setStatus('ready')
    } catch {
      if (controller.signal.aborted) return
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
    return () => abortRef.current?.abort()
  }, [load])

  const refresh = useCallback(() => {
    void load()
  }, [load])

  return { status, data, refresh }
}
