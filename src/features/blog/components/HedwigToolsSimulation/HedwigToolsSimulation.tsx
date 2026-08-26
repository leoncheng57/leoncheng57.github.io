import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactElement, RefObject } from 'react'
import {
  advanceSimulation,
  completeSimulation,
  createSimulationState,
  getEventBounds,
  getSimulationProgress,
  selectTool,
  stepEvent,
  summarizeSimulation,
} from './simulation'
import type { HedwigSimulationState, SimulationScope } from './simulation'
import { getHedwigTool, HEDWIG_TOOLS } from './tools'
import type { HedwigTool, HedwigToolId } from './tools'
import CompactToolView from './CompactToolViews'
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
  const items = ['Triage posted with severity', 'Evidence linked in one log', 'Report ready for handoff']
  return (
    <div className={styles.panelGrid}>
      <div className={styles.signalCard}>
        <span className={styles.pulse} /> SEV-3 demo · high urgency
      </div>
      <ol className={styles.checkList} aria-label="Investigation phases">
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
        <p className={styles.modeType}>Mode A · interactive workspace</p>
        <p className={styles.modeHeading}>Watch, steer, approve</p>
        <p>Start agent → streamed transcript → files, changes, preview, commands</p>
        <span className={styles.statusPill}>{stage < 2 ? 'running' : 'waiting for confirmation'}</span>
      </section>
      <section className={styles.modeCard}>
        <p className={styles.modeType}>Mode B · delegated jobs</p>
        <p className={styles.modeHeading}>Ticket in, change request out</p>
        <p>Dispatched → running → change request opened → human merge</p>
        <span className={styles.statusPill}>{stage < 2 ? 'running' : 'success'}</span>
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
        Accessible summary: weekly requests rise overall from 42k to 68k, with a
        dip in week 3.
      </figcaption>
    </figure>
  )
}

function DatabricksView({ stage }: { stage: number }): ReactElement {
  return (
    <div className={styles.queryPanel}>
      <div><span className={styles.readOnly}>READ ONLY</span><span>sanitized demo</span></div>
      <code>execute_sql · SELECT week, total FROM demo_usage_summary</code>
      <ul aria-label="Read-only query checks">
        <li>Only SELECT, SHOW, DESCRIBE, WITH, EXPLAIN allowed</li>
        <li>{stage > 0 ? 'Lifecycle: pending → running → succeeded' : 'Lifecycle: pending'}</li>
        <li>{stage > 1 ? 'Rows capped with a truncation footer' : 'No rows requested yet'}</li>
      </ul>
    </div>
  )
}

function SlackBuilderView({ stage }: { stage: number }): ReactElement {
  return (
    <div className={styles.builder}>
      <ol aria-label="Bot builder review steps">
        <li data-ready={stage >= 0}><span>1</span>Personality: plain-language purpose</li>
        <li data-ready={stage >= 1}><span>2</span>Test: simulated replies only</li>
        <li data-ready={stage >= 2}><span>3</span>Review: admin approves before launch</li>
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
    ['Hub', 'Status pills gate visibility'],
    ['Search', stage >= 1 ? 'Instant filter + AI reasons' : 'Instant filter only'],
    ['Tryout', stage >= 1 ? 'Sandboxed chat, no install' : 'Awaiting selection'],
    ['Publish', stage >= 2 ? 'Draft → pending review → published' : 'Draft only'],
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
        Human-merged change request · never automatically published
      </p>
    </div>
  )
}

function CmdKDiscoveryView({ stage }: { stage: number }): ReactElement {
  const sources = [
    ['Apps', 'Triage overview', 'production'],
    ['Pages', 'Attainment matrix', 'local'],
    ['MCP servers', 'Read-only SQL', 'production'],
    ['Skills', 'Incident recap', 'experimental'],
  ]

  return (
    <div className={styles.discovery} aria-label="Scripted discovery results">
      <div className={styles.commandQuery}>
        <kbd>⌘K</kbd>
        <span>triage — search apps and pages</span>
        <strong>FIXED QUERY</strong>
      </div>
      <ul aria-label="Lifecycle-labeled results across Apps, Pages, MCP servers, and Skills">
        {sources.map(([source, result, lifecycle], index) => (
          <li key={source} data-ready={index <= stage + 1}>
            <span>{source}</span>
            <strong>{result}</strong>
            <small>{index <= stage + 1 ? lifecycle : 'Searching catalog…'}</small>
          </li>
        ))}
      </ul>
      <p className={styles.resultNote} role="status">
        Local results instant · catalog adds up to three per group · lifecycle labels on every hit
      </p>
    </div>
  )
}

function ToolView({ tool, stage }: { tool: HedwigTool; stage: number }): ReactElement {
  if (tool.kind === 'on-call') return <OnCallView stage={stage} />
  if (tool.kind === 'remote-code') return <RemoteCodeView stage={stage} />
  if (tool.kind === 'customer-api') return <ApiGraphView stage={stage} />
  if (tool.kind === 'databricks-mcp') return <DatabricksView stage={stage} />
  if (tool.kind === 'slack-builder') return <SlackBuilderView stage={stage} />
  if (tool.kind === 'playgrounds-skills') return <PlaygroundsSkillsView stage={stage} />
  return <CmdKDiscoveryView stage={stage} />
}

type ControlIcon = 'previous' | 'next'

