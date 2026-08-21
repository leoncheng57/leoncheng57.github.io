import type { ReactElement } from 'react'
import ChartScrubberTip from '../components/ChartScrubberTip'
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

/** Hours of history shown before now on the landing page. */
const PAST_HOURS = 12
/** Hours of forecast shown after now on the landing page. */
const FUTURE_HOURS = 24

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
 * Landing page: a rolling window centred on the current hour, so the app opens
 * on what just happened and what is coming rather than on a calendar day that
 * may be nearly over. Calendar days stay available at /weather/day/:date.
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
  // The first point at or after now anchors the window. A stale cache whose
  // newest point predates now has no such point, so anchor past the end and
  // let the slice fall back to the most recent hours available.
  const anchor = data.hourly.findIndex((hour) => hour.time >= nowHour)
  const anchorIndex = anchor === -1 ? data.hourly.length : anchor
  const startIndex = Math.max(anchorIndex - PAST_HOURS, 0)
  const hours = data.hourly.slice(startIndex, anchorIndex + FUTURE_HOURS + 1)
  // -1 when the current hour is absent, which suppresses the "Now" marker.
  const nowIndex = hours.findIndex((hour) => hour.time === nowHour)
  // Rain that already ended must not be announced, so scan from now forward.
  const futureStart = hours.findIndex((hour) => hour.time >= nowHour)
  const summary =
    futureStart === -1 ? null : rainSummary(hours.slice(futureStart))
  // Without a current hour, rest the scrubber on the point nearest to now.
  const initialScrubIndex =
    nowIndex >= 0
      ? nowIndex
      : futureStart === -1
        ? Math.max(hours.length - 1, 0)
        : futureStart

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
          <h1 className={styles.pageTitle}>Past 12 hours and next 24 hours</h1>
          <ChartScrubberTip period="hour" />
          <HourlyCharts
            hours={hours}
            nowIndex={nowIndex}
            rangeLabel="the past 12 hours and next 24 hours"
            withDayInLabels
            multiDayAxis
            initialScrubIndex={initialScrubIndex}
          />
          {summary ? <p className={styles.tip}>💡 {summary}</p> : null}
        </>
      ) : (
        <p>Hourly data is unavailable right now.</p>
      )}
    </main>
  )
}
