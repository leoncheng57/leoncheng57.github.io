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
      { label: 'Signal grouped', detail: 'Three fictional alerts share the same demo service label.' },
      { label: 'Triage opened', detail: 'Impact and current status are placed beside safe response actions.' },
      { label: 'Evidence assembled', detail: 'Recent changes, logs, and runbook checks are summarized.' },
      { label: 'Cause proposed', detail: 'A synthetic configuration mismatch is marked as a hypothesis.' },
      { label: 'Reproduction checked', detail: 'A local reproduction records expected and observed behavior.' },
      { label: 'Handoff ready', detail: 'Contacts and action items wait for the on-call engineer.' },
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
      { label: 'Modes compared', detail: 'Async delegation and interactive workspace are separate choices.' },
      { label: 'Sandbox prepared', detail: 'The fictional repository snapshot is isolated for this demonstration.' },
      { label: 'Run observed', detail: 'A fixed transcript and invented file changes make progress visible.' },
      { label: 'Result packaged', detail: 'A patch summary or workspace transcript is ready for human review.' },
      { label: 'Confirmation required', detail: 'Review and merge remain local human decisions.' },
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
      { label: 'Demo range loaded', detail: 'Four weeks of invented request totals are selected.' },
      { label: 'Series compared', detail: 'The fictional trend rises from 42 to 68 thousand requests.' },
      { label: 'Attainment checked', detail: 'A weekly matrix shows target state in visible text.' },
      { label: 'Summary prepared', detail: 'The graph and its equivalent text summary are complete.' },
    ],
  },
  {
    id: 'databricks-mcp',
    number: '04',
    title: 'Read-only Databricks MCP',
    shortTitle: 'Databricks MCP',
    summary: 'Inspect fictional catalog metadata and query results through a read-only boundary.',
    kind: 'databricks-mcp',
    events: [
      { label: 'Read-only scope checked', detail: 'Mutation operations are unavailable in this simulation.' },
      { label: 'Demo query validated', detail: 'A sanitized aggregate query passes the read-only policy check.' },
      { label: 'Lifecycle recorded', detail: 'Queued, running, and completed states are shown as synthetic trace events.' },
      { label: 'Rows summarized', detail: 'Three fictional aggregate rows are returned with no customer records.' },
      { label: 'Local review gate', detail: 'Generated query text can only be copied into a local review draft.' },
    ],
  },
  {
    id: 'slack-builder',
    number: '05',
    title: 'Slack bot builder',
    shortTitle: 'Slack builder',
    summary: 'Draft a bot configuration, then stop before anything can be provisioned.',
    kind: 'slack-builder',
    events: [
      { label: 'Basics entered', detail: 'A fictional assistant name and description are selected.' },
      { label: 'Purpose selected', detail: 'A weekly digest use case is selected from fixed options.' },
      { label: 'Knowledge scoped', detail: 'Only canned demonstration material is available.' },
      { label: 'Destination previewed', detail: 'A fictional channel destination is shown without connection.' },
      { label: 'Local test complete', detail: 'A canned conversation makes expected behavior reviewable.' },
      { label: 'Permissions reviewed', detail: 'Requested capabilities are displayed for a human reviewer.' },
      { label: 'Submit for review', detail: 'Simulation stops here. No bot is provisioned.' },
    ],
  },
  {
    id: 'playgrounds-skills',
    number: '06',
    title: 'Playgrounds & Skills Marketplace',
    shortTitle: 'Playgrounds',
    summary: 'Move a fictional idea through a gated experiment and evidence-led human review.',
    kind: 'playgrounds-skills',
    events: [
      { label: 'Idea framed', detail: 'A fictional triage-helper idea is scoped with a fixed success measure.' },
      { label: 'Playground gated', detail: 'The experiment stays private while access and evidence are reviewed.' },
      { label: 'Marketplace searched', detail: 'Synthetic skills are browsed without loading external data.' },
      { label: 'Detail reviewed', detail: 'Permissions, lifecycle, and evidence remain visible before selection.' },
      { label: 'Review route selected', detail: 'Evidence supports skill review; publication is never automatic.' },
    ],
  },
  {
    id: 'cmd-k-discovery',
    number: '07',
    title: 'Cmd+K Discovery',
    shortTitle: 'Cmd+K',
    summary: 'Run a fixed discovery query across four sources with lifecycle and permission boundaries.',
    kind: 'cmd-k-discovery',
    events: [
      { label: 'Scripted query opened', detail: 'The fixed query asks for approved incident-triage resources.' },
      { label: 'Sources checked', detail: 'Apps, MCPs, Skills, and Docs return only generic permitted matches.' },
      { label: 'Keyboard selection moved', detail: 'A local active result changes with arrow-key navigation.' },
      { label: 'Safe results ranked', detail: 'Lifecycle state and permission checks remain visible in every result.' },
    ],
  },
] as const

export function getHedwigTool(id: HedwigCatalogToolId): HedwigTool {
  const tool = HEDWIG_TOOLS.find((candidate) => candidate.id === id)
  if (!tool) throw new Error(`Unknown Hedwig tool: ${id}`)
  return tool
}
