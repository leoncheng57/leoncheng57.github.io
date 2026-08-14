import type { PageRow } from '../api'
import { colorForGroup, groupForPath } from '../appGroups'
import { formatSeconds } from '../charts'
import styles from '../dashboard.module.css'

type Props = { rows: PageRow[]; limit?: number }

export default function TopPagesTable({ rows, limit = 20 }: Props) {
  const top = rows.slice(0, limit)
  return (
    <div className={`${styles.card} ${styles.tableWrap}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Page</th>
            <th>App</th>
            <th className={styles.num}>Views</th>
            <th className={styles.num}>Users</th>
            <th className={styles.num}>Avg time / view</th>
          </tr>
        </thead>
        <tbody>
          {top.map((row) => {
            const group = groupForPath(row.pagePath)
            const avg =
              row.screenPageViews > 0
                ? row.engagementSeconds / row.screenPageViews
                : 0
            return (
              <tr key={row.pagePath}>
                <td className={styles.pathCell} title={row.pagePath}>
                  {row.pagePath}
                </td>
                <td>
                  <span
                    className={styles.appTag}
                    style={{
                      color: colorForGroup(group),
                      borderColor: colorForGroup(group),
                    }}
                  >
                    {group}
                  </span>
                </td>
                <td className={styles.num}>
                  {row.screenPageViews.toLocaleString()}
                </td>
                <td className={styles.num}>{row.activeUsers.toLocaleString()}</td>
                <td className={styles.num}>{formatSeconds(avg)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
