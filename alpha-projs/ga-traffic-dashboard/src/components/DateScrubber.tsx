import { useCallback, useRef } from 'react'
import styles from './DateScrubber.module.css'

export type DateScrubberProps = {
  /** Chronologically ordered date labels, one per graph point (e.g. ChartRow['date']). */
  dates: string[]
  /** Currently selected index into `dates`. Fully controlled by the parent. */
  selectedIndex: number
  /** Called with the new index and its corresponding date whenever the user moves the marker. */
  onChange: (index: number, date: string) => void
  /** Accessible name for the slider handle. */
  label?: string
  /** Optional formatter used for the visually-hidden value text announced to AT. */
  formatValueText?: (date: string, index: number) => string
  className?: string
  disabled?: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * A controlled, accessible scrubber that renders a vertical marker which can be
 * dragged horizontally (pointer or touch) or moved with the keyboard across a
 * series of chronological graph points. Positioning assumes evenly spaced
 * points, matching a categorical x-axis such as recharts' default behaviour.
 */
export default function DateScrubber({
  dates,
  selectedIndex,
  onChange,
  label = 'Date scrubber',
  formatValueText,
  className,
  disabled = false,
}: DateScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const lastIndex = dates.length - 1
  const clampedIndex = dates.length > 0 ? clamp(selectedIndex, 0, lastIndex) : 0
  const percentFor = useCallback(
    (index: number) => (lastIndex <= 0 ? 0 : (index / lastIndex) * 100),
    [lastIndex],
  )

  const commitIndex = useCallback(
    (index: number) => {
      if (disabled || dates.length === 0) return
      const next = clamp(Math.round(index), 0, lastIndex)
      if (next !== clampedIndex) onChange(next, dates[next])
    },
    [clampedIndex, dates, disabled, lastIndex, onChange],
  )

  const indexFromClientX = useCallback(
    (clientX: number): number => {
      const el = trackRef.current
      if (!el || lastIndex <= 0) return 0
      const rect = el.getBoundingClientRect()
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      return Math.round(ratio * lastIndex)
    },
    [lastIndex],
  )

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || dates.length === 0) return
      event.preventDefault()
      draggingRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      commitIndex(indexFromClientX(event.clientX))
    },
    [commitIndex, disabled, dates.length, indexFromClientX],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      commitIndex(indexFromClientX(event.clientX))
    },
    [commitIndex, indexFromClientX],
  )

  const stopDragging = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    },
    [],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || dates.length === 0) return
      const bigStep = Math.max(1, Math.round(dates.length / 10))
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault()
          commitIndex(clampedIndex - 1)
          break
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault()
          commitIndex(clampedIndex + 1)
          break
        case 'PageDown':
          event.preventDefault()
          commitIndex(clampedIndex - bigStep)
          break
        case 'PageUp':
          event.preventDefault()
          commitIndex(clampedIndex + bigStep)
          break
        case 'Home':
          event.preventDefault()
          commitIndex(0)
          break
        case 'End':
          event.preventDefault()
          commitIndex(lastIndex)
          break
        default:
          break
      }
    },
    [clampedIndex, commitIndex, dates.length, disabled, lastIndex],
  )

  const currentDate = dates[clampedIndex]
  const valueText = currentDate
    ? formatValueText
      ? formatValueText(currentDate, clampedIndex)
      : currentDate
    : undefined

  return (
    <div
      className={[styles.scrubber, disabled ? styles.scrubberDisabled : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={trackRef}
        className={styles.track}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        {dates.map((date, index) => (
          <span
            key={date}
            className={styles.tick}
            style={{ left: `${percentFor(index)}%` }}
          />
        ))}
        <div
          className={styles.marker}
          style={{ left: `${percentFor(clampedIndex)}%` }}
          aria-hidden="true"
        >
          <span className={styles.markerLine} />
        </div>
        <div
          className={styles.handle}
          style={{ left: `${percentFor(clampedIndex)}%` }}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-label={label}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={lastIndex}
          aria-valuenow={clampedIndex}
          aria-valuetext={valueText}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        />
      </div>
    </div>
  )
}
