import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import HourlyCharts from './components/HourlyCharts'
import { aqiCategory, formatUpdatedTime, nycNowHour, weatherCodeInfo } from './utils/format'
import type { HourlyPoint } from './types'
import styles from './weather.module.css'

type Unit = 'F' | 'C'
type Forecast = {
  current?: { temperature_2m?: number; weather_code?: number; is_day?: number }
  hourly?: { time?: string[]; temperature_2m?: (number | null)[]; precipitation_probability?: (number | null)[]; precipitation?: (number | null)[] }
}
type Reading = { forecast: Forecast; aqi: number | null; updatedAt: number }
const extension = (globalThis as typeof globalThis & { chrome?: { storage?: { local: {
  get: (_key: string) => Promise<Record<string, unknown>>
  set: (_values: Record<string, unknown>) => Promise<void>
} } } }).chrome

async function preference(): Promise<Unit> {
  try {
    const current = await extension?.storage?.local.get('unit')
    const legacy = JSON.parse(localStorage.getItem('pocket-weather') || '{}')
    return (current?.unit ?? legacy.unit) === 'C' ? 'C' : 'F'
  } catch { return 'F' }
}

async function json(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]) })
  if (!response.ok) throw new Error('Request failed')
  return response.json()
}

function App() {
  const [unit, setUnit] = useState<Unit>('F')
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('nyc-weather-theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch { /* Use system preference. */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [reading, setReading] = useState<Reading | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => { preference().then(value => { setUnit(value); setReady(true) }) }, [])
  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem('pocket-weather', JSON.stringify({ unit })) } catch { /* Optional persistence. */ }
    extension?.storage?.local.set({ unit }).catch(() => {})
  }, [unit, ready])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ latitude: '40.7128', longitude: '-74.006', timezone: 'America/New_York',
      current: 'temperature_2m,weather_code,is_day', hourly: 'temperature_2m,precipitation_probability,precipitation',
      precipitation_unit: 'inch', past_days: '1', forecast_days: '2' })
    const air = new URLSearchParams({ latitude: '40.7128', longitude: '-74.006', current: 'us_aqi' })
    Promise.all([
      json(`https://api.open-meteo.com/v1/forecast?${params}`, controller.signal),
      json(`https://air-quality-api.open-meteo.com/v1/air-quality?${air}`, controller.signal).catch(() => null),
    ]).then(([forecast, quality]) => {
      if (controller.signal.aborted) return
      if (!Number.isFinite(forecast.current?.temperature_2m)) throw new Error('Missing temperature')
      const updatedAt = Date.now()
      setReading({ forecast, aqi: Number.isFinite(quality?.current?.us_aqi) ? quality.current.us_aqi : null, updatedAt })
      extension?.storage?.local.set({ toolbarWeather: { celsius: forecast.current.temperature_2m, updatedAt } }).catch(() => {})
    }).catch(() => {
      if (!controller.signal.aborted) setError('Couldn’t update NYC weather. Check your connection and refresh.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])

  const convert = (value: number | null | undefined) => Number.isFinite(value) ? (unit === 'F' ? value! * 9 / 5 + 32 : value!) : null
  const hourly = reading?.forecast.hourly
  const allHours: HourlyPoint[] = (hourly?.time || []).map((time, i) => ({ time,
    temp: convert(hourly?.temperature_2m?.[i]), precipProb: hourly?.precipitation_probability?.[i] ?? null,
    precipitation: hourly?.precipitation?.[i] ?? null, usAqi: null }))
  const now = nycNowHour()
  const anchor = allHours.findIndex(hour => hour.time >= now)
  const anchorIndex = anchor < 0 ? allHours.length : anchor
  const hours = allHours.slice(Math.max(0, anchorIndex - 12), anchorIndex + 25)
  const nowIndex = hours.findIndex(hour => hour.time === now)
  const condition = weatherCodeInfo(reading?.forecast.current?.weather_code ?? null)
  if (reading?.forecast.current?.is_day === 0 && reading?.forecast.current?.weather_code === 0) { condition.label = 'Clear night'; condition.emoji = '🌙' }
  const aqi = reading?.aqi ?? null

  return <div className={styles.page} data-theme={theme}>
    <div className={styles.frame}>
      <header className={styles.masthead}>
        <a className={styles.brand} href="https://leoncheng.dev/weather/" target="_blank" rel="noreferrer"><span className={styles.wordmark}>NYC Weather</span><span className={styles.betaBadge}>BETA</span></a>
        <div className={styles.controls}>
          <button className={styles.control} disabled={!ready} aria-label={`Switch to ${unit === 'F' ? 'Celsius' : 'Fahrenheit'}`} onClick={() => setUnit(unit === 'F' ? 'C' : 'F')}>°{unit}</button>
          <button className={styles.control} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => {
            const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next)
            try { localStorage.setItem('nyc-weather-theme', next) } catch { /* Optional persistence. */ }
          }}>{theme === 'dark' ? '☀' : '☾'}</button>
        </div>
        <nav className={styles.mastheadNav} aria-label="NYC Weather">
          <span className={styles.mastheadLink} aria-current="page">Hourly</span>
          <a className={styles.mastheadLink} href="https://leoncheng.dev/weather/weekly" target="_blank" rel="noreferrer" aria-label="Weekly forecast (opens website)">Weekly ↗</a>
          <a className={styles.mastheadLink} href="https://leoncheng.dev/weather/alerts" target="_blank" rel="noreferrer" aria-label="Weather alerts (opens website)">Alerts ↗</a>
        </nav>
      </header>
      <main className={styles.main}>
        {loading && !reading && <p className={styles.loading} role="status">Loading NYC weather…</p>}
        {error && <div className={styles.staleBanner} role="alert">{error}{reading ? ' Previous forecast is shown.' : ''}</div>}
        {reading && <>
          <section className={styles.current} aria-label="Current conditions">
            <p className={styles.currentTemp}>{Math.round(convert(reading.forecast.current?.temperature_2m)!)}°{unit} <span className={styles.currentCondition}>{condition.emoji} {condition.label}</span></p>
            <p className={styles.currentAqi}>{aqi === null ? 'Air quality unavailable' : <>AQI {Math.round(aqi)} · <span className={styles[aqiCategory(aqi).tone]}>{aqiCategory(aqi).label}</span></>}</p>
            <p className={styles.updatedAt}>Updated {formatUpdatedTime(reading.updatedAt)} ET</p>
          </section>
          {hours.length ? <>
            <h1 className={styles.pageTitle}>Past 12 hours and next 24 hours</h1>
            <HourlyCharts hours={hours} unit={unit} nowIndex={nowIndex} rangeLabel="the past 12 hours and next 24 hours" withDayInLabels multiDayAxis initialScrubIndex={nowIndex < 0 ? 0 : nowIndex} />
          </> : <p>Hourly data is unavailable right now.</p>}
        </>}
        <button className={styles.control} disabled={loading} onClick={() => setRevision(value => value + 1)}>{loading ? 'Updating…' : 'Refresh'}</button>
      </main>
      <footer className={styles.footer}>Weather and air quality by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · <a href="https://leoncheng.dev/weather/" target="_blank" rel="noreferrer">Open NYC Weather</a></footer>
    </div>
  </div>
}

createRoot(document.getElementById('root')!).render(<App />)
