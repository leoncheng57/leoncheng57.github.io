import { useEffect, useId, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import {
  DEFAULT_CONFIG,
  MAX_REVIEW_LATENCY,
  MAX_WORKERS,
  MIN_REVIEW_LATENCY,
  MIN_WORKERS,
  PHASE_INFO,
  getPhaseAt,
  getWaitTicksAt,
  simulate,
  summarizeAt,
} from './simulation'
import type {
  AutonomyLevel,
  LaneTimeline,
  Segment,
  SimulatorConfig,
  TaskSizeVariance,
} from './simulation'
import styles from './ManagerWorkerSimulator.module.css'

/** Simulated minutes advanced per real second while playing. */
const TICKS_PER_SECOND = 8
/** Interval between whole-tick jumps when prefers-reduced-motion is set. */
const STEPPED_INTERVAL_MS = 350
/** Coarseness of aria-live updates while playing, in ticks. */
const LIVE_SUMMARY_GRANULARITY = 10

const AUTONOMY_HINTS: Record<AutonomyLevel, string> = {
  'ask-first': 'Workers propose an approach and wait for you before doing the work.',
  'draft-pr': 'Workers run unattended, then wait at a draft-PR review gate.',
  'full-auto': 'No human gates after planning. Fast, but nothing is checked.',
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches)
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    }
    return undefined
  }, [])

  return reduced
}

function toPercent(value: number, total: number): string {
  if (total <= 0) return '0%'
  return `${((value / total) * 100).toFixed(3)}%`
}

function segmentColorClass(segment: Segment): string {
  if (segment.phase === 'merge') return styles.phaseMerge
  const actor = PHASE_INFO[segment.phase].actor
  if (actor === 'human') return styles.actorHuman
  if (actor === 'waiting') return styles.actorWaiting
  return styles.actorAi
}

interface LaneRowProps {
  lane: LaneTimeline
  time: number
  totalTicks: number
}

function LaneRow({ lane, time, totalTicks }: LaneRowProps): ReactElement {
  const phase = getPhaseAt(lane, time)
  const waited = Math.round(getWaitTicksAt(lane, time))
  return (
    <div className={styles.lane}>
      <div className={styles.laneHeader}>
        <span className={styles.laneName}>{lane.label}</span>
        <span className={styles.lanePhase}>
          {PHASE_INFO[phase].label}
          {lane.role === 'worker' && waited > 0 ? (
            <span className={styles.laneWait}> · waited {waited} min</span>
          ) : null}
        </span>
      </div>
      <div className={styles.track}>
        {lane.segments.map((segment) => {
          const isFuture = segment.start >= time
          const isActive = time >= segment.start && time < segment.end
          const className = [
            styles.segment,
            segmentColorClass(segment),
            isFuture ? styles.segmentFuture : '',
            isActive ? styles.segmentActive : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <span
              key={`${segment.phase}-${segment.start}`}
              className={className}
              style={{
                left: toPercent(segment.start, totalTicks),
                width: toPercent(segment.end - segment.start, totalTicks),
              }}
              title={`${PHASE_INFO[segment.phase].label}: minute ${segment.start} to ${segment.end}`}
            />
          )
        })}
        <span className={styles.playhead} style={{ left: toPercent(time, totalTicks) }} />
      </div>
    </div>
  )
}

/**
 * Interactive, deterministic playground: one manager plus N workers moving
 * through plan, dispatch, parallel work, review gates, and merge. Human
 * touchpoints and human-blocked waiting are color-coded on the swimlanes.
 */
