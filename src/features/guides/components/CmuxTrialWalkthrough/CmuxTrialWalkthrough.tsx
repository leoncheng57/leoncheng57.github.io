import { useState } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import { TRIAL_FRAMES } from './frames'
import type { TranscriptLine, TrialActor, TrialFrame, TrialWorkspace } from './frames'
import styles from './CmuxTrialWalkthrough.module.css'

const ACTOR_DOT_CLASS: Record<TrialActor, string> = {
  human: styles.actorHuman,
  ai: styles.actorAi,
  waiting: styles.actorWaiting,
  merge: styles.actorMerge,
}

const ACTOR_NAME: Record<TrialActor, string> = {
  human: 'human touchpoint',
  ai: 'AI activity',
  waiting: 'blocked, waiting on a human',
  merge: 'merge/done',
}

const LINE_CLASS: Record<TranscriptLine['kind'], string> = {
  cmd: styles.lineCmd,
  out: styles.lineOut,
  status: styles.lineStatus,
  note: styles.lineNote,
}

function WorkspaceRow({
  workspace,
  focused,
}: {
  workspace: TrialWorkspace
  focused: boolean
}): ReactElement {
  const badgeClass =
    workspace.actor === 'waiting' ? `${styles.phaseBadge} ${styles.badgeWaiting}` : styles.phaseBadge
  return (
    <li className={focused ? styles.workspaceItemFocused : styles.workspaceItem}>
      <span
        className={`${styles.statusDot} ${ACTOR_DOT_CLASS[workspace.actor]} ${
          workspace.busy ? styles.dotBusy : ''
        }`}
        role="img"
        aria-label={ACTOR_NAME[workspace.actor]}
      />
      <span className={styles.workspaceName}>{workspace.name}</span>
      {workspace.statusPhase ? <span className={badgeClass}>{workspace.statusPhase}</span> : null}
    </li>
  )
}

function RecapBars({ frame }: { frame: TrialFrame }): ReactElement | null {
  if (!frame.recap) return null
  const { humanMinutes, aiMinutes, waitMinutes } = frame.recap
  const max = Math.max(humanMinutes, aiMinutes, waitMinutes)
  const rows: Array<{ label: string; minutes: number; actor: TrialActor }> = [
    { label: 'Human hands-on', minutes: humanMinutes, actor: 'human' },
    { label: 'AI working (in parallel)', minutes: aiMinutes, actor: 'ai' },
    { label: 'Blocked waiting on a human', minutes: waitMinutes, actor: 'waiting' },
  ]
  return (
    <div className={styles.recap}>
      {rows.map((row) => (
        <div key={row.label} className={styles.recapRow}>
          <span>{row.label}</span>
          <span className={styles.recapBarTrack}>
            <span
              className={`${styles.recapBar} ${ACTOR_DOT_CLASS[row.actor]}`}
              style={{ width: `${(row.minutes / max) * 100}%` }}
            />
          </span>
          <span className={styles.recapValue}>{row.minutes} min</span>
        </div>
      ))}
    </div>
  )
}

/**
 * A scripted, press-through demo of one manager + three workers running
 * three parallel tasks, rendered as a mock cmux window. Advanced only by
 * the Next/Back buttons or arrow keys — no free input, no autoplay.
 */
export default function CmuxTrialWalkthrough(): ReactElement {
  const [step, setStep] = useState(0)
  const frame = TRIAL_FRAMES[step]
  const isFirst = step === 0
  const isLast = step === TRIAL_FRAMES.length - 1

  const goBack = (): void => setStep((current) => Math.max(0, current - 1))
  const goNext = (): void => setStep((current) => Math.min(TRIAL_FRAMES.length - 1, current + 1))

  // Attached to the section (not window/document) so the keys only act while
  // the walkthrough owns focus and never hijack page scrolling.
  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goBack()
    }
  }

  const focusedWorkspace = frame.workspaces.find(
    (workspace) => workspace.id === frame.focusWorkspace
  )

  return (
    <section
      className={styles.walkthrough}
      aria-label="Guided cmux trial walkthrough"
      onKeyDown={onKeyDown}
    >
      <p className={styles.hint}>
        A fixed run: 1 manager, 3 workers, 3 parallel tasks. Step through it with the buttons (or
        the arrow keys while a button is focused). Colors mean the same as in the sandbox legend
        below.
      </p>

      <div className={styles.window}>
        <div className={styles.chrome}>
          <span className={styles.trafficLights} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.chromeTitle}>cmux — leoncheng57.github.io (simulated)</span>
        </div>

        <div className={styles.windowBody}>
          <nav className={styles.sidebar} aria-label="Simulated cmux workspaces">
            <p className={styles.sidebarHeading}>Workspaces</p>
            <ul className={styles.workspaceList}>
              {frame.workspaces.map((workspace) => (
                <WorkspaceRow
                  key={workspace.id}
                  workspace={workspace}
                  focused={workspace.id === frame.focusWorkspace}
                />
              ))}
            </ul>
          </nav>

          <div className={styles.pane}>
            <p className={styles.paneHeader}>
              {focusedWorkspace ? focusedWorkspace.name : frame.focusWorkspace} — terminal
              (simulated)
            </p>
            {frame.recap ? (
              <RecapBars frame={frame} />
            ) : (
              <pre className={styles.transcript}>
                {frame.transcript.map((line, index) => (
                  <span key={`${frame.id}-${index}`} className={LINE_CLASS[line.kind]}>
                    {line.text}
                    {'\n'}
                  </span>
                ))}
                <span className={styles.cursor} aria-hidden="true" />
              </pre>
            )}
          </div>
        </div>

        {frame.toast ? (
          <div className={styles.toast}>
            <span className={styles.toastTitle}>cmux notify</span>
            {frame.toast}
          </div>
        ) : null}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={goBack}
          disabled={isFirst}
          aria-label="Previous step"
        >
          &larr; Back
        </button>
        <button
          type="button"
          className={styles.stepButtonPrimary}
          onClick={goNext}
          disabled={isLast}
          aria-label="Next step"
        >
          Next &rarr;
        </button>
        <span className={styles.stepCounter} aria-label="Walkthrough progress">
          {step + 1} / {TRIAL_FRAMES.length}
        </span>
      </div>

      <p className={styles.caption} aria-live="polite">
        <span className={styles.captionTitle}>
          Step {step + 1}: {frame.title}
        </span>
        {frame.caption}
      </p>
    </section>
  )
}
