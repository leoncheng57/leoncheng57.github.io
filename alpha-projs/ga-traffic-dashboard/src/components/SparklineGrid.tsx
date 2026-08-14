import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { colorForGroup } from '../appGroups'
import type { GroupedSeries } from '../charts'
import styles from '../dashboard.module.css'

type Props = { series: GroupedSeries }

function trendArrow(values: number[]): string {
  if (values.length < 2) return '■'
  const half = Math.floor(values.length / 2)
  const first = values.slice(0, half).reduce((a, b) => a + b, 0)
  const second = values.slice(half).reduce((a, b) => a + b, 0)
  if (second > first * 1.1) return '▲'
  if (second < first * 0.9) return '▼'
  return '■'
}

export default function SparklineGrid({ series }: Props) {
  return (
    <div className={styles.sparkGrid}>
      {series.groupNames.map((name) => {
        const values = series.chartData.map(
          (row) => (row[name] as number) ?? 0,
        )
        const data = values.map((value, index) => ({ index, value }))
        return (
          <div key={name} className={styles.sparkCard}>
            <div className={styles.sparkHead}>
              <p className={styles.sparkName} style={{ color: colorForGroup(name) }}>
                {name}
              </p>
              <p className={styles.sparkTotal}>
                {(series.totals.get(name) ?? 0).toLocaleString()}{' '}
                {trendArrow(values)}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={48}>
              <LineChart data={data} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colorForGroup(name)}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}
