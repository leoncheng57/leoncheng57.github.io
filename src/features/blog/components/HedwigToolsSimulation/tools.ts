export type HedwigToolId =
  | 'on-call'
  | 'remote-code'
  | 'customer-api'
  | 'databricks-mcp'
  | 'slack-builder'
  | 'playgrounds-skills'
  | 'cmd-k-discovery'

export type HedwigCatalogToolId = HedwigToolId
export type HedwigToolKind = HedwigToolId

export interface HedwigToolEvent {
  label: string
  detail: string
}

export interface HedwigTool {
  id: HedwigCatalogToolId
  number: string
  title: string
  shortTitle: string
  summary: string
  kind: HedwigToolKind
  events: readonly HedwigToolEvent[]
}

/** Fictional, sanitized scenarios used by every simulation view. */
export const HEDWIG_TOOLS: readonly HedwigTool[] = [
  {
    id: 'on-call',
    number: '01',
    title: 'On-call investigations',
    shortTitle: 'On-call',
    summary: 'Collect a bounded incident snapshot before a human decides what to do.',
    kind: 'on-call',
    events: [
      { label: 'Alert received', detail: 'A pager alert opens a pending investigation with service and team labels.' },
      { label: 'Triage posted', detail: 'Phase one assigns a demo severity and scores region and customer impact.' },
      { label: 'Evidence linked', detail: 'Metrics, logs, traces, and dashboards stream into one investigation log.' },
      { label: 'Root cause proposed', detail: 'A configuration-change hypothesis lists its supporting evidence.' },
      { label: 'Report completed', detail: 'Reproduce commands, teams to contact, and action items are ready to review.' },
      { label: 'Handoff to human', detail: 'Ticket drafts, re-investigation, and incident creation stay human decisions.' },
    ],
  },
  {
    id: 'remote-code',
    number: '02',
    title: 'Remote code runners',
    shortTitle: 'Remote code',
    summary: 'Choose between delegation and a live workspace without blending their workflows.',
    kind: 'remote-code',
    events: [
      { label: 'Task started', detail: 'A plain-language brief, a model choice, and a repository seed the agent run.' },
      { label: 'Transcript streamed', detail: 'Tool calls, a task list, and status pills report progress as it happens.' },
      { label: 'Workspace inspected', detail: 'Files, changes, a preview, and a command audit sit beside the transcript.' },
      { label: 'Change request opened', detail: 'A draft change request links back to the session that produced it.' },
      { label: 'Human merge decision', detail: 'Checks and a person gate the merge; delegated tickets run in a separate queue.' },
    ],
  },
  {
    id: 'customer-api',
    number: '03',
    title: 'Customer API usage graphs',
    shortTitle: 'API graphs',
    summary: 'Turn a sanitized usage series into an accessible operational overview.',
    kind: 'customer-api',
    events: [
      { label: 'Customer scoped', detail: 'A typeahead search picks one org; region cards split its traffic.' },
      { label: 'Health summarized', detail: 'Availability, latency p99, and requests compare against demo targets.' },
      { label: 'Attainment matrixed', detail: 'A weekly resource matrix pairs availability and latency with visible misses.' },
      { label: 'Usage reviewed', detail: 'Billing-period usage, limits, and exports stay deterministic; AI only drafts SQL.' },
    ],
  },
  {
    id: 'databricks-mcp',
    number: '04',
    title: 'Read-only Databricks MCP',
    shortTitle: 'Databricks MCP',
    summary: 'Inspect catalog metadata and query results through a read-only boundary.',
    kind: 'databricks-mcp',
    events: [
      { label: 'Integration scoped', detail: 'One read-only SQL tool is exposed; catalog browsing uses safe statements.' },
      { label: 'Discovery queried', detail: 'A labeled tool call lists demo tables with a copyable query.' },
      { label: 'Statement executed', detail: 'The lifecycle polls pending, running, and succeeded states.' },
      { label: 'Rows capped', detail: 'A pipe-delimited result returns capped rows with a truncation footer.' },
      { label: 'Write rejected', detail: 'A blocked mutation returns the read-only error; copy and run stay human steps.' },
    ],
  },
  {
    id: 'slack-builder',
    number: '05',
    title: 'Slackbot operations',
    shortTitle: 'Slackbots',
    summary: 'Inspect a bot through its channels, simulation, memory, logs, ratings, and threads.',
    kind: 'slack-builder',
    events: [
      { label: 'Bot profile opened', detail: 'A production bot exposes its operational subpages.' },
      { label: 'Channels refreshed', detail: 'Public channel membership is visible; private channels stay undisclosed.' },
      { label: 'Thread simulated', detail: 'A recorded demo thread runs the same review-safe bot workflow.' },
      { label: 'Memory inspected', detail: 'Bounded feedback and resolved patterns remain visible as prior context.' },
      { label: 'Logs reviewed', detail: 'Trigger, tool, and response events make the bot’s work inspectable.' },
      { label: 'Ratings recorded', detail: 'Correctness feedback is a maintenance signal, never an automatic change.' },
      { label: 'Threads triaged', detail: 'Recent conversation status guides the next human review step.' },
    ],
  },
  {
    id: 'playgrounds-skills',
    number: '06',
    title: 'Playgrounds & Skills Marketplace',
    shortTitle: 'Playgrounds',
    summary: 'Move an idea through a gated experiment and evidence-led human review.',
    kind: 'playgrounds-skills',
    events: [
      { label: 'Hub browsed', detail: 'Experiment cards carry active, WIP, and coming-soon pills with updated dates.' },
      { label: 'Instant filter applied', detail: 'A deterministic text filter narrows the canned catalog as you type.' },
      { label: 'AI search ranked', detail: 'Topic search adds one-line reasons; the instant filter still works if it fails.' },
      { label: 'Skill tried in chat', detail: 'A sandboxed tryout loads the skill without any install.' },
      { label: 'Publication reviewed', detail: 'Draft becomes pending review as a change request; publishing is never automatic.' },
    ],
  },
  {
    id: 'cmd-k-discovery',
    number: '07',
    title: 'Cmd+K Discovery',
    shortTitle: 'Cmd+K',
    summary: 'Run a fixed discovery query across local and catalog sources with visible lifecycle labels.',
    kind: 'cmd-k-discovery',
    events: [
      { label: 'Palette opened', detail: 'A fixed query against apps and pages returns local results instantly.' },
      { label: 'Local index matched', detail: 'Apps and pages rank by word match without any network request.' },
      { label: 'Catalog supplemented', detail: 'Remote groups add up to three results each while local matches stay put.' },
      { label: 'Result explained', detail: 'Lifecycle badges and tags say why each hit appears before Enter navigates.' },
    ],
  },
] as const

export function getHedwigTool(id: HedwigCatalogToolId): HedwigTool {
  const tool = HEDWIG_TOOLS.find((candidate) => candidate.id === id)
  if (!tool) throw new Error(`Unknown Hedwig tool: ${id}`)
  return tool
}
