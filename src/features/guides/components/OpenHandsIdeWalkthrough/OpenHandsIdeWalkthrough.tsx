import { useState } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import { IDE_FRAMES } from './frames'
import type { IdeFrame, SidePanel, TaskItem, TranscriptRow } from './frames'
import styles from './OpenHandsIdeWalkthrough.module.css'

/** Nav items, in the order the real application renders them. */
const NAV_ITEMS = [
  'Conversations',
  'Manager runs',
  'Terminal',
  'Notifications',
  'Agent settings',
  'Tools',
  'Contributing',
]

/**
 * Right-hand icon rail, top to bottom, as titled in the real application.
 * The glyphs stand in for its lucide-style icons at this size.
 */
const RAIL_ITEMS: Array<{ label: string; glyph: string }> = [
  { label: 'Files', glyph: '▤' },
  { label: 'Changes', glyph: '⇄' },
  { label: 'Preview', glyph: '▭' },
  { label: 'Commands', glyph: '$' },
  { label: 'Merge requests', glyph: '⑂' },
]

const TASK_GLYPH: Record<TaskItem['state'], string> = {
  done: '✓',
  in_progress: '◐',
  todo: '○',
}

const TASK_GLYPH_CLASS: Record<TaskItem['state'], string> = {
  done: styles.taskGlyphDone,
  in_progress: styles.taskGlyphActive,
  todo: styles.taskGlyphTodo,
}

/** Pill tone per execution status, mirroring the app's status colours. */
const STATUS_TONE: Record<NonNullable<IdeFrame['status']>, string> = {
  running: styles.pillBusy,
  waiting_for_confirmation: styles.pillWarn,
  finished: styles.pillOk,
}

function statusText(status: NonNullable<IdeFrame['status']>): string {
  return status.replace(/_/g, ' ')
}

function TranscriptRowView({ row }: { row: TranscriptRow }): ReactElement {
  if (row.kind === 'status') {
    return (
      <div className={styles.separator}>
        <span className={styles.separatorRule} aria-hidden="true" />
        <span className={styles.separatorText}>
          {row.status} · {row.time}
        </span>
        <span className={styles.separatorRule} aria-hidden="true" />
      </div>
    )
  }

  if (row.kind === 'user') {
    return (
      <div className={styles.userRow}>
        <span className={styles.userBubble}>{row.text}</span>
        <span className={styles.rowTime}>{row.time}</span>
      </div>
    )
  }

  if (row.kind === 'agent') {
    return (
      <div className={styles.agentRow}>
        <p className={styles.agentText}>{row.text}</p>
        <span className={styles.rowTime}>{row.time}</span>
      </div>
    )
  }

  if (row.kind === 'group') {
    return (
      <div className={styles.toolRow}>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
        <span className={styles.toolGroupLabel}>{row.count} actions completed</span>
        <span className={styles.rowTime}>{row.time}</span>
      </div>
    )
  }

  return (
    <div className={styles.toolRow}>
      <span className={styles.chevron} aria-hidden="true">
        ▸
      </span>
      <span className={styles.bullet} aria-hidden="true">
        ●
      </span>
      <span className={styles.toolName}>{row.tool}</span>
      {row.risk ? <span className={styles.riskBadge}>{row.risk}</span> : null}
      <span className={styles.toolDetail}>{row.detail}</span>
      <span className={styles.rowTime}>{row.time}</span>
    </div>
  )
}

