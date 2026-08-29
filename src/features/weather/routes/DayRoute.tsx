import type { ReactElement } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import HourlyCharts from '../components/HourlyCharts'
import StatusBanner from '../components/StatusBanner'
import { useWeatherContext } from '../hooks/WeatherContext'
import {
  addDays,
  formatDayLong,
  formatHourLabel,
  isValidIsoDate,
  nycNowHour,
  nycToday,
  weatherCodeInfo,
} from '../utils/format'
import styles from '../weather.module.css'

function rainSummary(hours: { time: string; precipProb: number | null }[]): string | null {
  const wetHours = hours.filter(
    (hour) => hour.precipProb !== null && hour.precipProb >= 40,
  )
  if (wetHours.length === 0) return null
  const start = formatHourLabel(wetHours[0].time)
  const end = formatHourLabel(wetHours[wetHours.length - 1].time)
  return start === end
    ? `Rain likely around ${start}. Bring an umbrella.`
    : `Rain likely ${start}–${end}. Bring an umbrella.`
}

export default function DayRoute(): ReactElement {
  const { date } = useParams<{ date: string }>()
  const { status, data } = useWeatherContext()
  const navigate = useNavigate()

  if (!date || !isValidIsoDate(date)) {
    return <Navigate to="/weather/" replace />
  }

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

  const day = data.daily.find((entry) => entry.date === date)
  if (!day) {
    return (
      <main className={styles.main}>
        <p className={styles.pageTitle}>
          <Link to="/weather/">← Back</Link>
        </p>
        <p>No data for {date}. It may be outside the 14-day window.</p>
      </main>
    )
  }

  const hours = data.hourly.filter((hour) => hour.time.startsWith(date))
  const today = nycToday()
  const isToday = date === today
  const nowHour = nycNowHour()
  const nowHourIndex = isToday
    ? hours.findIndex((hour) => hour.time === nowHour)
    : -1

  const condition = weatherCodeInfo(day.weatherCode)
  const summary = rainSummary(hours)

  const previousDate = addDays(date, -1)
  const nextDate = addDays(date, 1)
  const hasPrevious = data.daily.some((entry) => entry.date === previousDate)
  const hasNext = data.daily.some((entry) => entry.date === nextDate)

  return (
    <main className={styles.main}>
      <StatusBanner />
      <p className={styles.backLink}>
        <Link to="/weather/weekly">← Weekly</Link>
      </p>

      <div className={styles.dayPager}>
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => navigate(`/weather/day/${previousDate}`)}
          aria-label="Previous day"
        >
          ◀
        </button>
        <h1 className={styles.pageTitle}>
          {isToday ? `Today, ${formatDayLong(date)}` : formatDayLong(date)}
        </h1>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => navigate(`/weather/day/${nextDate}`)}
          aria-label="Next day"
        >
          ▶
        </button>
      </div>

      <section className={styles.current} aria-label="Day summary">
        <p className={styles.currentTemp}>
          H {day.tempMax !== null ? Math.round(day.tempMax) : '–'}° · L{' '}
          {day.tempMin !== null ? Math.round(day.tempMin) : '–'}°{' '}
          <span className={styles.currentCondition}>
            {condition.emoji} {condition.label}
          </span>
        </p>
        <p className={styles.currentAqi}>
          Rain{' '}
          {day.precipProbMax !== null ? `${Math.round(day.precipProbMax)}%` : '–'}
          {day.aqiMax !== null ? ` · AQI ${Math.round(day.aqiMax)}` : ''}
        </p>
      </section>

      {hours.length > 0 ? (
        <>
          <HourlyCharts
            hours={hours}
            nowIndex={nowHourIndex}
            rangeLabel={formatDayLong(date)}
          />
          {summary ? <p className={styles.tip}>💡 {summary}</p> : null}
        </>
      ) : (
        <p>Hourly detail is only available within the 14-day window.</p>
      )}
    </main>
  )
}
