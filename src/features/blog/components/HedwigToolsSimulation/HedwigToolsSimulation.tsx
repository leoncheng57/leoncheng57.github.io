import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactElement, RefObject } from 'react'
import {
  advanceSimulation,
  completeSimulation,
  createSimulationState,
  getSimulationProgress,
  selectTool,
  summarizeSimulation,
} from './simulation'
import type { HedwigSimulationState, SimulationScope } from './simulation'
import { getHedwigTool, HEDWIG_TOOLS } from './tools'
import type { HedwigTool, HedwigToolId } from './tools'
import styles from './HedwigToolsSimulation.module.css'

const EVENT_INTERVAL_MS = 1600

export interface HedwigToolsSimulationProps {
  mode?: 'catalog' | 'compact'
  toolId?: HedwigToolId
  ariaLabel?: string
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = (): void => setReduced(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  return reduced
}

function usePlaybackVisibility(ref: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0),
      { threshold: 0.15 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

function OnCallView({ stage }: { stage: number }): ReactElement {
  const items = ['Demo alert cluster', 'Recent change summary', 'Runbook checks']
  return (
    <div className={styles.panelGrid}>
      <div className={styles.signalCard}>
        <span className={styles.pulse} /> Priority 2 · fictional
      </div>
      <ol className={styles.checkList} aria-label="Investigation evidence">
        {items.map((item, index) => (
          <li key={item} data-ready={index <= stage}>
            {item}
            <span>{index <= stage ? 'ready' : 'queued'}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function RemoteCodeView({ stage }: { stage: number }): ReactElement {
  return (
    <div className={styles.modeGrid} aria-label="Two separate remote runner modes">
      <section className={styles.modeCard}>
        <p className={styles.modeType}>Mode A · async delegation</p>
        <p className={styles.modeHeading}>Send and return later</p>
        <p>Fixed task brief → isolated run → reviewable result</p>
        <span className={styles.statusPill}>{stage < 2 ? 'delegated run' : 'result ready'}</span>
      </section>
      <section className={styles.modeCard}>
        <p className={styles.modeType}>Mode B · interactive workspace</p>
        <p className={styles.modeHeading}>Stay and steer live</p>
        <p>Open workspace → observe steps → guide the session</p>
        <span className={styles.statusPill}>{stage < 2 ? 'workspace active' : 'session summary'}</span>
      </section>
    </div>
  )
}

function ApiGraphView({ stage }: { stage: number }): ReactElement {
  const values = [42, 51, 47, 68]
  return (
    <figure
      className={styles.graph}
      aria-label="Fictional weekly API requests: week one 42 thousand, week two 51 thousand, week three 47 thousand, week four 68 thousand"
    >
      <div className={styles.bars} aria-hidden="true">
        {values.map((value, index) => (
          <div
            key={value}
            style={{ '--bar-height': `${stage === 0 ? 25 : value}%` } as CSSProperties}
          >
            <span>{value}k</span>
            <i>W{index + 1}</i>
          </div>
        ))}
      </div>
      <figcaption>
        Accessible summary: fictional weekly requests rise overall from 42k to 68k, with a
        dip in week 3.
      </figcaption>
    </figure>
  )
}

function DataHelperView({ stage }: { stage: number }): ReactElement {
  return (
    <div className={styles.conversation}>
      <div><span>Fixed demo question</span><strong>How is “active workspace” defined?</strong></div>
      <div data-visible={stage > 0}>
        <span>Helper draft</span>
        <strong>Definition found · owner and freshness attached</strong>
      </div>
      <p>{stage > 1 ? 'Ready for data-team verification' : 'Checking the fictional catalog…'}</p>
    </div>
  )
}

function DatabricksView({ stage }: { stage: number }): ReactElement {
  return (
    <div className={styles.queryPanel}>
      <div><span className={styles.readOnly}>READ ONLY</span><span>sanitized demo</span></div>
      <code>SELECT week, total FROM demo.usage_summary</code>
      <ul aria-label="Read-only query checks">
        <li>Mutation operations unavailable</li>
        <li>{stage > 0 ? 'Policy check passed' : 'Policy check pending'}</li>
        <li>{stage > 1 ? '3 aggregate rows summarized' : 'No rows requested yet'}</li>
      </ul>
    </div>
  )
}

function SlackBuilderView({ stage }: { stage: number }): ReactElement {
  return (
    <div className={styles.builder}>
      <ol aria-label="Bot builder review steps">
        <li data-ready={stage >= 0}><span>1</span>Purpose: fictional weekly digest</li>
        <li data-ready={stage >= 1}><span>2</span>Permissions: display for review</li>
        <li data-ready={stage >= 2}><span>3</span>Submit for review</li>
      </ol>
      <div className={styles.stopGate}>
        <strong>STOP</strong>
        <span>Submit for review · no bot provisioned</span>
      </div>
    </div>
  )
}

function PlaygroundsSkillsView({ stage }: { stage: number }): ReactElement {
  const steps = [
    ['Idea', 'Fictional triage helper'],
    ['Playground', stage >= 1 ? 'Feature gate enabled' : 'Awaiting gate'],
    ['Evidence', stage >= 1 ? 'Review packet ready' : 'Collection queued'],
    ['Outcome', stage >= 2 ? 'Skill review selected' : 'Application or skill review'],
  ]

  return (
    <div className={styles.reviewFlow} aria-label="Playground and marketplace review flow">
      <ol>
        {steps.map(([label, detail], index) => (
          <li key={label} data-ready={index <= stage + 1}>
            <span>{label}</span>
            <strong>{detail}</strong>
          </li>
        ))}
      </ol>
      <p className={styles.reviewBoundary} role="status">
        Human review required · never automatically published
      </p>
    </div>
  )
}

function CmdKDiscoveryView({ stage }: { stage: number }): ReactElement {
  const sources = [
    ['Apps', 'Triage overview', 'Approved'],
    ['MCPs', 'Read-only signals', 'Permitted'],
    ['Skills', 'Incident summary', 'In review'],
    ['Docs', 'Response guide', 'Current'],
  ]

  return (
    <div className={styles.discovery} aria-label="Scripted discovery results">
      <div className={styles.commandQuery}>
        <kbd>⌘K</kbd>
        <span>approved incident triage</span>
        <strong>FIXED QUERY</strong>
      </div>
      <ul aria-label="Permission-safe results across Apps, MCPs, Skills, and Docs">
        {sources.map(([source, result, status], index) => (
          <li key={source} data-ready={index <= stage + 1}>
            <span>{source}</span>
            <strong>{result}</strong>
            <small>{index <= stage + 1 ? status : 'Checking'}</small>
          </li>
        ))}
      </ul>
      <p className={styles.resultNote} role="status">
        Generic results only · lifecycle and permission checks applied
      </p>
    </div>
  )
}

function ToolView({ tool, stage }: { tool: HedwigTool; stage: number }): ReactElement {
  if (tool.kind === 'on-call') return <OnCallView stage={stage} />
  if (tool.kind === 'remote-code') return <RemoteCodeView stage={stage} />
  if (tool.kind === 'customer-api') return <ApiGraphView stage={stage} />
  if (tool.kind === 'data-helper') return <DataHelperView stage={stage} />
  if (tool.kind === 'databricks-mcp') return <DatabricksView stage={stage} />
  if (tool.kind === 'slack-builder') return <SlackBuilderView stage={stage} />
  if (tool.kind === 'playgrounds-skills') return <PlaygroundsSkillsView stage={stage} />
  return <CmdKDiscoveryView stage={stage} />
}

export default function HedwigToolsSimulation({
  mode = 'catalog',
  toolId = 'on-call',
  ariaLabel = 'Hedwig tools simulation',
}: HedwigToolsSimulationProps): ReactElement {
  const scope: SimulationScope = mode === 'catalog' ? 'catalog' : 'single'
  const compactToolIndex = HEDWIG_TOOLS.indexOf(getHedwigTool(toolId))
  const rootRef = useRef<HTMLElement>(null)
  const selectorButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const visible = usePlaybackVisibility(rootRef)
  const reducedMotion = useReducedMotion()
  const [documentVisible, setDocumentVisible] = useState(() => document.visibilityState !== 'hidden')
  const [state, setState] = useState<HedwigSimulationState>(() => createSimulationState(compactToolIndex))
  const [wantsPlayback, setWantsPlayback] = useState(true)

  useEffect(() => {
    const update = (): void => setDocumentVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    const initial = reducedMotion
      ? completeSimulation(HEDWIG_TOOLS, scope, compactToolIndex)
      : createSimulationState(compactToolIndex)
    setState(initial)
    setWantsPlayback(!reducedMotion)
  }, [compactToolIndex, reducedMotion, scope])

  const playing = wantsPlayback && visible && documentVisible && !reducedMotion && !state.completed
  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setTimeout(
      () => setState((current) => advanceSimulation(HEDWIG_TOOLS, current, scope)),
      EVENT_INTERVAL_MS
    )
    return () => window.clearTimeout(timer)
  }, [playing, scope, state])

  const tool = HEDWIG_TOOLS[state.toolIndex]
  const event = tool.events[state.eventIndex]
  const progress = getSimulationProgress(HEDWIG_TOOLS, state, scope)
  const chooseTool = (index: number): void => {
    setState(reducedMotion ? completeSimulation(HEDWIG_TOOLS, 'single', index) : selectTool(index))
  }
  const handleSelectorKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ): void => {
    let targetIndex: number | undefined

    if (event.key === 'ArrowLeft') {
      targetIndex = (index - 1 + HEDWIG_TOOLS.length) % HEDWIG_TOOLS.length
    }
    if (event.key === 'ArrowRight') targetIndex = (index + 1) % HEDWIG_TOOLS.length
    if (event.key === 'Home') targetIndex = 0
    if (event.key === 'End') targetIndex = HEDWIG_TOOLS.length - 1
    if (targetIndex === undefined) return

    event.preventDefault()
    chooseTool(targetIndex)
    selectorButtonRefs.current[targetIndex]?.focus()
  }
  const restart = (): void => {
    setState(
      reducedMotion
        ? completeSimulation(HEDWIG_TOOLS, scope, compactToolIndex)
        : createSimulationState(scope === 'single' ? compactToolIndex : 0)
    )
    setWantsPlayback(!reducedMotion)
  }

  return (
    <section
      ref={rootRef}
      className={`${styles.simulation} ${mode === 'compact' ? styles.compact : ''}`}
      aria-label={ariaLabel}
    >
      <div className={styles.topLine}>
        <span>HEDWIG · TOOL SANDBOX</span>
        <span>FICTIONAL DATA</span>
      </div>
      {mode === 'catalog' && (
        <nav aria-label="Hedwig tool selector" className={styles.selector}>
          <ol>
            {HEDWIG_TOOLS.map((candidate, index) => (
              <li key={candidate.id}>
                <button
                  ref={(node) => {
                    selectorButtonRefs.current[index] = node
                  }}
                  type="button"
                  onClick={() => chooseTool(index)}
                  onKeyDown={(event) => handleSelectorKeyDown(event, index)}
                  aria-current={index === state.toolIndex ? 'step' : undefined}
                >
                  <span>{candidate.number}</span>
                  {candidate.shortTitle}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className={styles.stage}>
        <header className={styles.toolHeader}>
          <p>Tool {tool.number} / {String(HEDWIG_TOOLS.length).padStart(2, '0')}</p>
          <p className={styles.toolTitle}>{tool.title}</p>
          <p>{tool.summary}</p>
        </header>
        <ToolView tool={tool} stage={state.eventIndex} />
        <div className={styles.eventCard}>
          <span>{state.completed ? 'Complete' : `Step ${state.eventIndex + 1} of ${tool.events.length}`}</span>
          <strong>{event.label}</strong>
          <p>{event.detail}</p>
        </div>
      </div>
      <div className={styles.progressRow}>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Simulation progress"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.current}
        >
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <span>{progress.current}/{progress.total}</span>
      </div>
      <div className={styles.controls}>
        {mode === 'catalog' && (
          <button
            type="button"
            onClick={() => chooseTool(Math.max(0, state.toolIndex - 1))}
            disabled={state.toolIndex === 0}
          >
            Previous tool
          </button>
        )}
        <button
          type="button"
          onClick={() => setWantsPlayback((current) => !current)}
          disabled={reducedMotion || state.completed}
        >
          {wantsPlayback ? 'Pause' : 'Resume'}
        </button>
        <button type="button" onClick={restart}>Restart</button>
        {mode === 'catalog' && (
          <button
            type="button"
            onClick={() => chooseTool(Math.min(HEDWIG_TOOLS.length - 1, state.toolIndex + 1))}
            disabled={state.toolIndex === HEDWIG_TOOLS.length - 1}
          >
            Next tool
          </button>
        )}
      </div>
      <p className={styles.disclosure}>
        All names, metrics, incidents, queries, and results shown here are fictional and
        sanitized. This simulation makes no network calls.
      </p>
      {reducedMotion && (
        <p className={styles.motionNote}>
          Reduced motion is enabled; the simulation is shown completed and does not autoplay.
        </p>
      )}
      <p className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
        {summarizeSimulation(HEDWIG_TOOLS, state)}
      </p>
    </section>
  )
}