function Icon({ name }: { name: ControlIcon }): ReactElement {
  if (name === 'previous') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.5 5-7 7 7 7z" /></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.5 5 7 7-7 7z" /></svg>
}

export default function HedwigToolsSimulation({
  mode = 'catalog',
  toolId = 'on-call',
  ariaLabel = 'Hedwig tools simulation',
}: HedwigToolsSimulationProps): ReactElement {
  const scope: SimulationScope = mode === 'catalog' ? 'catalog' : 'single'
  const compactToolIndex = HEDWIG_TOOLS.indexOf(getHedwigTool(toolId))
  const rootRef = useRef<HTMLElement>(null)
  const visible = usePlaybackVisibility(rootRef)
  const reducedMotion = useReducedMotion()
  const [documentVisible, setDocumentVisible] = useState(() => document.visibilityState !== 'hidden')
  const [state, setState] = useState<HedwigSimulationState>(() => createSimulationState(compactToolIndex))

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
  }, [compactToolIndex, reducedMotion, scope])

  const playing = visible && documentVisible && !reducedMotion && !state.completed && !state.steered
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
  const previousTitle = HEDWIG_TOOLS[Math.max(0, state.toolIndex - 1)].title
  const nextTitle = HEDWIG_TOOLS[Math.min(HEDWIG_TOOLS.length - 1, state.toolIndex + 1)].title
  const chooseTool = (index: number): void => {
    setState(reducedMotion ? completeSimulation(HEDWIG_TOOLS, 'single', index) : selectTool(index))
  }
  const stepStage = (delta: number): void => {
    setState((current) => stepEvent(HEDWIG_TOOLS, current, delta))
  }

  // Compact embeds walk the stages of the one tool they show; the catalog tour
  // keeps its cross-tool arrows because it is the aggregate walkthrough.
  const stageBounds = getEventBounds(HEDWIG_TOOLS, state)
  const controls =
    mode === 'compact'
      ? {
          groupLabel: `Step through ${tool.title} stages`,
          previous: {
            onClick: () => stepStage(-1),
            disabled: stageBounds.atFirst,
            label: `Previous stage of ${tool.title}`,
          },
          next: {
            onClick: () => stepStage(1),
            disabled: stageBounds.atLast,
            label: `Next stage of ${tool.title}`,
          },
        }
      : {
          groupLabel: 'Browse the tool tour',
          previous: {
            onClick: () => chooseTool(Math.max(0, state.toolIndex - 1)),
            disabled: state.toolIndex === 0,
            label: `Previous tool: ${previousTitle}`,
          },
          next: {
            onClick: () => chooseTool(Math.min(HEDWIG_TOOLS.length - 1, state.toolIndex + 1)),
            disabled: state.toolIndex === HEDWIG_TOOLS.length - 1,
            label: `Next tool: ${nextTitle}`,
          },
        }

  return (
    <section
      ref={rootRef}
    className={`${styles.simulation} ${mode === 'compact' ? styles.compact : ''}`}
    aria-label={ariaLabel}
    >
      {reducedMotion && <p className={styles.motionNote} role="status">Reduced motion is enabled; the simulation is shown completed and does not autoplay.</p>}
      <div className={styles.simulationFrame}>
        <div className={styles.topLine}>
          <span>HEDWIG · TOOL SANDBOX</span>
          <span>FICTIONAL DATA</span>
        </div>
        {mode === 'catalog' && (
          <nav aria-label="Hedwig tool selector" className={styles.selector}>
            <ol>
              {HEDWIG_TOOLS.map((candidate, index) => (
                <li key={candidate.id}>
                  <span aria-current={index === state.toolIndex ? 'step' : undefined}>
                    <span>{candidate.number}</span>
                    {candidate.shortTitle}
                  </span>
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
          {mode === 'compact' ? (
            <fieldset disabled className={styles.staticView} aria-label="Autoplaying tool view">
              <p className={styles.staticNotice} role="note">Autoplays · arrows step through this tool&apos;s stages</p>
              <CompactToolView toolId={tool.id} stage={state.eventIndex} />
            </fieldset>
          ) : <ToolView tool={tool} stage={state.eventIndex} />}
          <div className={styles.eventCard}>
            <span>{state.completed ? 'Complete' : `Step ${state.eventIndex + 1} of ${tool.events.length}`}</span>
            <strong>{event.label}</strong>
            <p>{event.detail}</p>
          </div>
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressTrack} role="progressbar" aria-label={`Simulation progress: ${progress.current} of ${progress.total}`} aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.current}>
            <span style={{ width: `${progress.percent}%` }} />
          </div>
          <span aria-hidden="true">{progress.current}/{progress.total}</span>
        </div>
      </div>
      <div className={styles.controls} aria-label={controls.groupLabel}>
          <button
            type="button"
            onClick={controls.previous.onClick}
            disabled={controls.previous.disabled}
            aria-label={controls.previous.label}
            data-tooltip={controls.previous.label}
          >
            <Icon name="previous" />
          </button>
          <button
            type="button"
            onClick={controls.next.onClick}
            disabled={controls.next.disabled}
            aria-label={controls.next.label}
            data-tooltip={controls.next.label}
          >
            <Icon name="next" />
          </button>
      </div>
      <p className={styles.visuallyHidden}>
        {summarizeSimulation(HEDWIG_TOOLS, state)}
      </p>
    </section>
  )
}
