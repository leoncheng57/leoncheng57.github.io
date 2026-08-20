import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import HourlyCharts from '../components/HourlyCharts'
import StatusBanner from '../components/StatusBanner'
import { useWeatherContext } from '../hooks/WeatherContext'
import {
  aqiCategory,
  formatHourLabel,
  formatUpdatedTime,
  nycNowHour,
  weatherCodeInfo,
} from '../utils/format'
import styles from '../weather.module.css'

/** Hours shown ahead of now on the landing page. */
const WINDOW_HOURS = 24

function rainSummary(
  hours: { time: string; precipProb: number | null }[],
): string | null {
  const firstWet = hours.findIndex(
    (hour) => hour.precipProb !== null && hour.precipProb >= 40,
  )
  if (firstWet === -1) return null
  let lastWet = firstWet
  for (let index = firstWet; index < hours.length; index += 1) {
    const chance = hours[index].precipProb
    if (chance !== null && chance >= 40) lastWet = index
  }
  const start = formatHourLabel(hours[firstWet].time)
  const end = formatHourLabel(hours[lastWet].time)
  return start === end
    ? `Rain likely around ${start}. Bring an umbrella.`
    : `Rain likely ${start}–${end}. Bring an umbrella.`
}

/**
 * Landing page: a rolling window starting at the current hour, so the app
 * opens on what is happening now rather than on a calendar day that may be
 * nearly over. Calendar days stay available at /weather/day/:date.
 */
export default function HourlyRoute(): ReactElement {
  const { status, data } = useWeatherContext()

  if (!data) {
    return (
      <main className={styles.main}>
        {status === 'loading' ? (
          <p className={styles.loading} role="status">
            Loading NYC weather…
          </p>
        ) : (
          <StatusBanner />
        )}
      </main>
    )
  }

  const { current } = data
  const condition = weatherCodeInfo(current.weatherCode)
  const aqi = current.usAqi

  const nowHour = nycNowHour()
  // Fall back to the start of the payload if "now" is missing (stale cache).
  const startIndex = Math.max(
    data.hourly.findIndex((hour) => hour.time >= nowHour),
    0,
  )
  const hours = data.hourly.slice(startIndex, startIndex + WINDOW_HOURS)
  const nowIndex = hours.findIndex((hour) => hour.time === nowHour)
  const summary = rainSummary(hours)

  return (
    <main className={styles.main}>
      <StatusBanner />

      <section className={styles.current} aria-label="Current conditions">
        <p className={styles.currentTemp}>
          {Math.round(current.temp)}°F{' '}
          <span className={styles.currentCondition}>
            {condition.emoji} {condition.label}
          </span>
        </p>
        {aqi !== null ? (
          <p className={styles.currentAqi}>
            AQI {Math.round(aqi)} ·{' '}
            <span className={styles[aqiCategory(aqi).tone]}>
              {aqiCategory(aqi).label}
            </span>
          </p>
        ) : null}
        <p className={styles.updatedAt}>
          Updated {formatUpdatedTime(data.fetchedAt)}
        </p>
      </section>

      {hours.length > 0 ? (
        <>
          <h1 className={styles.pageTitle}>Next 24 hours</h1>
          <HourlyCharts
            hours={hours}
            nowIndex={nowIndex}
            rangeLabel="the next 24 hours"
            withDayInLabels
          />
          {summary ? <p className={styles.tip}>💡 {summary}</p> : null}
        </>
      ) : (
        <p>Hourly data is unavailable right now.</p>
      )}

      <p className={styles.windowNote}>
        <Link to="/weather/trends">See 14-day trends →</Link>
      </p>
    </main>
  )
}