function TaskListColumn({ tasks }: { tasks: TaskItem[] }): ReactElement {
  const done = tasks.filter((task) => task.state === 'done').length
  return (
    <aside className={styles.taskColumn} aria-label="Simulated task list">
      <p className={styles.columnHeading}>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
        Task list
        <span className={styles.taskCounter}>
          {done}/{tasks.length} done
        </span>
      </p>
      <ul className={styles.taskList}>
        {tasks.map((task) => (
          <li key={task.title} className={styles.taskItem}>
            <span className={`${styles.taskGlyph} ${TASK_GLYPH_CLASS[task.state]}`} aria-hidden="true">
              {TASK_GLYPH[task.state]}
            </span>
            <span className={task.state === 'done' ? styles.taskTitleDone : styles.taskTitle}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function SidePanelColumn({ panel }: { panel: SidePanel }): ReactElement {
  if (panel.kind === 'changes') {
    return (
      <aside className={styles.panelColumn} aria-label="Simulated changes panel">
        <p className={styles.columnHeading}>Changes</p>
        <ul className={styles.changeList}>
          {panel.files.map((file) => (
            <li key={file.path} className={styles.changeItem}>
              <span className={styles.changePath}>{file.path}</span>
              <span className={styles.changeStat}>
                <span className={styles.added}>+{file.added}</span>{' '}
                <span className={styles.removed}>−{file.removed}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  if (panel.kind === 'preview') {
    return (
      <aside className={styles.panelColumn} aria-label="Simulated preview panel">
        <p className={styles.columnHeading}>Preview</p>
        <p className={styles.previewStatus}>
          <span className={styles.previewDot} aria-hidden="true" />
          {panel.label}
          <span className={styles.previewPort}>:{panel.port}</span>
        </p>
        <div className={styles.previewFrame} aria-hidden="true">
          <span className={styles.previewBarWide} />
          <span className={styles.previewBar} />
          <span className={styles.previewBar} />
          <span className={styles.previewBarWide} />
        </div>
        <p className={styles.panelFootnote}>Open in new tab ↗</p>
      </aside>
    )
  }

  return (
    <aside className={styles.panelColumn} aria-label="Simulated merge requests panel">
      <p className={styles.columnHeading}>Merge requests</p>
      <div className={styles.mrCard}>
        <p className={styles.mrTitle}>{panel.title}</p>
        <p className={styles.mrRef}>{panel.ref}</p>
        <p className={styles.mrRow}>
          <span className={styles.pipelineChip}>{panel.pipeline}</span>
          <span className={panel.mergeable ? styles.mergeButton : styles.mergeButtonOff}>Merge</span>
        </p>
        <p className={styles.mrSection}>▸ Description</p>
        <p className={styles.mrSection}>▸ Comments</p>
        <p className={styles.mrSection}>▸ Pipeline progress</p>
      </div>
    </aside>
  )
}

function HubBody({ frame }: { frame: IdeFrame }): ReactElement | null {
  if (!frame.hub) return null
  const { projects, selected, prompt, worktree } = frame.hub
  return (
    <div className={styles.hubBody}>
      <p className={styles.hubHeading}>What should the agent do?</p>
      <p className={styles.hubSub}>
        Pick a project, describe the task, and watch the agent work — steer it any time.
      </p>
      <p className={styles.hubLabel}>Your projects ({projects.length})</p>
      <ul className={styles.projectGrid}>
        {projects.map((project) => (
          <li
            key={project}
            className={project === selected ? styles.projectCardActive : styles.projectCard}
          >
            📁 {project}
          </li>
        ))}
      </ul>
      <p className={styles.worktreeRow}>
        <span className={styles.checkbox} aria-hidden="true">
          {worktree ? '☑' : '☐'}
        </span>
        <span>
          <span className={styles.worktreeLabel}>Use a new git worktree for each session</span>
          <span className={styles.worktreeHelp}>
            Recommended for parallel work. Starts from the selected project&apos;s committed HEAD;
            uncommitted changes stay in the original checkout.
          </span>
        </span>
      </p>
      <p className={styles.promptBox}>{prompt}</p>
      <p className={styles.hubActions}>
        <span className={styles.modeChipActive}>🔨 Build</span>
        <span className={styles.modeChip}>📋 Plan</span>
        <span className={styles.startButton}>Start agent</span>
      </p>
    </div>
  )
}

function ConversationBody({ frame }: { frame: IdeFrame }): ReactElement {
  const status = frame.status ?? 'running'
  const mode = frame.mode ?? 'build'
  return (
    <>
      <div className={styles.convHeader}>
        <span className={styles.backLink}>← Conversations</span>
        <span className={styles.convTitle}>{frame.conversationTitle}</span>
        <span className={`${styles.pill} ${STATUS_TONE[status]}`}>{statusText(status)}</span>
        {mode === 'plan' ? <span className={styles.planBadge}>📋 plan mode</span> : null}
        <span className={styles.workspaceBadge}>🗂️ isolated workspace</span>
        <span className={styles.headerButtons} aria-hidden="true">
          <span className={styles.ghostButton}>Run</span>
          <span className={styles.ghostButton}>Pause</span>
          <span className={styles.ghostButton}>Delete</span>
        </span>
      </div>

      {mode === 'plan' ? (
        <p className={styles.planBanner}>
          <strong>Plan mode</strong> — the agent researches and proposes a plan; write actions are
          held for your approval.
          <span className={styles.planActions}>
            <span className={styles.primaryChip}>✅ Approve plan &amp; build</span>
            <span className={styles.ghostButton}>Exit plan mode</span>
          </span>
        </p>
      ) : null}

      {frame.confirmation ? (
        <p className={styles.confirmStrip}>
          The agent wants to perform a write action while in plan mode.
          <span className={styles.planActions}>
            <span className={styles.primaryChip}>Approve</span>
            <span className={styles.ghostButton}>Reject</span>
          </span>
        </p>
      ) : null}

      <div className={styles.workArea}>
        <div className={styles.transcript}>
          {(frame.transcript ?? []).map((row, index) => (
            <TranscriptRowView key={`${frame.id}-${index}`} row={row} />
          ))}
        </div>
        {frame.tasks ? <TaskListColumn tasks={frame.tasks} /> : null}
        {frame.panel ? <SidePanelColumn panel={frame.panel} /> : null}
        <div className={styles.rail} aria-hidden="true">
          {RAIL_ITEMS.map((item) => (
            <span key={item.label} className={styles.railIcon} title={`Open ${item.label}`}>
              {item.glyph}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.composer}>
        <span className={styles.composerPlaceholder}>Steer the agent…</span>
        <span className={styles.composerControls}>
          <span className={mode === 'build' ? styles.modeChipActive : styles.modeChip}>
            🔨 Build
          </span>
          <span className={mode === 'plan' ? styles.modeChipActive : styles.modeChip}>
            📋 Plan
          </span>
          <span className={styles.modelSelect}>GPT-5.6 Sol — OpenAI EU · strong</span>
          <span className={styles.sendButton}>Send</span>
        </span>
      </div>

      <div className={styles.statusBar}>
        <span>📁 checkout-service</span>
        <span className={styles.statusSpacer} />
        {frame.contextPercent ? <span>{frame.contextPercent} context</span> : null}
        {frame.cost ? <span>{frame.cost}</span> : null}
      </div>
    </>
  )
}

/**
 * A scripted, press-through walkthrough of one task in the custom OpenHands
 * IDE — project picker, plan-mode approval gate, diff, preview, and draft
 * pull request — rendered as a mock application window. Advanced only by the
 * Next/Back buttons or arrow keys: no free input, no autoplay.
 */
export default function OpenHandsIdeWalkthrough({
  ariaLabel = 'Guided walkthrough of the custom OpenHands IDE',
  inline = false,
}: {
  ariaLabel?: string
  /**
   * Neutralises the breakout width. In a guide the walkthrough deliberately
   * spans the page frame, which only works because the prose column starts at
   * that frame's left edge; anywhere else (the component catalogue, say) it
   * would misalign, so hosts outside a guide pass `inline`.
   */
  inline?: boolean
}): ReactElement {
  const [step, setStep] = useState(0)
  const frame = IDE_FRAMES[step]
  const isFirst = step === 0
  const isLast = step === IDE_FRAMES.length - 1

  const goBack = (): void => setStep((current) => Math.max(0, current - 1))
  const goNext = (): void => setStep((current) => Math.min(IDE_FRAMES.length - 1, current + 1))

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

  return (
    <section
      className={inline ? `${styles.walkthrough} ${styles.inline}` : styles.walkthrough}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      <p className={styles.banner}>
        <span className={styles.bannerTag}>Simulation</span>
        <span>
          This is a scripted mock-up, not the running app and not a video. One task from the
          project picker to a draft pull request — step through it with the buttons, or the arrow
          keys while a button is focused.
        </span>
      </p>

      <div className={styles.window}>
        <div className={styles.chrome}>
          <span className={styles.trafficLights} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.chromeTitle}>OpenHands Local — localhost:5173 (simulated)</span>
        </div>

        <div className={styles.nav} aria-hidden="true">
          <span className={styles.brand}>
            <strong>OpenHands</strong> Local
          </span>
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              className={item === 'Conversations' ? styles.navItemActive : styles.navItem}
            >
              {item}
            </span>
          ))}
        </div>

        {frame.screen === 'hub' ? <HubBody frame={frame} /> : <ConversationBody frame={frame} />}

        {frame.toast ? (
          <div className={styles.toast}>
            <span className={styles.toastTitle}>Notification</span>
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
          {step + 1} / {IDE_FRAMES.length}
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
