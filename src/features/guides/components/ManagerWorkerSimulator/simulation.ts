/**
 * Pure, deterministic simulation of a manager/worker parallel-agent run.
 *
 * Everything in this module is side-effect free and seeded: the same
 * `SimulatorConfig` always yields the exact same timeline, which keeps the
 * playground scrubbable/steppable and makes the logic unit-testable.
 *
 * Time is measured in abstract "ticks"; the UI presents one tick as roughly
 * one minute of wall-clock time.
 */

export type AutonomyLevel = 'ask-first' | 'draft-pr' | 'full-auto'
export type TaskSizeVariance = 'low' | 'medium' | 'high'

export interface SimulatorConfig {
  /** Number of parallel workers (clamped to 1..5). */
  workers: number
  /** How much a human gates each worker's progress. */
  autonomy: AutonomyLevel
  /** How much task sizes differ between workers. */
  variance: TaskSizeVariance
  /** Ticks before the human notices a request for approval/review (clamped to 0..30). */
  reviewLatency: number
  /** PRNG seed; same seed + config => identical timeline. */
  seed: number
}

export type SimPhase =
  | 'plan'
  | 'dispatch'
  | 'monitor'
  | 'queued'
  | 'work'
  | 'wait-approval'
  | 'approval'
  | 'wait-review'
  | 'review'
  | 'merge'
  | 'done'

export type Actor = 'human' | 'ai' | 'waiting'

export interface PhaseInfo {
  label: string
  actor: Actor
}

/** Display metadata for each phase, including who is "driving" it. */
export const PHASE_INFO: Record<SimPhase, PhaseInfo> = {
  plan: { label: 'Planning & task specs', actor: 'human' },
  dispatch: { label: 'Dispatching workers', actor: 'ai' },
  monitor: { label: 'Monitoring workers', actor: 'ai' },
  queued: { label: 'Waiting for dispatch', actor: 'waiting' },
  work: { label: 'Working', actor: 'ai' },
  'wait-approval': { label: 'Waiting for approval', actor: 'waiting' },
  approval: { label: 'Human approving plan', actor: 'human' },
  'wait-review': { label: 'Waiting for review', actor: 'waiting' },
  review: { label: 'Human reviewing draft PR', actor: 'human' },
  merge: { label: 'Merging', actor: 'ai' },
  done: { label: 'Done', actor: 'ai' },
}

export interface Segment {
  phase: SimPhase
  start: number
  end: number
}

export interface LaneTimeline {
  id: string
  label: string
  role: 'manager' | 'worker'
  segments: Segment[]
  /** Total ticks this lane spent blocked on a human (wait-* phases). */
  waitTicks: number
}

export interface SimulationResult {
  config: SimulatorConfig
  lanes: LaneTimeline[]
  /** Timestamp of the last event across all lanes (the makespan). */
  totalTicks: number
  /** Sum of every worker's human-blocked wait ticks. */
  totalWaitTicks: number
}

export const MIN_WORKERS = 1
export const MAX_WORKERS = 5
export const MIN_REVIEW_LATENCY = 0
export const MAX_REVIEW_LATENCY = 30

/** The only guide slug the playground route serves. */
export const SIMULATOR_GUIDE_SLUG = 'manager-worker-parallel-agents'

export const DEFAULT_CONFIG: SimulatorConfig = {
  workers: 3,
  autonomy: 'draft-pr',
  variance: 'medium',
  reviewLatency: 8,
  seed: 7,
}

// -------------------------------------------------------------- tuning knobs
const PLAN_BASE_TICKS = 6 // shared planning before any specs are written
const PLAN_PER_WORKER_TICKS = 2 // writing each worker's task spec
const DISPATCH_PER_WORKER_TICKS = 2 // worktree + prompt setup per worker
const WORK_BASE_TICKS = 24 // average size of one worker's task
const PROPOSAL_TICKS = 3 // ask-first: worker drafts its approach first
const APPROVAL_TICKS = 2 // human approving a proposed approach
const REVIEW_TICKS = 5 // human reviewing a draft PR
const MERGE_TICKS = 2 // merge + cleanup

const VARIANCE_AMPLITUDE: Record<TaskSizeVariance, number> = {
  low: 0.15,
  medium: 0.45,
  high: 0.8,
}

