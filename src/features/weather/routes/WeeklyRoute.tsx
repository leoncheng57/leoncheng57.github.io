import { useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import LineChart from '../components/LineChart'
import StatusBanner from '../components/StatusBanner'
import { useWeatherContext } from '../hooks/WeatherContext'
import {
  aqiCategory,
  formatDayLong,
  formatDayOfMonth,
  formatUpdatedTime,
  nycToday,
  weatherCodeInfo,
} from '../utils/format'
import styles from '../weather.module.css'

const AQI_BANDS = [
  { from: 0, to: 50, className: styles.bandGood },
  { from: 50, to: 100, className: styles.bandModerate },
  { from: 100, to: 150, className: styles.bandSensitive },
  { from: 150, to: 200, className: styles.bandUnhealthy },
]

/**
 * Weekly: the daily high/low, rain and AQI charts over 7 past and 7 forecast
 * days. Tapping a day opens its hourly detail.
 */
export default function WeeklyRoute(): ReactElement {
  const { status, data } = useWeatherContext()
  const navigate = useNavigate()
  const [scrubIndex, setScrubIndex] = useState<number | null>(null)

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

  const { daily, current } = data
  const today = nycToday()
  const todayIndex = daily.findIndex((day) => day.date === today)
  // Data arrives after the first render, so the default resolves here rather
  // than in useState: the scrubber rests on today until the reader moves it.
  const activeScrub =
    scrubIndex ?? (todayIndex >= 0 ? todayIndex : 0)
  const condition = weatherCodeInfo(current.weatherCode)
  const aqi = current.usAqi

  const labels = daily.map((day, index) =>
    index % 2 === 0 ? formatDayOfMonth(day.date) : '',
  )
  const selectLabels = daily.map(
    (day) => `View hourly details for ${formatDayLong(day.date)}`,
  )
  const openDay = (index: number) => {
    const day = daily[index]
    if (day) navigate(`/weather/day/${day.date}`)
  }

  const scrubDay = (index: number): string => {
    const day = daily[index]
    return day ? formatDayLong(day.date) : ''
  }
  const tempScrubText = (index: number): string => {
    const day = daily[index]
    if (!day) return ''
    const high = day.tempMax !== null ? `${Math.round(day.tempMax)}°` : '–'
    const low = day.tempMin !== null ? `${Math.round(day.tempMin)}°` : '–'
    return `${scrubDay(index)} · H ${high} L ${low}`
  }
  const precipScrubText = (index: number): string => {
    const day = daily[index]
    if (!day) return ''
    const chance =
      day.precipProbMax !== null ? `${Math.round(day.precipProbMax)}%` : '–'
    const amount =
      day.precipSum !== null && day.precipSum > 0
        ? ` · ${day.precipSum.toFixed(2)}"`
        : ''
    return `${scrubDay(index)} · ${chance} rain${amount}`
  }
  const aqiScrubText = (index: number): string => {
    const day = daily[index]
    if (!day) return ''
    const aqiValue = day.aqiMax !== null ? Math.round(day.aqiMax) : null
    return aqiValue !== null
      ? `${scrubDay(index)} · AQI ${aqiValue}`
      : scrubDay(index)
  }

  return (
    <main className={styles.main}>
      <StatusBanner />

      <h1 className={styles.pageTitle}>Weekly</h1>
      <section className={styles.current} aria-label="Current conditions">
        <p className={styles.currentAqi}>
          Now {Math.round(current.temp)}°F · {condition.emoji}{' '}
          {condition.label}
          {aqi !== null ? (
            <>
              {' · AQI '}
              {Math.round(aqi)}{' '}
              <span className={styles[aqiCategory(aqi).tone]}>
                {aqiCategory(aqi).label}
              </span>
            </>
          ) : null}
        </p>
        <p className={styles.updatedAt}>
          Updated {formatUpdatedTime(data.fetchedAt)}
        </p>
      </section>


      <section className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Temperature (°F)</h2>
        <LineChart
          ariaLabel="Daily high and low temperature, past 7 days and next 7 days"
          labels={labels}
          markerIndex={todayIndex}
          markerLabel="Today"
          series={[
            {
              id: 'high',
              values: daily.map((day) => day.tempMax),
              className: styles.seriesHigh,
            },
            {
              id: 'low',
              values: daily.map((day) => day.tempMin),
              className: styles.seriesLow,
            },
          ]}
          onSelectIndex={openDay}
          selectLabels={selectLabels}
          scrubIndex={activeScrub}
          onScrubIndex={setScrubIndex}
          scrubAriaLabel="Scrub through days on the temperature chart"
          scrubValueText={tempScrubText}
        />
        <p className={styles.chartLegend}>
          <span className={styles.legendHigh}>high</span> ·{' '}
          <span className={styles.legendLow}>low</span> · tap a day for hourly
        </p>
      </section>

      <section className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Precipitation (%)</h2>
        <LineChart
          ariaLabel="Daily precipitation chance, past 7 days and next 7 days"
          labels={labels}
          markerIndex={todayIndex}
          markerLabel="Today"
          yMin={0}
          yMax={100}
          series={[
            {
              id: 'precip',
              values: daily.map((day) => day.precipProbMax),
              className: styles.seriesPrecip,
            },
          ]}
          bars={{
            values: daily.map((day) => day.precipSum),
            max: 1.5,
            label: (value) => `${value.toFixed(2)}"`,
          }}
          onSelectIndex={openDay}
          selectLabels={selectLabels}
          scrubIndex={activeScrub}
          onScrubIndex={setScrubIndex}
          scrubAriaLabel="Scrub through days on the precipitation chart"
          scrubValueText={precipScrubText}
        />
        <p className={styles.chartLegend}>
          line shows chance · <span className={styles.legendBar}>bars</span>{' '}
          show rain amount (inches, right axis)
        </p>
      </section>

      <section className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Air Quality (US AQI)</h2>
        <LineChart
          ariaLabel="Daily peak air quality index, past 7 days and next 7 days"
          labels={labels}
          markerIndex={todayIndex}
          markerLabel="Today"
          yMin={0}
          yMax={150}
          bands={AQI_BANDS}
          series={[
            {
              id: 'aqi',
              values: daily.map((day) => day.aqiMax),
              className: styles.seriesAqi,
            },
          ]}
          onSelectIndex={openDay}
          selectLabels={selectLabels}
          scrubIndex={activeScrub}
          onScrubIndex={setScrubIndex}
          scrubAriaLabel="Scrub through days on the air quality chart"
          scrubValueText={aqiScrubText}
        />
        <p className={styles.chartLegend}>
          <span className={styles.good}>good</span> ·{' '}
          <span className={styles.moderate}>moderate</span> ·{' '}
          <span className={styles.sensitive}>sensitive</span>
        </p>
      </section>

      <p className={styles.windowNote}>← past 7 days · next 7 days →</p>
    </main>
  )
}
