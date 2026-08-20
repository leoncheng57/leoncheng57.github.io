import type { ReactElement } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import LineChart from '../components/LineChart'
import StatusBanner from '../components/StatusBanner'
import { useWeatherContext } from '../hooks/WeatherContext'
import {
  addDays,
  formatDayLong,
  formatHourLabel,
  isValidIsoDate,
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
  const nowHourIndex = isToday
    ? hours.findIndex(
        (hour) => hour.time === `${date}T${String(new Date().getHours()).padStart(2, '0')}:00`,
      )
    : -1

  const hourLabels = hours.map((hour, index) =>
    index % 4 === 0 ? formatHourLabel(hour.time) : '',
  )
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
        <Link to="/weather/">← Back</Link>
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
          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Temperature (°F)</h2>
            <LineChart
              ariaLabel={`Hourly temperature for ${formatDayLong(date)}`}
              labels={hourLabels}
              markerIndex={nowHourIndex >= 0 ? nowHourIndex : undefined}
              markerLabel={nowHourIndex >= 0 ? 'Now' : undefined}
              series={[
                {
                  id: 'temp',
                  values: hours.map((hour) => hour.temp),
                  className: styles.seriesHigh,
                },
              ]}
            />
          </section>

          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Precipitation Chance (%)</h2>
            <LineChart
              ariaLabel={`Hourly precipitation chance for ${formatDayLong(date)}`}
              labels={hourLabels}
              markerIndex={nowHourIndex >= 0 ? nowHourIndex : undefined}
              markerLabel={nowHourIndex >= 0 ? 'Now' : undefined}
              yMin={0}
              yMax={100}
              series={[
                {
                  id: 'precip',
                  values: hours.map((hour) => hour.precipProb),
                  className: styles.seriesPrecip,
                },
              ]}
            />
          </section>

          {summary ? <p className={styles.tip}>💡 {summary}</p> : null}
        </>
      ) : (
        <p>Hourly detail is only available within the 14-day window.</p>
      )}
    </main>
  )
}
