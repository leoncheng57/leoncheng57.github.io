/**
 * Scripted frame data for the guided "cmux trial" walkthrough: one manager,
 * three workers, three parallel tasks. Pure data, no side effects, so the
 * script itself is unit-testable.
 *
 * The transcript deliberately doubles as documentation and mirrors the
 * guide's real conventions: `Child: <Task>` workspace names, one git worktree
 * per child, `.agent-status.json` phase strings, draft PRs, `cmux notify`
 * toasts, and the manager merging branches sequentially with verification.
 */

/** Color semantics shared with the round-1 sandbox legend. */
export type TrialActor = 'human' | 'ai' | 'waiting' | 'merge'

/** The status protocol's closed phase vocabulary (see 05-watch-the-run.md). */
export const STATUS_PHASES = [
  'assigned',
  'working',
  'verifying',
  'pushed',
  'pr-open',
  'blocked',
  'done',
] as const
export type StatusPhase = (typeof STATUS_PHASES)[number]

export type WorkspaceId = 'manager' | 'task-a' | 'task-b' | 'task-c'

export interface TrialWorkspace {
  id: WorkspaceId
  /** Sidebar label; children use the guide's `Child: <Task>` convention. */
  name: string
  /** Status-dot color semantic for this frame. */
  actor: TrialActor
  /** Badge text: the phase this workspace last reported, if any. */
  statusPhase: StatusPhase | null
  /** Pane shows subtle activity animation (suppressed under reduced motion). */
  busy: boolean
}

export type TranscriptLineKind = 'cmd' | 'out' | 'status' | 'note'

export interface TranscriptLine {
  kind: TranscriptLineKind
  text: string
}

export interface TrialRecap {
  humanMinutes: number
  aiMinutes: number
  waitMinutes: number
}

export interface TrialFrame {
  id: string
  title: string
  /** One or two sentences narrated in the caption bar / aria-live region. */
  caption: string
  /** Which workspace's terminal pane is shown for this frame. */
  focusWorkspace: WorkspaceId
  workspaces: TrialWorkspace[]
  transcript: TranscriptLine[]
  /** Optional `cmux notify` toast overlaid on the mock window. */
  toast?: string
  /** Present only on the final recap frame. */
  recap?: TrialRecap
}

const MANAGER = 'manager'

function ws(
  id: WorkspaceId,
  actor: TrialActor,
  statusPhase: StatusPhase | null,
  busy = false
): TrialWorkspace {
  const names: Record<WorkspaceId, string> = {
    manager: 'manager',
    'task-a': 'Child: Task A',
    'task-b': 'Child: Task B',
    'task-c': 'Child: Task C',
  }
  return { id, name: names[id], actor, statusPhase, busy }
}

const cmd = (text: string): TranscriptLine => ({ kind: 'cmd', text })
const out = (text: string): TranscriptLine => ({ kind: 'out', text })
const status = (text: string): TranscriptLine => ({ kind: 'status', text })
const note = (text: string): TranscriptLine => ({ kind: 'note', text })

