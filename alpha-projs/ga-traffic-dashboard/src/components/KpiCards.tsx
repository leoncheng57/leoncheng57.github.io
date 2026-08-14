import type { SummaryResponse } from '../api'
import styles from '../dashboard.module.css'

type Props = {
  current: SummaryResponse | null
  previous: SummaryResponse | null
}

const KPIS: { key: keyof SummaryResponse; label: string }[] = [
  { key: 'screenPageViews', label: 'Views' },
  { key: 'activeUsers', label: 'Active users' },
  { key: 'sessions', label: 'Sessions' },
]

function formatCount(value: number): string {
  if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`
  return value.toLocaleString()
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return <p className={`${styles.kpiDelta} ${styles.deltaFlat}`}>no prior data</p>
  }
  const change = ((current - previous) / previous) * 100
  const className =
    change > 0.5 ? styles.deltaUp : change < -0.5 ? styles.deltaDown : styles.deltaFlat
  const arrow = change > 0.5 ? '▲' : change < -0.5 ? '▼' : '■'
  return (
    <p className={`${styles.kpiDelta} ${className}`}>
      {arrow} {Math.abs(change).toFixed(0)}% vs previous period
    </p>
  )
}

export default function KpiCards({ current, previous }: Props) {
  return (
    <div className={styles.kpiGrid}>
      {KPIS.map(({ key, label }) => (
        <div key={key} className={styles.card}>
          <p className={styles.kpiLabel}>{label}</p>
          <p className={styles.kpiValue}>
            {current ? formatCount(current[key]) : '—'}
          </p>
          {current && previous ? (
            <Delta current={current[key]} previous={previous[key]} />
          ) : (
            <p className={`${styles.kpiDelta} ${styles.deltaFlat}`}>…</p>
          )}
        </div>
      ))}
    </div>
  )
}
