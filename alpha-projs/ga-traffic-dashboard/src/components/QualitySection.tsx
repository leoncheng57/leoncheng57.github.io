import { useMemo } from 'react'
import type { PageRow, QualityResponse } from '../api'
import { groupForPath } from '../appGroups'
import { formatSeconds, type ChartRow } from '../charts'
import { formatDateLabel } from '../dates'
import styles from '../dashboard.module.css'
import { AppLines } from './AppLineChart'

type Props = {
  quality: QualityResponse
  pages: PageRow[]
  hidden: Set<string>
}

/**
 * Session-weighted engagement rate per app per date. Weighting by sessions
 * keeps one-hit paths from dominating the average.
 */
function rateSeries(quality: QualityResponse, rate: 'bounceRate' | 'engagementRate') {
  const byDate = new Map<string, Map<string, { weighted: number; sessions: number }>>()
  const totals = new Map<string, number>()

  for (const row of quality.rates) {
    const group = groupForPath(row.pagePath)
    totals.set(group, (totals.get(group) ?? 0) + row.sessions)
    let groups = byDate.get(row.date)
    if (!groups) {
      groups = new Map()
      byDate.set(row.date, groups)
    }
    const bucket = groups.get(group) ?? { weighted: 0, sessions: 0 }
    bucket.weighted += row[rate] * row.sessions
    bucket.sessions += row.sessions
    groups.set(group, bucket)
  }

  const groupNames = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  const chartData: ChartRow[] = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, groups]) => {
      const row: ChartRow = { date: formatDateLabel(date, quality.granularity) }
      for (const [name, bucket] of groups) {
        if (bucket.sessions > 0) {
          row[name] = Number(((bucket.weighted / bucket.sessions) * 100).toFixed(1))
        }
      }
      return row
    })

  return { chartData, groupNames }
}

const AUTOMATION_BROWSERS = /headless|phantom|electron|bot|crawler|spider/i

export default function QualitySection({ quality, pages, hidden }: Props) {
  const engagement = useMemo(
    () => rateSeries(quality, 'engagementRate'),
    [quality],
  )
  const bounce = useMemo(() => rateSeries(quality, 'bounceRate'), [quality])

  const timeOnPage = useMemo(
    () =>
      pages
        .filter((row) => row.screenPageViews >= 5)
        .map((row) => ({
          ...row,
          avgSeconds: row.engagementSeconds / row.screenPageViews,
        }))
        .sort((a, b) => b.avgSeconds - a.avgSeconds)
        .slice(0, 12),
    [pages],
  )

  const totalSessions = quality.browsers.reduce((sum, b) => sum + b.sessions, 0)

  return (
    <>
      <section className={styles.section}>
        <h2>Engagement rate by app</h2>
        <p className={styles.sectionNote}>
          Share of sessions that lasted 10+ seconds, had a key event, or viewed
          2+ pages. Session-weighted; higher is better.
        </p>
        <div className={styles.card}>
          <AppLines
            data={engagement.chartData}
            groupNames={engagement.groupNames}
            hidden={hidden}
            height={280}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Bounce rate by app</h2>
        <p className={styles.sectionNote}>
          The inverse view: share of sessions with no meaningful engagement.
        </p>
        <div className={styles.card}>
          <AppLines
            data={bounce.chartData}
            groupNames={bounce.groupNames}
            hidden={hidden}
            height={280}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Time on page</h2>
        <p className={styles.sectionNote}>
          Pages people actually stay on: average engaged time per view, pages
          with 5+ views in range.
        </p>
        <div className={`${styles.card} ${styles.tableWrap}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Page</th>
                <th className={styles.num}>Views</th>
                <th className={styles.num}>Avg engaged time</th>
              </tr>
            </thead>
            <tbody>
              {timeOnPage.map((row) => (
                <tr key={row.pagePath}>
                  <td className={styles.pathCell} title={row.pagePath}>
                    {row.pagePath}
                  </td>
                  <td className={styles.num}>
                    {row.screenPageViews.toLocaleString()}
                  </td>
                  <td className={styles.num}>{formatSeconds(row.avgSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Suspected automation (diagnostic)</h2>
        <p className={styles.sectionNote}>
          AI crawlers (GPTBot, ClaudeBot, ...) never execute the analytics tag,
          so they cannot appear here at all. This table only catches
          JS-executing automation - headless browsers such as this site&apos;s
          own PR-screenshot CI. Flagged rows match a known automation browser
          name or have near-zero engagement across many views.
        </p>
        <div className={`${styles.card} ${styles.tableWrap}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Browser</th>
                <th className={styles.num}>Sessions</th>
                <th className={styles.num}>Share</th>
                <th className={styles.num}>Views</th>
                <th className={styles.num}>Avg engaged time / view</th>
              </tr>
            </thead>
            <tbody>
              {quality.browsers.map((row) => {
                const avg =
                  row.screenPageViews > 0
                    ? row.engagementSeconds / row.screenPageViews
                    : 0
                const flagged =
                  AUTOMATION_BROWSERS.test(row.browser) ||
                  (row.screenPageViews >= 20 && avg < 1)
                return (
                  <tr
                    key={row.browser}
                    className={flagged ? styles.flagged : undefined}
                  >
                    <td>
                      {row.browser}
                      {flagged ? ' ⚠' : ''}
                    </td>
                    <td className={styles.num}>
                      {row.sessions.toLocaleString()}
                    </td>
                    <td className={styles.num}>
                      {totalSessions > 0
                        ? `${((row.sessions / totalSessions) * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className={styles.num}>
                      {row.screenPageViews.toLocaleString()}
                    </td>
                    <td className={styles.num}>{formatSeconds(avg)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