export const TRIAL_FRAMES: TrialFrame[] = [
  {
    id: 'plan',
    title: 'You plan and write three task specs',
    caption:
      'The run starts with the biggest human touchpoint (orange): you split the work into one wave of three non-overlapping tasks and write one spec per worker.',
    focusWorkspace: MANAGER,
    workspaces: [ws('manager', 'human', null)],
    transcript: [
      cmd('opencode'),
      out('MANAGER MODE. This session coordinates parallel CHILD agent sessions.'),
      note('# Wave 1: Task A, Task B, Task C — files never overlap, so all three run in parallel'),
      cmd('$EDITOR prompts/task-a.md   # goal, files owned, branch, gates, reporting rule'),
      cmd('$EDITOR prompts/task-b.md'),
      cmd('$EDITOR prompts/task-c.md'),
      note('# Each contract includes the verbatim .agent-status.json reporting protocol'),
    ],
  },
  {
    id: 'dispatch',
    title: 'Manager creates worktrees and dispatches workers',
    caption:
      'AI-only activity (blue): the manager gives each child its own git worktree and its own cmux workspace — one child = one worktree = one workspace — and sends the assignment prompts.',
    focusWorkspace: MANAGER,
    workspaces: [
      ws('manager', 'ai', null, true),
      ws('task-a', 'ai', 'assigned'),
      ws('task-b', 'ai', 'assigned'),
      ws('task-c', 'ai', 'assigned'),
    ],
    transcript: [
      cmd('git worktree add -b task-a ../site.worktrees/task-a main'),
      cmd('git worktree add -b task-b ../site.worktrees/task-b main'),
      cmd('git worktree add -b task-c ../site.worktrees/task-c main'),
      cmd('cmux new-workspace --name "Child: Task A" --cwd ../site.worktrees/task-a --focus false'),
      cmd('cmux new-workspace --name "Child: Task B" --cwd ../site.worktrees/task-b --focus false'),
      cmd('cmux new-workspace --name "Child: Task C" --cwd ../site.worktrees/task-c --focus false'),
      out('3 children launched, unfocused. They push their own branches — never main.'),
    ],
  },
  {
    id: 'parallel-work',
    title: 'Three workers code in parallel',
    caption:
      'All three children implement at once (blue). Each rewrites .agent-status.json at its worktree root on every phase change, so the manager reads reports instead of scraping terminals.',
    focusWorkspace: 'task-b',
    workspaces: [
      ws('manager', 'ai', null),
      ws('task-a', 'ai', 'working', true),
      ws('task-b', 'ai', 'working', true),
      ws('task-c', 'ai', 'working', true),
    ],
    transcript: [
      note('# Child: Task B — implementing'),
      cmd('date -u +%Y-%m-%dT%H:%M:%SZ'),
      out('2026-08-17T14:02:11Z'),
      status(
        '{"task":"task-b","phase":"working","branch":"task-b","pr_url":null,"summary":"building the feature","blockers":[],"updated_at":"2026-08-17T14:02:11Z"}'
      ),
      cmd('npm run test:run'),
      out('Tests 42 passed (42)'),
      note('# Heartbeat: the file is rewritten at least every 10 minutes — a stale file reads as a dead worker'),
    ],
  },
  {
    id: 'first-draft-pr',
    title: 'Worker B finishes first and opens a draft PR',
    caption:
      'Task B passes its verification gate, pushes its branch, opens a draft PR, and reports pr-open. Its badge flips to hatched: it is now blocked, waiting on a human — and wait time starts accumulating.',
    focusWorkspace: 'task-b',
    workspaces: [
      ws('manager', 'ai', null),
      ws('task-a', 'ai', 'working', true),
      ws('task-b', 'waiting', 'pr-open'),
      ws('task-c', 'ai', 'working', true),
    ],
    transcript: [
      cmd('npm run lint && npm run test:run && npm run build'),
      out('lint ok · tests ok · build ok'),
      cmd('git push -u origin task-b'),
      cmd('gh pr create --draft --title "task-b: ..." --body-file pr.md'),
      out('https://github.com/you/site/pull/101 (draft)'),
      status(
        '{"task":"task-b","phase":"pr-open","branch":"task-b","pr_url":"https://github.com/you/site/pull/101","summary":"draft PR open, awaiting review","blockers":[],"updated_at":"2026-08-17T14:41:53Z"}'
      ),
      cmd('cmux notify --title "Child: Task B" --subtitle "done" --body "Draft PR #101 open, awaiting review"'),
    ],
    toast: 'Child: Task B — Draft PR #101 open, awaiting review',
  },
  {
    id: 'review-while-running',
    title: 'You review B while A and C keep running',
    caption:
      'Human touchpoint (orange): you review draft PR #101. Meanwhile workers A and C keep coding (blue) — a worker waiting on review costs you nothing while the others still run.',
    focusWorkspace: MANAGER,
    workspaces: [
      ws('manager', 'human', null),
      ws('task-a', 'ai', 'working', true),
      ws('task-b', 'human', 'pr-open'),
      ws('task-c', 'ai', 'working', true),
    ],
    transcript: [
      cmd('gh pr view 101 --web'),
      note('# Review the checkpoint: commits separated, diff matches scope, evidence covers acceptance criteria'),
      cmd('gh pr review 101 --approve --body "LGTM — ready to land after the wave"'),
      out('Review submitted.'),
      note('# Feedback would go back into the owning session: opencode run --continue "Review feedback: ..."'),
    ],
  },
  {
    id: 'all-done',
    title: 'Workers A and C finish; status files flip to done',
    caption:
      'A and C pass their gates, push, open draft PRs, and report done. Every worker is now idle but resumable; nothing is merged yet.',
    focusWorkspace: 'task-c',
    workspaces: [
      ws('manager', 'ai', null),
      ws('task-a', 'waiting', 'done'),
      ws('task-b', 'waiting', 'done'),
      ws('task-c', 'waiting', 'done'),
    ],
    transcript: [
      cmd('git push -u origin task-c && gh pr create --draft --title "task-c: ..."'),
      out('https://github.com/you/site/pull/103 (draft)'),
      status(
        '{"task":"task-c","phase":"done","branch":"task-c","pr_url":"https://github.com/you/site/pull/103","summary":"work handed off; idle but resumable","blockers":[],"updated_at":"2026-08-17T15:20:36Z"}'
      ),
      note('# cat ../*/.agent-status.json now answers "where is everyone?" in one read'),
    ],
  },
  {
    id: 'merge',
    title: 'Manager merges the branches sequentially',
    caption:
      'Merge (green): the manager lands one branch at a time with full verification between merges — never all at once — then removes each worktree.',
    focusWorkspace: MANAGER,
    workspaces: [
      ws('manager', 'merge', null, true),
      ws('task-a', 'merge', 'done'),
      ws('task-b', 'merge', 'done'),
      ws('task-c', 'merge', 'done'),
    ],
    transcript: [
      cmd('git merge --no-ff task-b && npm run lint && npm run test:run && npm run build'),
      out('merged task-b · gates green'),
      cmd('git merge --no-ff task-a && npm run lint && npm run test:run && npm run build'),
      out('merged task-a · gates green'),
      cmd('git merge --no-ff task-c && npm run lint && npm run test:run && npm run build'),
      out('merged task-c · gates green'),
      cmd('git worktree remove ../site.worktrees/task-b   # repeat per child, then git worktree prune'),
    ],
  },
  {
    id: 'recap',
    title: 'Recap: where the time went',
    caption:
      'The whole run in three numbers: your hands-on minutes, the agents’ parallel minutes, and the minutes workers sat blocked waiting on you. Shrinking the orange and hatched bars is what the autonomy and latency knobs below are for.',
    focusWorkspace: MANAGER,
    workspaces: [
      ws('manager', 'merge', null),
      ws('task-a', 'merge', 'done'),
      ws('task-b', 'merge', 'done'),
      ws('task-c', 'merge', 'done'),
    ],
    transcript: [
      cmd('node alpha-projs/agent-dashboard/cli.mjs --once'),
      out('3 children  0 blocked  0 stale  3 done'),
      out('CHILD    PHASE  BRANCH  CI    PR'),
      out('task-a   done   task-a  pass  #102'),
      out('task-b   done   task-b  pass  #101'),
      out('task-c   done   task-c  pass  #103'),
    ],
    recap: { humanMinutes: 24, aiMinutes: 78, waitMinutes: 14 },
  },
]
