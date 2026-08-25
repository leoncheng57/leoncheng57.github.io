export type HedwigToolId =
  | 'on-call'
  | 'remote-code'
  | 'customer-api'
  | 'data-helper'
  | 'databricks-mcp'
  | 'slack-builder'

export type HedwigToolKind = HedwigToolId

export interface HedwigToolEvent {
  label: string
  detail: string
}

export interface HedwigTool {
  id: HedwigToolId
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
      { label: 'Evidence assembled', detail: 'Recent changes, logs, and runbook checks are summarized.' },
      { label: 'Handoff ready', detail: 'A read-only investigation brief is ready for the on-call engineer.' },
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
      { label: 'Result packaged', detail: 'A patch summary or workspace transcript is ready for human review.' },
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
      { label: 'Summary prepared', detail: 'The graph and its equivalent text summary are complete.' },
    ],
  },
  {
    id: 'data-helper',
    number: '04',
    title: 'Data team helper',
    shortTitle: 'Data helper',
    summary: 'Translate a common data question into a reviewable, bounded request.',
    kind: 'data-helper',
    events: [
      { label: 'Question classified', detail: 'The fictional request is recognized as a metric-definition lookup.' },
      { label: 'Context attached', detail: 'Ownership and freshness notes are added from a demo catalog.' },
      { label: 'Answer drafted', detail: 'A concise response is ready for a data teammate to verify.' },
    ],
  },
  {
    id: 'databricks-mcp',
    number: '05',
    title: 'Read-only Databricks MCP',
    shortTitle: 'Databricks MCP',
    summary: 'Inspect fictional catalog metadata and query results through a read-only boundary.',
    kind: 'databricks-mcp',
    events: [
      { label: 'Read-only scope checked', detail: 'Mutation operations are unavailable in this simulation.' },
      { label: 'Demo query validated', detail: 'A sanitized aggregate query passes the read-only policy check.' },
      { label: 'Rows summarized', detail: 'Three fictional aggregate rows are returned with no customer records.' },
    ],
  },
  {
    id: 'slack-builder',
    number: '06',
    title: 'Slack bot builder',
    shortTitle: 'Slack builder',
    summary: 'Draft a bot configuration, then stop before anything can be provisioned.',
    kind: 'slack-builder',
    events: [
      { label: 'Purpose selected', detail: 'A fictional weekly digest use case is selected from fixed options.' },
      { label: 'Permissions reviewed', detail: 'Requested capabilities are displayed for a human reviewer.' },
      { label: 'Submit for review', detail: 'Simulation stops here. No bot is provisioned.' },
    ],
  },
] as const

export function getHedwigTool(id: HedwigToolId): HedwigTool {
  const tool = HEDWIG_TOOLS.find((candidate) => candidate.id === id)
  if (!tool) throw new Error(`Unknown Hedwig tool: ${id}`)
  return tool
}