// ------------------------------------------------------------------- helpers

/** Mulberry32: tiny deterministic PRNG. Returns values in [0, 1). */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function clampConfig(config: SimulatorConfig): SimulatorConfig {
  return {
    ...config,
    workers: Math.min(MAX_WORKERS, Math.max(MIN_WORKERS, Math.round(config.workers))),
    reviewLatency: Math.min(
      MAX_REVIEW_LATENCY,
      Math.max(MIN_REVIEW_LATENCY, Math.round(config.reviewLatency))
    ),
    seed: Math.floor(config.seed),
  }
}

function pushSegment(segments: Segment[], phase: SimPhase, start: number, end: number): void {
  if (end <= start) return
  segments.push({ phase, start, end })
}

interface HumanRequest {
  workerIndex: number
  kind: 'approval' | 'review'
  readyAt: number
}

// ----------------------------------------------------------------- simulate

/**
 * Runs the whole scenario and returns a deterministic set of lane timelines.
 *
 * Model:
 * - The human writes the plan + per-worker task specs (human touchpoint).
 * - The manager agent dispatches workers sequentially (worktrees, prompts).
 * - Workers run in parallel. Depending on autonomy they hit zero, one, or
 *   two human gates (approach approval, draft-PR review).
 * - There is exactly ONE human: concurrent requests queue, which is where
 *   visible wait time accumulates. Each request also incurs `reviewLatency`
 *   ticks before the human notices it at all.
 */
export function simulate(rawConfig: SimulatorConfig): SimulationResult {
  const config = clampConfig(rawConfig)
  const random = createSeededRandom(config.seed)

  // Draw worker task sizes up-front, in worker order, so the sequence of PRNG
  // calls is stable regardless of scheduling order below.
  const amplitude = VARIANCE_AMPLITUDE[config.variance]
  const workDurations: number[] = []
  for (let i = 0; i < config.workers; i += 1) {
    const swing = (random() * 2 - 1) * amplitude
    workDurations.push(Math.max(6, Math.round(WORK_BASE_TICKS * (1 + swing))))
  }

  const planEnd = PLAN_BASE_TICKS + PLAN_PER_WORKER_TICKS * config.workers

  const managerSegments: Segment[] = []
  pushSegment(managerSegments, 'plan', 0, planEnd)

  const workerLanes: LaneTimeline[] = []
  const dispatchEnds: number[] = []
  for (let i = 0; i < config.workers; i += 1) {
    const dispatchStart = planEnd + i * DISPATCH_PER_WORKER_TICKS
    const dispatchEnd = dispatchStart + DISPATCH_PER_WORKER_TICKS
    pushSegment(managerSegments, 'dispatch', dispatchStart, dispatchEnd)
    dispatchEnds.push(dispatchEnd)

    const segments: Segment[] = []
    pushSegment(segments, 'queued', 0, dispatchEnd)
    workerLanes.push({
      id: `worker-${i + 1}`,
      label: `Worker ${i + 1}`,
      role: 'worker',
      segments,
      waitTicks: 0,
    })
  }

  // Per-worker cursor state machine, advanced by the human-scheduling loop.
  const cursors = workerLanes.map((lane, i) => ({ lane, doneAt: 0, workLeft: workDurations[i] }))
  let humanFreeAt = 0
  const pending: HumanRequest[] = []

  const finishWorker = (i: number, from: number): void => {
    const lane = cursors[i].lane
    pushSegment(lane.segments, 'merge', from, from + MERGE_TICKS)
    cursors[i].doneAt = from + MERGE_TICKS
  }

  // Seed the initial per-worker activity after dispatch.
  for (let i = 0; i < config.workers; i += 1) {
    const lane = cursors[i].lane
    const startAt = dispatchEnds[i]
    if (config.autonomy === 'ask-first') {
      pushSegment(lane.segments, 'work', startAt, startAt + PROPOSAL_TICKS)
      pending.push({ workerIndex: i, kind: 'approval', readyAt: startAt + PROPOSAL_TICKS })
    } else {
      const workEnd = startAt + cursors[i].workLeft
      pushSegment(lane.segments, 'work', startAt, workEnd)
      if (config.autonomy === 'draft-pr') {
        pending.push({ workerIndex: i, kind: 'review', readyAt: workEnd })
      } else {
        finishWorker(i, workEnd)
      }
    }
  }

  // Serve human requests earliest-first; a served request may enqueue the
  // worker's next request (approval -> work -> review).
  while (pending.length > 0) {
    pending.sort((a, b) => a.readyAt - b.readyAt || a.workerIndex - b.workerIndex)
    const request = pending.shift() as HumanRequest
    const lane = cursors[request.workerIndex].lane

    const noticedAt = request.readyAt + config.reviewLatency
    const serviceStart = Math.max(noticedAt, humanFreeAt)
    const serviceTicks = request.kind === 'approval' ? APPROVAL_TICKS : REVIEW_TICKS
    const serviceEnd = serviceStart + serviceTicks
    humanFreeAt = serviceEnd

    const waitPhase: SimPhase = request.kind === 'approval' ? 'wait-approval' : 'wait-review'
    pushSegment(lane.segments, waitPhase, request.readyAt, serviceStart)
    lane.waitTicks += serviceStart - request.readyAt
    pushSegment(lane.segments, request.kind, serviceStart, serviceEnd)

    if (request.kind === 'approval') {
      const workEnd = serviceEnd + cursors[request.workerIndex].workLeft
      pushSegment(lane.segments, 'work', serviceEnd, workEnd)
      pending.push({ workerIndex: request.workerIndex, kind: 'review', readyAt: workEnd })
    } else {
      finishWorker(request.workerIndex, serviceEnd)
    }
  }

  const lastWorkerDone = Math.max(...cursors.map((cursor) => cursor.doneAt))
  const monitorStart = planEnd + config.workers * DISPATCH_PER_WORKER_TICKS
  pushSegment(managerSegments, 'monitor', monitorStart, lastWorkerDone)

  const managerLane: LaneTimeline = {
    id: 'manager',
    label: 'Manager',
    role: 'manager',
    segments: managerSegments,
    waitTicks: 0,
  }

  const lanes = [managerLane, ...workerLanes]
  const totalTicks = Math.max(
    ...lanes.map((lane) => lane.segments[lane.segments.length - 1]?.end ?? 0)
  )
  const totalWaitTicks = workerLanes.reduce((sum, lane) => sum + lane.waitTicks, 0)

  return { config, lanes, totalTicks, totalWaitTicks }
}

