import type { CSSProperties, ReactElement } from 'react'
import useCountdown from '../hooks/useCountdown'
import useWakeLock from '../hooks/useWakeLock'
import { playTimerCompleteAlert, primeTimerAudio } from '../utils/timerAlerts'
import styles from '../workout-lab.module.css'

export interface TimerSelection {
  id: string
  label: string
  seconds: number
  kind: 'exercise' | 'rest'
}

interface WorkoutTimerProps {
  selection: TimerSelection
  onClose: () => void
}

function formatTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export default function WorkoutTimer({
  selection,
  onClose,
}: WorkoutTimerProps): ReactElement {
  const { remainingMs, status, start, pause, reset } = useCountdown(
    selection.seconds,
    playTimerCompleteAlert
  )
  const hasWakeLock = useWakeLock(status === 'running')
  const progress = Math.max(
    0,
    Math.min(100, (remainingMs / (selection.seconds * 1000)) * 100)
  )

  const startTimer = (): void => {
    primeTimerAudio()
    start()
  }

  return (
    <aside className={styles.timerDock} aria-label={`${selection.label} timer`}>
      <div className={styles.timerHeading}>
        <div>
          <span className={styles.timerKind}>
            {selection.kind === 'rest' ? 'Rest timer' : 'Interval timer'}
          </span>
          <h2>{selection.label}</h2>
        </div>
        <button
          type="button"
          className={styles.timerClose}
          onClick={onClose}
          aria-label="Close timer"
        >
          Close
        </button>
      </div>

      <div className={styles.timerReadout}>
        <time
          dateTime={`PT${Math.ceil(remainingMs / 1000)}S`}
          aria-label={`${Math.ceil(remainingMs / 1000)} seconds remaining`}
        >
          {formatTime(remainingMs)}
        </time>
        <span className={styles.timerStatus} aria-live="polite">
          {status === 'complete'
            ? 'Time complete'
            : status === 'running'
              ? hasWakeLock
                ? 'Running · screen awake'
                : 'Running'
              : status}
        </span>
      </div>

      <div className={styles.timerTrack} aria-hidden="true">
        <span
          className={styles.timerProgress}
          style={{ width: `${progress}%` } as CSSProperties}
        />
      </div>

      <div className={styles.timerActions}>
        {status === 'running' ? (
          <button type="button" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" onClick={startTimer}>
            {status === 'paused' ? 'Resume' : status === 'complete' ? 'Restart' : 'Start'}
          </button>
        )}
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </aside>
  )
}
