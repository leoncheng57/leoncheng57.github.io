import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import StatusBanner from '../components/StatusBanner'
import { useWeatherContext } from '../hooks/WeatherContext'
import type { DailyPoint } from '../types'
import {
  aqiCategory,
  formatDayLong,
  nycToday,
  weatherCodeInfo,
} from '../utils/format'
import styles from '../weather.module.css'

function DayRow({
  day,
  isToday,
}: {
  day: DailyPoint
  isToday: boolean
}): ReactElement {
  const condition = weatherCodeInfo(day.weatherCode)
  return (
    <Link
      to={`/weather/day/${day.date}`}
      className={styles.weekRow}
      aria-label={`View hourly details for ${formatDayLong(day.date)}`}
    >
      <span className={styles.weekDay}>
        {isToday ? 'Today' : formatDayLong(day.date)}
      </span>
      <span className={styles.weekCondition} aria-hidden="true">
        {condition.emoji}
      </span>
      <span className={styles.weekTemps}>
        {day.tempMax !== null ? `${Math.round(day.tempMax)}°` : '–'}
        {' / '}
        {day.tempMin !== null ? `${Math.round(day.tempMin)}°` : '–'}
      </span>
      <span className={styles.weekPrecip}>
        {day.precipProbMax !== null ? `${Math.round(day.precipProbMax)}%` : '–'}
      </span>
      <span className={styles.weekAqi}>
        {day.aqiMax !== null ? (
          <span className={styles[aqiCategory(day.aqiMax).tone]}>
            {Math.round(day.aqiMax)}
          </span>
        ) : (
          '–'
        )}
      </span>
    </Link>
  )
}

/**
 * Scannable list view of the same 14-day window as the homepage charts:
 * past 7 days for context, next 7 as a classic day-by-day forecast.
 */
export default function WeekRoute(): ReactElement {
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

  const today = nycToday()
  const todayIndex = data.daily.findIndex((day) => day.date === today)
  const pastDays = todayIndex >= 0 ? data.daily.slice(0, todayIndex) : []
  const upcomingDays =
    todayIndex >= 0 ? data.daily.slice(todayIndex) : data.daily

  return (
    <main className={styles.main}>
      <StatusBanner />
      <h1 className={styles.pageTitle}>Week</h1>

      <div className={styles.weekHeader}>
        <span>Day</span>
        <span aria-hidden="true" />
        <span>Hi / Lo</span>
        <span>Rain</span>
        <span>AQI</span>
      </div>

      <section aria-label="Next 7 days">
        <h2 className={styles.weekSectionTitle}>Next 7 days</h2>
        <div className={styles.weekList}>
          {upcomingDays.map((day, index) => (
            <DayRow key={day.date} day={day} isToday={index === 0} />
          ))}
        </div>
      </section>

      {pastDays.length > 0 ? (
        <section aria-label="Past 7 days">
          <h2 className={styles.weekSectionTitle}>Past 7 days</h2>
          <div className={styles.weekList}>
            {pastDays.map((day) => (
              <DayRow key={day.date} day={day} isToday={false} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
