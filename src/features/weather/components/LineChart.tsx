import { useRef, type PointerEvent, type ReactElement } from 'react'
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
  /** Index highlighted by the draggable scrubber, or null when idle. */
  scrubIndex?: number | null
  /** Called as the scrubber is dragged (or moved with arrow keys). */
  onScrubIndex?: (_index: number) => void
  /** Accessible name for the scrubber slider handle. */
  scrubAriaLabel?: string
  /** Human-readable value announced for the scrubbed index. */
  scrubValueText?: (_index: number) => string
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
  scrubIndex,
  onScrubIndex,
  scrubAriaLabel,
  scrubValueText,
}: LineChartProps): ReactElement {
  const count = labels.length
  const { min, max, ticks } = domain(series, yMin, yMax)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ startX: number; moved: boolean } | null>(null)

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

  const scrubbable = onScrubIndex !== undefined && count > 1
  const activeScrub =
    scrubbable && scrubIndex !== null && scrubIndex !== undefined
      ? Math.max(0, Math.min(scrubIndex, count - 1))
      : null

  const indexFromClientX = (clientX: number): number => {
    const svg = svgRef.current
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    if (rect.width <= 0) return 0
    const viewX = ((clientX - rect.left) / rect.width) * WIDTH
    const ratio = (viewX - PLOT.left) / (PLOT.right - PLOT.left)
    return Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1))))
  }

  const onScrubPointerDown = (event: PointerEvent<SVGRectElement>) => {
    if (!onScrubIndex) return
    dragRef.current = { startX: event.clientX, moved: false }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    onScrubIndex(indexFromClientX(event.clientX))
  }
  const onScrubPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const drag = dragRef.current
    if (!onScrubIndex || !drag) return
    if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true
    onScrubIndex(indexFromClientX(event.clientX))
  }
  const onScrubPointerUp = (event: PointerEvent<SVGRectElement>) => {
    const drag = dragRef.current
    dragRef.current = null
    // A press without horizontal movement is a tap: open the day/hour.
    if (drag && !drag.moved && onSelectIndex) {
      onSelectIndex(indexFromClientX(event.clientX))
    }
  }
  const onScrubPointerCancel = () => {
    dragRef.current = null
  }

  return (
    <svg
      ref={svgRef}
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

      {activeScrub !== null ? (
        <g className={styles.scrubber} data-testid="chart-scrubber">
          <line
            className={styles.scrubberLine}
            x1={x(activeScrub)}
            x2={x(activeScrub)}
            y1={PLOT.top - 4}
            y2={PLOT.bottom}
          />
          {series.map((entry) => {
            const value = entry.values[activeScrub]
            if (value === null || value === undefined) return null
            return (
              <circle
                key={entry.id}
                className={styles.scrubberDot}
                cx={x(activeScrub)}
                cy={clampY(value)}
                r={4}
              />
            )
          })}
          {scrubValueText ? (
            <text
              className={styles.scrubberLabel}
              x={x(activeScrub) > (PLOT.left + PLOT.right) / 2 ? x(activeScrub) - 8 : x(activeScrub) + 8}
              y={PLOT.top + 8}
              textAnchor={
                x(activeScrub) > (PLOT.left + PLOT.right) / 2 ? 'end' : 'start'
              }
            >
              {scrubValueText(activeScrub)}
            </text>
          ) : null}
        </g>
      ) : null}

      {scrubbable ? (
        <rect
          className={styles.scrubTarget}
          data-testid="chart-scrub-target"
          x={PLOT.left - columnWidth / 2}
          y={PLOT.top - 8}
          width={PLOT.right - PLOT.left + columnWidth}
          height={PLOT.bottom - PLOT.top + 8}
          role="slider"
          tabIndex={0}
          aria-label={scrubAriaLabel ?? 'Chart scrubber'}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={count - 1}
          aria-valuenow={activeScrub ?? markerIndex ?? 0}
          aria-valuetext={
            scrubValueText && activeScrub !== null
              ? scrubValueText(activeScrub)
              : undefined
          }
          onPointerDown={onScrubPointerDown}
          onPointerMove={onScrubPointerMove}
          onPointerUp={onScrubPointerUp}
          onPointerCancel={onScrubPointerCancel}
          onKeyDown={(event) => {
            const current = activeScrub ?? markerIndex ?? 0
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault()
              onScrubIndex?.(Math.max(0, current - 1))
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault()
              onScrubIndex?.(Math.min(count - 1, current + 1))
            } else if (
              (event.key === 'Enter' || event.key === ' ') &&
              onSelectIndex &&
              activeScrub !== null
            ) {
              event.preventDefault()
              onSelectIndex(activeScrub)
            }
          }}
        />
      ) : null}
    </svg>
  )
}
