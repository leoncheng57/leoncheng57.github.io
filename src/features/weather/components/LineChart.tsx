import type { ReactElement } from 'react'
import styles from '../weather.module.css'

export type ChartSeries = {
  id: string
  values: (number | null)[]
  /** CSS module class applied to the series paths (stroke color). */
  className?: string
}

export type ChartBand = {
  from: number
  to: number
  className: string
}

export type ChartBars = {
  values: (number | null)[]
  /** Value that fills the plot height; defaults to the largest bar. */
  max?: number
}

type LineChartProps = {
  /** X-axis tick labels, one per index; use '' to skip a tick. */
  labels: string[]
  series: ChartSeries[]
  /** Optional faint background bars (e.g. rain amount behind rain chance). */
  bars?: ChartBars
  /** Horizontal background zones (e.g. AQI categories). */
  bands?: ChartBand[]
  /**
   * Index of "today"/"now". Draws a vertical marker; series segments after
   * it render dashed to read as forecast rather than observation.
   */
  markerIndex?: number
  markerLabel?: string
  yMin?: number
  yMax?: number
  ariaLabel: string
  /** When set, each x position becomes a tap target. */
  onSelectIndex?: (_index: number) => void
  /** Accessible names for tap targets, one per index. */
  selectLabels?: string[]
}

const WIDTH = 360
const HEIGHT = 186
const PLOT = { left: 34, right: 354, top: 12, bottom: 148 }
const LABEL_Y = 168

function niceStep(roughStep: number): number {
  const power = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / power
  if (normalized <= 1) return power
  if (normalized <= 2) return 2 * power
  if (normalized <= 5) return 5 * power
  return 10 * power
}

function domain(
  series: ChartSeries[],
  yMin: number | undefined,
  yMax: number | undefined,
): { min: number; max: number; ticks: number[] } {
  const values = series
    .flatMap((entry) => entry.values)
    .filter((value): value is number => value !== null)
  let min = yMin ?? Math.min(...values, Infinity)
  let max = yMax ?? Math.max(...values, -Infinity)
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0
    max = 1
  }
  if (min === max) {
    min -= 1
    max += 1
  }
  const step = niceStep((max - min) / 3)
  if (yMin === undefined) min = Math.floor(min / step) * step
  if (yMax === undefined) max = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let tick = min; tick <= max + step / 2; tick += step) {
    ticks.push(Math.round(tick * 100) / 100)
  }
  return { min, max, ticks }
}

export default function LineChart({
  labels,
  series,
  bars,
  bands,
  markerIndex,
  markerLabel,
  yMin,
  yMax,
  ariaLabel,
  onSelectIndex,
  selectLabels,
}: LineChartProps): ReactElement {
  const count = labels.length
  const { min, max, ticks } = domain(series, yMin, yMax)

  const x = (index: number): number =>
    count <= 1
      ? (PLOT.left + PLOT.right) / 2
      : PLOT.left + (index * (PLOT.right - PLOT.left)) / (count - 1)
  const y = (value: number): number =>
    PLOT.bottom - ((value - min) / (max - min)) * (PLOT.bottom - PLOT.top)

  const clampY = (value: number): number =>
    Math.max(PLOT.top, Math.min(PLOT.bottom, y(value)))

  function pathFor(values: (number | null)[], from: number, to: number): string {
    let path = ''
    let drawing = false
    for (let index = from; index <= to; index += 1) {
      const value = values[index]
      if (value === null || value === undefined) {
        drawing = false
        continue
      }
      const command = drawing ? 'L' : 'M'
      path += `${command}${x(index).toFixed(1)} ${y(value).toFixed(1)}`
      drawing = true
    }
    return path
  }

  const barMax =
    bars?.max ??
    Math.max(
      ...(bars?.values.filter((value): value is number => value !== null) ?? [
        1,
      ]),
      0.01,
    )
  const columnWidth =
    count <= 1 ? PLOT.right - PLOT.left : (PLOT.right - PLOT.left) / (count - 1)

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      {bands?.map((band) => {
        const top = clampY(Math.min(band.to, max))
        const bottom = clampY(Math.max(band.from, min))
        if (bottom <= top) return null
        return (
          <rect
            key={`${band.from}-${band.to}`}
            className={band.className}
            x={PLOT.left}
            y={top}
            width={PLOT.right - PLOT.left}
            height={bottom - top}
          />
        )
      })}

      {ticks.map((tick) => (
        <g key={tick}>
          <line
            className={styles.chartGrid}
            x1={PLOT.left}
            x2={PLOT.right}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text className={styles.chartTickLabel} x={PLOT.left - 6} y={y(tick) + 3}>
            {tick}
          </text>
        </g>
      ))}

      {bars?.values.map((value, index) => {
        if (value === null || value <= 0) return null
        const height =
          (Math.min(value, barMax) / barMax) * (PLOT.bottom - PLOT.top)
        const barWidth = Math.min(columnWidth * 0.5, 10)
        return (
          <rect
            key={index}
            className={styles.chartBar}
            x={x(index) - barWidth / 2}
            y={PLOT.bottom - height}
            width={barWidth}
            height={height}
          />
        )
      })}

      {markerIndex !== undefined && markerIndex >= 0 && markerIndex < count ? (
        <g>
          <line
            className={styles.chartMarker}
            x1={x(markerIndex)}
            x2={x(markerIndex)}
            y1={PLOT.top - 4}
            y2={PLOT.bottom}
          />
          {markerLabel ? (
            <text
              className={styles.chartMarkerLabel}
              x={x(markerIndex)}
              y={PLOT.top - 6}
            >
              {markerLabel}
            </text>
          ) : null}
        </g>
      ) : null}

      {series.map((entry) => {
        const splitAt =
          markerIndex !== undefined
            ? Math.max(0, Math.min(markerIndex, count - 1))
            : count - 1
        return (
          <g key={entry.id} className={entry.className ?? styles.chartSeries}>
            <path className={styles.chartLinePast} d={pathFor(entry.values, 0, splitAt)} />
            <path
              className={styles.chartLineFuture}
              d={pathFor(entry.values, splitAt, count - 1)}
            />
          </g>
        )
      })}

      {labels.map((label, index) =>
        label ? (
          <text
            key={index}
            className={styles.chartAxisLabel}
            x={x(index)}
            y={LABEL_Y}
          >
            {label}
          </text>
        ) : null,
      )}

      {onSelectIndex
        ? labels.map((_, index) => (
            <rect
              key={index}
              className={styles.chartTapTarget}
              x={x(index) - columnWidth / 2}
              y={PLOT.top - 8}
              width={columnWidth}
              height={PLOT.bottom - PLOT.top + 8}
              role="button"
              tabIndex={0}
              aria-label={selectLabels?.[index] ?? `Select point ${index + 1}`}
              onClick={() => onSelectIndex(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectIndex(index)
                }
              }}
            />
          ))
        : null}
    </svg>
  )
}