// -------------------------------------------------------- time-based queries

/** Segment active at time `t` on a lane, or null when the lane is finished. */
export function getSegmentAt(lane: LaneTimeline, t: number): Segment | null {
  for (const segment of lane.segments) {
    if (t >= segment.start && t < segment.end) return segment
  }
  return null
}

/** Phase shown for a lane at time `t` ("done" once its last segment ended). */
export function getPhaseAt(lane: LaneTimeline, t: number): SimPhase {
  const active = getSegmentAt(lane, t)
  if (active) return active.phase
  const last = lane.segments[lane.segments.length - 1]
  if (last && t >= last.end) return 'done'
  return 'queued'
}

/** Human-blocked wait ticks a lane has accumulated up to time `t`. */
export function getWaitTicksAt(lane: LaneTimeline, t: number): number {
  let total = 0
  for (const segment of lane.segments) {
    if (segment.phase !== 'wait-approval' && segment.phase !== 'wait-review') continue
    total += Math.max(0, Math.min(t, segment.end) - segment.start)
  }
  return total
}

/** Plain-text snapshot of every lane at time `t`, for the aria-live region. */
export function summarizeAt(result: SimulationResult, t: number): string {
  const clamped = Math.max(0, Math.min(t, result.totalTicks))
  const parts = result.lanes.map((lane) => {
    const phase = getPhaseAt(lane, clamped)
    const info = PHASE_INFO[phase]
    if (lane.role === 'worker' && (phase === 'wait-approval' || phase === 'wait-review')) {
      const waited = Math.round(getWaitTicksAt(lane, clamped))
      return `${lane.label}: ${info.label.toLowerCase()} (${waited} min waited so far)`
    }
    return `${lane.label}: ${info.label.toLowerCase()}`
  })
  return `Minute ${Math.floor(clamped)} of ${result.totalTicks}. ${parts.join('. ')}.`
}
