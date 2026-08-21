/**
 * Scripted frame data for the OpenHands IDE walkthrough: one task, from the
 * project picker to a merged-ready draft pull request. Pure data, no side
 * effects, so the script itself is unit-testable.
 *
 * Every label here is copied from the real application rather than invented,
 * so the mock stays honest: the nav items, the `waiting for confirmation`
 * status text, the plan-mode banner copy, the `🔨 Build` / `📋 Plan` toggle,
 * the `{done}/{total} done` task counter and the status-bar readouts all match
 * what the app renders. Only the project, repository and branch names are
 * fictional.
 */

/** Execution statuses the mock can show, rendered with `_` replaced by a space. */
export type ExecutionStatus = 'running' | 'waiting_for_confirmation' | 'finished'

export type AgentMode = 'build' | 'plan'

/** Task-tracker item states, matching the app's ✓ / ◐ / ○ glyphs. */
export type TaskState = 'done' | 'in_progress' | 'todo'

export interface TaskItem {
  title: string
  state: TaskState
}

/**
 * Transcript row kinds:
 *  - `tool`   a collapsed tool-call chip (▸ ● name detail time)
 *  - `group`  a collapsed run of successful calls (▾ N actions completed)
 *  - `agent`  agent prose
 *  - `user`   a right-aligned user message bubble
 *  - `status` a full-width timeline separator (RUNNING · 16:48:05)
 */
export type TranscriptRow =
  | { kind: 'tool'; tool: string; detail: string; time: string; risk?: 'MEDIUM' }
  | { kind: 'group'; count: number; time: string }
  | { kind: 'agent'; text: string; time: string }
  | { kind: 'user'; text: string; time: string }
  | { kind: 'status'; status: string; time: string }

export interface ChangeFile {
  path: string
  added: number
  removed: number
}

/** The right-hand sidebar panel, when one is open. */
export type SidePanel =
  | { kind: 'changes'; files: ChangeFile[] }
  | { kind: 'preview'; label: string; port: number }
  | {
      kind: 'mr'
      title: string
      ref: string
      pipeline: string
      mergeable: boolean
    }

/** The projects grid on the hub screen. Fictional names. */
export interface HubScreen {
  projects: string[]
  selected: string
  prompt: string
  worktree: boolean
}

export interface IdeFrame {
  id: string
  title: string
  /** One or two sentences narrated in the caption bar / aria-live region. */
  caption: string
  /** `hub` renders the new-task screen; `conversation` renders the work view. */
  screen: 'hub' | 'conversation'
  hub?: HubScreen
  /** Conversation title shown in the header. */
  conversationTitle?: string
  status?: ExecutionStatus
  mode?: AgentMode
  transcript?: TranscriptRow[]
  tasks?: TaskItem[]
  panel?: SidePanel
  /** Renders the warning strip with Approve / Reject. */
  confirmation?: boolean
  /** Notification banner overlaid on the mock window. */
  toast?: string
  /** Status-bar readouts. */
  contextPercent?: string
  cost?: string
}

const PROJECTS = [
  'checkout-service',
  'design-system',
  'docs-site',
  'billing-api',
  'edge-router',
  'mobile-app',
]

const tool = (
  toolName: string,
  detail: string,
  time: string,
  risk?: 'MEDIUM'
): TranscriptRow => ({ kind: 'tool', tool: toolName, detail, time, risk })
const group = (count: number, time: string): TranscriptRow => ({ kind: 'group', count, time })
const agent = (text: string, time: string): TranscriptRow => ({ kind: 'agent', text, time })
const user = (text: string, time: string): TranscriptRow => ({ kind: 'user', text, time })
const separator = (status: string, time: string): TranscriptRow => ({
  kind: 'status',
  status,
  time,
})

const TITLE = 'Retry failed checkout webhooks'

