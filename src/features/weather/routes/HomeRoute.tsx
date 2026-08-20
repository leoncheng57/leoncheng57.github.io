import type { ReactElement } from 'react'
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

export default function HomeRoute(): ReactElement {
  const { status, data } = useWeatherContext()
  const navigate = useNavigate()

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
          bars={{ values: daily.map((day) => day.precipSum), max: 1.5 }}
          onSelectIndex={openDay}
          selectLabels={selectLabels}
        />
        <p className={styles.chartLegend}>bars show rain amount (in)</p>
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
