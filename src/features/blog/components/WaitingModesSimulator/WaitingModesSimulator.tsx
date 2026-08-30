import { useState } from 'react'
import type { ReactElement } from 'react'
import { SCENARIOS, SEGMENT_INFO } from './simulation'
import type { Mode, Segment } from './simulation'
import styles from './WaitingModesSimulator.module.css'

const SEGMENT_CLASS: Record<Segment['kind'], string> = {
  ask: styles.segmentAsk,
  blocked: styles.segmentBlocked,
  answer: styles.segmentAnswer,
  quick: styles.segmentQuick,
  work: styles.segmentWork,
  free: styles.segmentFree,
}

const LEGEND_ORDER: Segment['kind'][] = ['ask', 'blocked', 'answer', 'quick', 'work']

const MODE_LABELS: Record<Mode, string> = {
  interleaved: 'Interleaved',
  delegated: 'Delegated',
}

function toPercent(value: number, total: number): string {
  if (total <= 0) return '0%'
  return `${((value / total) * 100).toFixed(3)}%`
}

export interface WaitingModesSimulatorProps {
  ariaLabel?: string
}

/**
 * Click-through figure contrasting two ways of handling agent latency:
 * interleaving two questions in one thread (the plan-mode trap) versus
 * delegating the long task to a background child agent and keeping the
 * parent session free for quick questions. No autoplay — the two modes are
 * fixed, hand-authored scenarios; only the toggle is interactive.
 *
 * Embedded from markdown via `![alt](component:waiting-modes-simulator)` —
 * see BLOG_EMBEDS in BlogPostRoute.
 */
export default function WaitingModesSimulator({
  ariaLabel = 'Interleaved vs. delegated waiting modes',
}: WaitingModesSimulatorProps): ReactElement {
  const [mode, setMode] = useState<Mode>('interleaved')
  const scenario = SCENARIOS[mode]

  return (
    <section className={styles.simulator} aria-label={ariaLabel}>
      <div className={styles.toggle} role="group" aria-label="Choose a mode">
        {(Object.keys(MODE_LABELS) as Mode[]).map((candidate) => (
          <button
            key={candidate}
            type="button"
            className={`${styles.toggleButton} ${
              mode === candidate ? styles.toggleButtonActive : ''
            }`}
            aria-pressed={mode === candidate}
            onClick={() => setMode(candidate)}
          >
            {MODE_LABELS[candidate]}
          </button>
        ))}
      </div>

      <div className={styles.timeline}>
        {scenario.lanes.map((lane) => (
          <div className={styles.lane} key={lane.id}>
            <span className={styles.laneLabel}>{lane.label}</span>
            <div className={styles.track}>
              {lane.segments.map((segment) => (
                <span
                  key={`${lane.id}-${segment.start}-${segment.kind}`}
                  className={`${styles.segment} ${SEGMENT_CLASS[segment.kind]}`}
                  style={{
                    left: toPercent(segment.start, scenario.totalTicks),
                    width: toPercent(segment.end - segment.start, scenario.totalTicks),
                  }}
                  title={segment.label || SEGMENT_INFO[segment.kind].label}
                >
                  {segment.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ul className={styles.legend} aria-label="Timeline color legend">
        {LEGEND_ORDER.map((kind) => (
          <li key={kind} className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${SEGMENT_CLASS[kind]}`}
              aria-hidden="true"
            />
            {SEGMENT_INFO[kind].label}
          </li>
        ))}
      </ul>

      <p className={styles.stat}>
        Context switches required:{' '}
        <span className={styles.statValue}>{scenario.contextSwitches}</span>
      </p>
      <p className={styles.narrative}>{scenario.narrative}</p>
    </section>
  )
}
