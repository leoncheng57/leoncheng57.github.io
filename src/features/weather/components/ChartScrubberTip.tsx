import { useId, useState, type ReactElement } from 'react'
import styles from '../weather.module.css'

const COLLAPSED_KEY = 'nyc-weather-chart-tip-collapsed-v1'

export type ChartScrubberTipProps = {
  period: 'hour' | 'day'
}

function hasCollapsedTip(): boolean {
  try {
    const stored = window.localStorage.getItem(COLLAPSED_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

export default function ChartScrubberTip({
  period,
}: ChartScrubberTipProps): ReactElement {
  const [collapsed, setCollapsed] = useState(hasCollapsedTip)
  const headingId = useId()
  const panelId = useId()

  const setTipCollapsed = (nextCollapsed: boolean) => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, String(nextCollapsed))
    } catch {
      // The control remains usable for this session when storage is blocked.
    }
    setCollapsed(nextCollapsed)
  }

  return (
    <>
      <button
        type="button"
        className={styles.onboardingButton}
        onClick={() => setTipCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-controls={panelId}
      >
        Chart drag
      </button>
      {!collapsed ? (
        <aside
          id={panelId}
          className={styles.chartTip}
          aria-labelledby={headingId}
        >
          <h2 id={headingId}>How to read charts</h2>
          <p>
            Drag the vertical line across a chart to inspect each {period}. You
            can also focus the chart and use the arrow keys.
          </p>
        </aside>
      ) : null}
    </>
  )
}