export const IDE_FRAMES: IdeFrame[] = [
  {
    id: 'new-task',
    title: 'Start a task in its own worktree',
    caption:
      'The home screen is a grid of projects, not a blank prompt. Leaving "Use a new git worktree for each session" checked means the task starts from committed HEAD in its own checkout, so it cannot collide with the editor you already have open.',
    screen: 'hub',
    hub: {
      projects: PROJECTS,
      selected: 'checkout-service',
      prompt: 'Retry failed checkout webhooks with backoff, and cover it with tests.',
      worktree: true,
    },
  },
  {
    id: 'research',
    title: 'Plan mode researches before it writes',
    caption:
      'The conversation opens against an isolated workspace. In Plan mode the agent reads freely — the security analyzer scores these calls as low risk, so nothing is held up.',
    screen: 'conversation',
    conversationTitle: TITLE,
    status: 'running',
    mode: 'plan',
    transcript: [
      separator('running', '14:02:11'),
      tool('terminal', 'git log --oneline -10', '6m ago'),
      group(3, '6m ago'),
      tool('file_editor', 'view src/webhooks/dispatch.ts', '5m ago'),
      tool('search_docs', '[query=webhook retry limit=10]', '5m ago'),
      agent(
        'Delivery failures are swallowed in dispatch.ts — there is no retry and no dead-letter path. I propose exponential backoff with a capped retry count, plus a table-driven test.',
        '4m ago'
      ),
    ],
    tasks: [
      { title: 'Read the dispatch path', state: 'done' },
      { title: 'Propose a retry strategy', state: 'in_progress' },
      { title: 'Implement backoff', state: 'todo' },
      { title: 'Cover it with tests', state: 'todo' },
    ],
    contextPercent: '8%',
    cost: '$0.41',
  },
  {
    id: 'gate',
    title: 'A write action parks the run',
    caption:
      'The first edit is scored medium risk, so the conversation stops at waiting for confirmation instead of writing. This is the upstream confirmation policy, not a prompt convention — the agent cannot talk its way past it.',
    screen: 'conversation',
    conversationTitle: TITLE,
    status: 'waiting_for_confirmation',
    mode: 'plan',
    confirmation: true,
    transcript: [
      agent(
        'Delivery failures are swallowed in dispatch.ts — there is no retry and no dead-letter path. I propose exponential backoff with a capped retry count, plus a table-driven test.',
        '4m ago'
      ),
      separator('waiting for confirmation', '14:06:38'),
      tool('file_editor', 'str_replace src/webhooks/dispatch.ts', 'just now', 'MEDIUM'),
    ],
    tasks: [
      { title: 'Read the dispatch path', state: 'done' },
      { title: 'Propose a retry strategy', state: 'done' },
      { title: 'Implement backoff', state: 'in_progress' },
      { title: 'Cover it with tests', state: 'todo' },
    ],
    contextPercent: '11%',
    cost: '$0.68',
  },
  {
    id: 'build',
    title: 'Approve the plan and the gate lifts',
    caption:
      'Approving switches the conversation to Build — plain NeverConfirm — and sends the canned "implement it" message. The same run continues; nothing restarts.',
    screen: 'conversation',
    conversationTitle: TITLE,
    status: 'running',
    mode: 'build',
    transcript: [
      user('Approved — implement the plan.', '3m ago'),
      separator('running', '14:07:02'),
      tool('file_editor', 'str_replace src/webhooks/dispatch.ts', '2m ago'),
      tool('file_editor', 'create src/webhooks/backoff.ts', '2m ago'),
      group(4, '1m ago'),
      tool('terminal', 'npm test -- webhooks', 'just now'),
    ],
    tasks: [
      { title: 'Read the dispatch path', state: 'done' },
      { title: 'Propose a retry strategy', state: 'done' },
      { title: 'Implement backoff', state: 'done' },
      { title: 'Cover it with tests', state: 'in_progress' },
    ],
    contextPercent: '19%',
    cost: '$1.24',
  },
  {
    id: 'changes',
    title: 'Review the diff without leaving the page',
    caption:
      'The Changes panel reads the worktree the agent is working in, so review happens beside the transcript that produced it — no context switch to a terminal.',
    screen: 'conversation',
    conversationTitle: TITLE,
    status: 'running',
    mode: 'build',
    transcript: [
      tool('file_editor', 'create src/webhooks/backoff.test.ts', '1m ago'),
      group(4, '1m ago'),
      tool('terminal', 'npm test -- webhooks', 'just now'),
      agent('All 34 webhook tests pass, including the six new backoff cases.', 'just now'),
    ],
    tasks: [
      { title: 'Read the dispatch path', state: 'done' },
      { title: 'Propose a retry strategy', state: 'done' },
      { title: 'Implement backoff', state: 'done' },
      { title: 'Cover it with tests', state: 'done' },
    ],
    panel: {
      kind: 'changes',
      files: [
        { path: 'src/webhooks/dispatch.ts', added: 24, removed: 9 },
        { path: 'src/webhooks/backoff.ts', added: 61, removed: 0 },
        { path: 'src/webhooks/backoff.test.ts', added: 88, removed: 0 },
      ],
    },
    contextPercent: '23%',
    cost: '$1.51',
  },
  {
    id: 'preview',
    title: 'Watch the running app, not just the diff',
    caption:
      'For frontend work the BFF proxies the workspace dev server to a conversation-scoped URL, started from a server-side command template. No Docker port is published per task.',
    screen: 'conversation',
    conversationTitle: TITLE,
    status: 'running',
    mode: 'build',
    transcript: [
      agent('All 34 webhook tests pass, including the six new backoff cases.', '1m ago'),
      tool('terminal', 'npm run dev', 'just now'),
      agent('Dev server is up; the retry banner renders on the failed-delivery row.', 'just now'),
    ],
    tasks: [
      { title: 'Read the dispatch path', state: 'done' },
      { title: 'Propose a retry strategy', state: 'done' },
      { title: 'Implement backoff', state: 'done' },
      { title: 'Cover it with tests', state: 'done' },
    ],
    panel: { kind: 'preview', label: 'Running', port: 20313 },
    contextPercent: '26%',
    cost: '$1.73',
  },
  {
    id: 'pull-request',
    title: 'The pull request is the review boundary',
    caption:
      'The branch is pushed and a draft pull request opened. Its CI state is polled into the sidebar, and a notification fires when the run finishes — so the tab can stay closed until there is something to read.',
    screen: 'conversation',
    conversationTitle: TITLE,
    status: 'finished',
    mode: 'build',
    transcript: [
      tool('terminal', 'git push -u origin retry-failed-webhooks', '2m ago'),
      tool('terminal', 'gh pr create --draft', '1m ago'),
      agent('Opened draft PR #128. CI is green: lint, unit tests, and the build all pass.', '1m ago'),
      separator('finished', '14:19:45'),
    ],
    tasks: [
      { title: 'Read the dispatch path', state: 'done' },
      { title: 'Propose a retry strategy', state: 'done' },
      { title: 'Implement backoff', state: 'done' },
      { title: 'Cover it with tests', state: 'done' },
    ],
    panel: {
      kind: 'mr',
      title: 'Retry failed checkout webhooks',
      ref: '#128 · acme/checkout-service',
      pipeline: 'pipeline: success',
      mergeable: true,
    },
    toast: 'Agent finished · Retry failed checkout webhooks',
    contextPercent: '31%',
    cost: '$2.06',
  },
]
