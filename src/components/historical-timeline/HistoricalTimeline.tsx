import type { CSSProperties, ReactElement } from 'react'
import styles from './HistoricalTimeline.module.css'

const MIN_GAP_REM = 0.45
const MAX_GAP_REM = 2.1
const CLUSTER_DAYS = 2
const MAX_PROPORTIONAL_DAYS = 35

type TimelineEntryStyle = CSSProperties & {
  '--timeline-gap': `${number}rem`
}

export interface HistoricalTimelineEntry {
  /** A human-readable progression marker; it does not imply completion. */
  version?: string
  date: string
  dateTime: string
  stage: string
  milestone: string
  detail?: string
  evidence?: string[]
}

interface HistoricalTimelineProps {
  ariaLabel: string
  entries: HistoricalTimelineEntry[]
}

function normalizedDateTimestamp(dateTime: string): number | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(dateTime)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = match[3] ? Number(match[3]) : 1
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return null
  }

  return Date.UTC(year, month - 1, day)
}

export function timelineGapDays(previousDateTime: string, dateTime: string): number {
  const previous = normalizedDateTimestamp(previousDateTime)
  const current = normalizedDateTimestamp(dateTime)
  if (previous === null || current === null || current <= previous) return 0

  return (current - previous) / 86_400_000
}

export function timelineGapRem(days: number): number {
  if (!Number.isFinite(days) || days <= CLUSTER_DAYS) return MIN_GAP_REM

  const proportionalDays = Math.min(days, MAX_PROPORTIONAL_DAYS) - CLUSTER_DAYS
  const proportionalRange = MAX_PROPORTIONAL_DAYS - CLUSTER_DAYS
  return MIN_GAP_REM + (proportionalDays / proportionalRange) * (MAX_GAP_REM - MIN_GAP_REM)
}

export default function HistoricalTimeline({
  ariaLabel,
  entries,
}: HistoricalTimelineProps): ReactElement {
  return (
    <section className={styles.timeline} aria-label={ariaLabel}>
      <ol className={styles.entries}>
        {entries.map((entry, index) => {
          const gapDays = index > 0
            ? timelineGapDays(entries[index - 1].dateTime, entry.dateTime)
            : 0
          const entryStyle: TimelineEntryStyle = {
            '--timeline-gap': `${index > 0 ? timelineGapRem(gapDays) : 0}rem`,
          }

          return <li
            key={`${entry.dateTime}-${entry.stage}-${entry.milestone}`}
            className={styles.entry}
            style={entryStyle}
          >
            <span className={styles.version}>{entry.version ?? entry.date}</span>
            <span className={styles.marker} aria-hidden="true" />
            <article className={styles.card}>
              <div className={styles.metadata}>
                <time dateTime={entry.dateTime}>{entry.date}</time>
                <span className={styles.stage}>{entry.stage}</span>
              </div>
              <h3>{entry.milestone}</h3>
              {entry.detail ? <p className={styles.detail}>{entry.detail}</p> : null}
              {entry.evidence?.length ? (
                <ul className={styles.evidence} aria-label="Evidence">
                  {entry.evidence.map((item) => (
                    <li key={item}>
                      <code>{item}</code>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          </li>
        })}
      </ol>
    </section>
  )
}
