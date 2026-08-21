import { useState, type ReactElement } from 'react'
import type { HourlyPoint } from '../types'
import { formatHourLabel } from '../utils/format'
import styles from '../weather.module.css'
import LineChart from './LineChart'

export type HourlyChartsProps = {
  hours: HourlyPoint[]
  /** Index of the current hour within `hours`, or -1 when it is not present. */
  nowIndex: number
  /** Used in the chart aria-labels, e.g. "Thu, Aug 20" or "the next 24 hours". */
  rangeLabel: string
  /** Shows the date alongside the hour in readouts, for windows spanning midnight. */
  withDayInLabels?: boolean
}

function hourLabel(time: string, withDay: boolean): string {
  const hour = formatHourLabel(time)
  if (!withDay) return hour
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
  }).format(new Date(`${time.slice(0, 10)}T12:00:00Z`))
  return `${weekday} ${hour}`
}

/**
 * The hourly temperature and precipitation pair, shared by the hourly home
 * page (a rolling window from now) and the day detail page (one calendar day).
 * Both charts share a single scrub position.
 */
export default function HourlyCharts({
  hours,
  nowIndex,
  rangeLabel,
  withDayInLabels = false,
}: HourlyChartsProps): ReactElement {
  // Start on the current hour (or the start of the window) so the readout is
  // visible without interaction, then follow wherever the reader drags it.
  const [scrubIndex, setScrubIndex] = useState<number>(
    nowIndex >= 0 ? nowIndex : 0,
  )

  const labels = hours.map((hour, index) =>
    index % 4 === 0 ? formatHourLabel(hour.time) : '',
  )

  const tempScrubText = (index: number): string => {
    const hour = hours[index]
    if (!hour) return ''
    const temp = hour.temp !== null ? `${Math.round(hour.temp)}°` : '–'
    return `${hourLabel(hour.time, withDayInLabels)} · ${temp}`
  }
  const precipScrubText = (index: number): string => {
    const hour = hours[index]
    if (!hour) return ''
    const chance =
      hour.precipProb !== null ? `${Math.round(hour.precipProb)}%` : '–'
    const amount =
      hour.precipitation !== null && hour.precipitation > 0
        ? ` · ${hour.precipitation.toFixed(2)}"`
        : ''
    return `${hourLabel(hour.time, withDayInLabels)} · ${chance} rain${amount}`
  }

  const marker = nowIndex >= 0 ? nowIndex : undefined

  return (
    <>
      <section className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Temperature (°F)</h2>
        <LineChart
          ariaLabel={`Hourly temperature for ${rangeLabel}`}
          labels={labels}
          markerIndex={marker}
          markerLabel={marker !== undefined ? 'Now' : undefined}
          series={[
            {
              id: 'temp',
              values: hours.map((hour) => hour.temp),
              className: styles.seriesHigh,
            },
          ]}
          scrubIndex={scrubIndex}
          onScrubIndex={setScrubIndex}
          scrubAriaLabel="Scrub through hours on the temperature chart"
          scrubValueText={tempScrubText}
        />
        <p className={styles.chartLegend}>drag to scrub through hours</p>
      </section>

      <section className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Precipitation Chance (%)</h2>
        <LineChart
          ariaLabel={`Hourly precipitation chance for ${rangeLabel}`}
          labels={labels}
          markerIndex={marker}
          markerLabel={marker !== undefined ? 'Now' : undefined}
          yMin={0}
          yMax={100}
          series={[
            {
              id: 'precip',
              values: hours.map((hour) => hour.precipProb),
              className: styles.seriesPrecip,
            },
          ]}
          bars={{
            values: hours.map((hour) => hour.precipitation),
            max: 0.25,
            label: (value) => `${value.toFixed(2)}"`,
          }}
          scrubIndex={scrubIndex}
          onScrubIndex={setScrubIndex}
          scrubAriaLabel="Scrub through hours on the precipitation chart"
          scrubValueText={precipScrubText}
        />
        <p className={styles.chartLegend}>
          <span className={styles.legendBar}>bars</span> show rain amount
          (inches)
        </p>
      </section>
    </>
  )
}
