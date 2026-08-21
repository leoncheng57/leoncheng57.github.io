import { useId, useState, type ReactElement } from 'react'
import styles from '../weather.module.css'

const COLLAPSED_KEY = 'nyc-weather-chart-tip-collapsed-v1'

export type ChartScrubberTipProps = {
  period: 'hour' | 'day'
}

function hasCollapsedTip(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export default function ChartScrubberTip({
  period,
}: ChartScrubberTipProps): ReactElement {
  const [collapsed, setCollapsed] = useState(hasCollapsedTip)
  const headingId = useId()

  const setTipCollapsed = (nextCollapsed: boolean) => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, String(nextCollapsed))
    } catch {
      // The control remains usable for this session when storage is blocked.
    }
    setCollapsed(nextCollapsed)
  }

  if (collapsed) {
    return (
      <button
        type="button"
        className={styles.chartTipReopen}
        onClick={() => setTipCollapsed(false)}
      >
        How to read charts
      </button>
    )
  }

  return (
    <aside className={styles.chartTip} aria-labelledby={headingId}>
      <div>
        <h2 id={headingId}>How to read charts</h2>
        <p>
          Drag the vertical line across a chart to inspect each {period}. You can
          also focus the chart and use the arrow keys.
        </p>
      </div>
      <button
        type="button"
        className={styles.chartTipCollapse}
        onClick={() => setTipCollapsed(true)}
      >
        Collapse chart instructions
      </button>
    </aside>
  )
}
