import type { ReactElement } from 'react'
import styles from './HistoricalTimeline.module.css'

export interface HistoricalTimelineEntry {
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

export default function HistoricalTimeline({
  ariaLabel,
  entries,
}: HistoricalTimelineProps): ReactElement {
  return (
    <section className={styles.timeline} aria-label={ariaLabel}>
      <ol className={styles.entries}>
        {entries.map((entry) => (
          <li
            key={`${entry.dateTime}-${entry.stage}-${entry.milestone}`}
            className={styles.entry}
          >
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
        ))}
      </ol>
    </section>
  )
}