export default function ManagerWorkerSimulator(): ReactElement {
  const idPrefix = useId()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_CONFIG)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)

  const result = useMemo(() => simulate(config), [config])

  const updateConfig = (patch: Partial<SimulatorConfig>): void => {
    setConfig((current) => ({ ...current, ...patch }))
    setTime(0)
    setPlaying(false)
  }

  // Advance the clock while playing. With prefers-reduced-motion we fall back
  // to stepped whole-tick jumps instead of a smooth animation-frame loop.
  useEffect(() => {
    if (!playing) return undefined
    if (prefersReducedMotion) {
      const interval = window.setInterval(() => {
        setTime((current) => Math.min(result.totalTicks, Math.floor(current) + 1))
      }, STEPPED_INTERVAL_MS)
      return () => window.clearInterval(interval)
    }
    let frame = 0
    let last = performance.now()
    const step = (now: number): void => {
      const deltaSeconds = (now - last) / 1000
      last = now
      setTime((current) => Math.min(result.totalTicks, current + deltaSeconds * TICKS_PER_SECOND))
      frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [playing, prefersReducedMotion, result.totalTicks])

  // Auto-pause at the end of the run.
  useEffect(() => {
    if (playing && time >= result.totalTicks) setPlaying(false)
  }, [playing, time, result.totalTicks])

  const flooredTime = Math.floor(time)
  const summaryTime = playing
    ? Math.floor(flooredTime / LIVE_SUMMARY_GRANULARITY) * LIVE_SUMMARY_GRANULARITY
    : flooredTime
  const liveSummary = useMemo(() => summarizeAt(result, summaryTime), [result, summaryTime])

  const waitSoFar = Math.round(
    result.lanes.reduce((sum, lane) => sum + getWaitTicksAt(lane, time), 0)
  )

  const stepBy = (delta: number): void => {
    setPlaying(false)
    setTime((current) => Math.max(0, Math.min(result.totalTicks, Math.round(current) + delta)))
  }

  return (
    <section className={styles.simulator} aria-label="Manager and worker run simulator">
      <fieldset className={styles.controls}>
        <legend className={styles.controlsLegend}>Scenario knobs</legend>

        <div className={styles.control}>
          <label className={styles.controlLabel} htmlFor={`${idPrefix}-workers`}>
            Workers <span className={styles.controlValue}>{config.workers}</span>
          </label>
          <input
            id={`${idPrefix}-workers`}
            type="range"
            min={MIN_WORKERS}
            max={MAX_WORKERS}
            step={1}
            value={config.workers}
            onChange={(event) => updateConfig({ workers: Number(event.target.value) })}
          />
          <span className={styles.controlHint}>Parallel agents working at once.</span>
        </div>

        <div className={styles.control}>
          <label className={styles.controlLabel} htmlFor={`${idPrefix}-autonomy`}>
            Autonomy level
          </label>
          <select
            id={`${idPrefix}-autonomy`}
            value={config.autonomy}
            onChange={(event) => updateConfig({ autonomy: event.target.value as AutonomyLevel })}
          >
            <option value="ask-first">Ask first</option>
            <option value="draft-pr">Draft-PR review gate</option>
            <option value="full-auto">Full auto</option>
          </select>
          <span className={styles.controlHint}>{AUTONOMY_HINTS[config.autonomy]}</span>
        </div>

        <div className={styles.control}>
          <label className={styles.controlLabel} htmlFor={`${idPrefix}-variance`}>
            Task size variance
          </label>
          <select
            id={`${idPrefix}-variance`}
            value={config.variance}
            onChange={(event) =>
              updateConfig({ variance: event.target.value as TaskSizeVariance })
            }
          >
            <option value="low">Low (similar tasks)</option>
            <option value="medium">Medium</option>
            <option value="high">High (lopsided tasks)</option>
          </select>
          <span className={styles.controlHint}>How evenly the work was split.</span>
        </div>

        <div className={styles.control}>
          <label className={styles.controlLabel} htmlFor={`${idPrefix}-latency`}>
            Human review latency{' '}
            <span className={styles.controlValue}>{config.reviewLatency} min</span>
          </label>
          <input
            id={`${idPrefix}-latency`}
            type="range"
            min={MIN_REVIEW_LATENCY}
            max={MAX_REVIEW_LATENCY}
            step={1}
            value={config.reviewLatency}
            onChange={(event) => updateConfig({ reviewLatency: Number(event.target.value) })}
          />
          <span className={styles.controlHint}>How long until you notice a waiting agent.</span>
        </div>

        <div className={styles.control}>
          <label className={styles.controlLabel} htmlFor={`${idPrefix}-seed`}>
            Seed
          </label>
          <input
            id={`${idPrefix}-seed`}
            type="number"
            value={config.seed}
            onChange={(event) => updateConfig({ seed: Number(event.target.value) || 0 })}
          />
          <span className={styles.controlHint}>Same seed, same run. Change it to reroll.</span>
        </div>
      </fieldset>

      <div className={styles.transport}>
        <button
          type="button"
          className={styles.transportButtonPrimary}
          onClick={() => {
            if (!playing && time >= result.totalTicks) setTime(0)
            setPlaying((current) => !current)
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className={styles.transportButton} onClick={() => stepBy(-1)}>
          &minus;1 min
        </button>
        <button type="button" className={styles.transportButton} onClick={() => stepBy(1)}>
          +1 min
        </button>
        <button
          type="button"
          className={styles.transportButton}
          onClick={() => {
            setPlaying(false)
            setTime(0)
          }}
        >
          Reset
        </button>
        <div className={styles.scrub}>
          <label htmlFor={`${idPrefix}-scrub`}>Scrub</label>
          <input
            id={`${idPrefix}-scrub`}
            type="range"
            min={0}
            max={result.totalTicks}
            step={1}
            value={flooredTime}
            onChange={(event) => {
              setPlaying(false)
              setTime(Number(event.target.value))
            }}
          />
        </div>
        <span className={styles.clock} role="timer" aria-label="Simulated clock">
          t = {flooredTime} / {result.totalTicks} min
        </span>
        {prefersReducedMotion ? (
          <span className={styles.reducedMotionNote}>
            Reduced motion is on: playback advances in one-minute steps.
          </span>
        ) : null}
      </div>

      <div className={styles.timeline}>
        {result.lanes.map((lane) => (
          <LaneRow key={lane.id} lane={lane} time={time} totalTicks={result.totalTicks} />
        ))}
      </div>

      <ul className={styles.legend} aria-label="Timeline color legend">
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.actorHuman}`} aria-hidden="true" />
          Human touchpoint (task specs, approvals, PR review)
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.actorAi}`} aria-hidden="true" />
          AI-only activity (dispatch, coding, monitoring)
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.actorWaiting}`} aria-hidden="true" />
          Blocked, waiting on a human
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.phaseMerge}`} aria-hidden="true" />
          Merge
        </li>
      </ul>

      <div className={styles.stats}>
        <span>
          Run length: <span className={styles.statValue}>{result.totalTicks} min</span>
        </span>
        <span>
          Human-blocked wait so far:{' '}
          <span className={styles.statValue}>
            {waitSoFar} / {result.totalWaitTicks} min
          </span>
        </span>
      </div>

      <p className={styles.visuallyHidden} aria-live="polite">
        {liveSummary}
      </p>
    </section>
  )
}
