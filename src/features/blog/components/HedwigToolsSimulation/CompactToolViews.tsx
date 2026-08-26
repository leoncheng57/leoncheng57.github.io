import type { ReactElement } from 'react'
import type { HedwigToolId } from './tools'
import styles from './HedwigToolsSimulation.module.css'

type Tone = 'ok' | 'info' | 'warn' | 'danger' | 'neutral'

const Pill = ({ tone = 'ok', children }: { tone?: Tone; children: string }): ReactElement => (
  <span className={styles.pill} data-tone={tone}>{children}</span>
)

const CopyLabel = (): ReactElement => <span className={styles.staticControl}>Copy</span>

const ONCALL_MILESTONES = [
  ['Started', 0], ['Detected', 0], ['Acknowledged', 0],
  ['Investigation started', 1], ['Investigation completed', 4], ['Resolved', 5],
] as const

function OnCallCompact({ stage }: { stage: number }): ReactElement {
  const slackMessages = [
    ['9:12', 'Alert bot', 'Demo checkout latency crossed its review threshold.', true],
    ['9:14', 'Duty engineer', 'Acknowledged. Checking the latest demo release.', false],
    ['9:17', 'Investigation bot', 'Triage posted: SEV-3 demo. Gathering metrics and logs.', true],
    ['9:21', 'Duty engineer', 'The cache setting changed in the matching release.', false],
    ['9:24', 'Investigation bot', 'Report ready. Reproduction and action items are attached for review.', true],
  ] as const
  return (
    <div className={styles.compactView} data-compact-view="on-call">
      <div className={styles.viewHeader}>
        <strong className={styles.viewTitle}>Demo checkout latency spike</strong>
        <span className={styles.actionRow}>
          <button type="button">Alert source</button>
          <button type="button">Re-investigate</button>
          <button type="button">Create incident</button>
        </span>
      </div>
      <div className={styles.metaRow}>
        <Pill tone={stage >= 4 ? 'ok' : 'info'}>{stage >= 4 ? 'completed' : 'running'}</Pill>
        <Pill tone="danger">high urgency</Pill>
        <span className={styles.metaText}>demo-checkout / payments demo team</span>
      </div>
      <ol className={styles.lifecycle} aria-label="Incident milestone timeline">
        {ONCALL_MILESTONES.map(([label, readyAt], index) => (
          <li key={label} data-ready={stage >= readyAt}>
            <span>{index + 1}</span>
            <strong>{label}</strong>
            <small>{stage >= readyAt ? 'Reached' : 'Waiting'}</small>
          </li>
        ))}
      </ol>
      <div className={styles.detailGrid}>
        <section>
          <h3>Triage</h3>
          <Pill tone="warn">SEV-3 demo</Pill>
          <p>Checkout latency rose after a release. Region scope: single-region. Customer scope: could not determine.</p>
        </section>
        <section>
          <h3>Root cause &amp; evidence</h3>
          <p>Hypothesis: a synthetic cache setting changed. Category: configuration change.</p>
          <p>Supporting evidence: timing shift follows the demo release · one config diff touches the cache.</p>
          <p className={styles.evidenceChips}>Traces 2 · Metrics 3 · Logs 1 · Dashboards 1</p>
        </section>
        <section>
          <h3>Reproduce</h3>
          <p>Replay the demo fixture against a local build.</p>
          <code>run demo-fixture --expect 180ms</code>
        </section>
        <section>
          <h3>Teams to contact</h3>
          <p><Pill tone="danger">Immediate</Pill> Demo service stewards · On-call: duty engineer</p>
          <p><Pill tone="neutral">Informational</Pill> Payments demo team</p>
        </section>
      </div>
      <section className={styles.actionItems}>
        <h3>Action items</h3>
        <p>
          <Pill tone="danger">fix</Pill> <Pill tone="warn">High</Pill> Revert the demo cache setting
          <button type="button">Create ticket</button>
        </p>
      </section>
      <section className={styles.staticDisclosure}>
        <h3>Slack discussion</h3>
        <ol className={styles.slackStream} aria-label="Fictional streamed Slack discussion">
          {slackMessages.slice(0, Math.min(stage + 1, slackMessages.length)).map(([time, author, message, isApp]) => (
            <li key={time}>
              <span className={styles.slackAvatar} aria-hidden="true">{isApp ? '◆' : '●'}</span>
              <p>
                <strong>{author}</strong>{isApp ? <span className={styles.appTag}>APP</span> : null} <small>{time}</small>
                <br />{message}
              </p>
            </li>
          ))}
          {stage < slackMessages.length - 1 ? <li className={styles.slackTyping}><span aria-hidden="true">•••</span> Streaming discussion updates…</li> : null}
        </ol>
      </section>
      <section className={styles.staticDisclosure}>
        <h3>Investigation log</h3>
        <ul className={styles.logList} aria-label="Agent activity log">
          <li><strong>query_metrics</strong><span>latency p99 by release</span><small>3 series</small></li>
          <li><strong>search_logs</strong><span>error patterns since release</span><small>1 pattern</small></li>
          <li><strong>submit_report</strong><span>structured report</span><small>accepted</small></li>
        </ul>
      </section>
    </div>
  )
}

function RemoteCompact({ stage }: { stage: number }): ReactElement {
  const tab = stage >= 4 ? 'delegated' : 'interactive'
  const panelCopy: Record<string, string> = {
    Files: 'Workspace directories scoped to this conversation.',
    Changes: 'Read-only diffs: 2 updated files, 1 added test. Working tree stays inspectable.',
    Preview: 'A demo dev server runs in the sandbox. Status: running · reload and logs stay local.',
    Commands: '3 commands audited: ✔ install · ✔ checks · ✔ package. Export stays local.',
    'Merge request': 'Draft change request · pipeline: success · description links back to this session.',
  }
  const panel = Object.keys(panelCopy)[Math.min(stage, Object.keys(panelCopy).length - 1)]
  return (
    <div className={styles.compactView} data-compact-view="remote-code">
      <div className={styles.tabs} aria-label="Remote runner modes">
        <span data-selected={tab === 'interactive' || undefined}>Interactive workspace</span>
        <span data-selected={tab === 'delegated' || undefined}>Delegated jobs</span>
      </div>
      {tab === 'interactive' ? (
        <>
          <div className={styles.detailGrid}>
            <section>
              <h3>New task</h3>
              <p>What should the agent do? Update a demo parser fixture.</p>
              <label className={styles.inlineField}>
                Model
                <select defaultValue="Balanced">
                  <option>Balanced</option>
                  <option>Fast</option>
                  <option>Strong</option>
                </select>
              </label>
              <button type="button">Start agent</button>
            </section>
            <section>
              <h3>Conversations</h3>
              <ul className={styles.convoList} aria-label="Fictional conversations">
                <li><Pill tone="info">running</Pill><span>Update demo parser fixture</span><small>$0.42</small></li>
                <li><Pill tone="warn">waiting for confirmation</Pill><span>Add fixture checks</span><small>$0.18</small></li>
                <li><Pill tone="ok">finished</Pill><span>Rename demo helper</span><small>$0.11</small></li>
              </ul>
            </section>
          </div>
          <div className={styles.detailGrid}>
            <section>
              <h3>Transcript</h3>
              <p>Task list · 2/4 done: ✓ read fixture · ✓ edit parser · ◐ run checks · ○ open change request</p>
              <p className={styles.monoNote}>▸ run_checks · demo suite · Ran for 12s</p>
              <p><Pill tone="warn">waiting for confirmation</Pill> <button type="button">Approve</button> <button type="button">Reject</button></p>
            </section>
            <section>
              <h3>Result handoff</h3>
              <p>Draft change request · pipeline: success · state gated on review.</p>
              <span className={styles.staticControl}>Confirm merge</span>
              <small className={styles.gateNote}>A person confirms every merge.</small>
            </section>
          </div>
          <div className={styles.tabs} aria-label="Workspace side panels">
            {Object.keys(panelCopy).map((item) => (
              <span key={item} data-selected={panel === item || undefined}>{item}</span>
            ))}
          </div>
          <section className={styles.panel}>
            <h3>{panel}</h3>
            <p>{panelCopy[panel]}</p>
          </section>
        </>
      ) : (
        <div className={styles.detailGrid}>
          <section>
            <h3>Job queue</h3>
            <ul className={styles.convoList} aria-label="Fictional delegated jobs">
              <li><Pill tone="ok">success</Pill><span>Demo ticket A · change request merged</span><small>stage: merged</small></li>
              <li><Pill tone="info">running</Pill><span>Demo ticket B · fixture refresh</span><small>stage: running</small></li>
              <li><Pill tone="neutral">pending</Pill><span>Demo ticket C · docs sweep</span><small>stage: dispatched</small></li>
            </ul>
          </section>
          <section>
            <h3>Isolation</h3>
            <p>One disposable workspace per ticket: dispatched → running → change request opened → merged.</p>
            <p className={styles.gateNote}>Logs stream out; review happens on the change request, after the fact.</p>
          </section>
        </div>
      )}
    </div>
  )
}

function CustomerApiCompact({ stage }: { stage: number }): ReactElement {
  const regions = [
    ['All regions', '208k requests'],
    ['East demo', '61% of total'],
    ['West demo', '39% of total'],
  ] as const
  const region = regions[Math.min(stage, regions.length - 1)][0]
  const matrix = [
    ['Availability %', '99.95', '99.88', '99.97', '99.99'],
    ['Latency p99 ms', '420', '510', '431', '405'],
  ] as const
  const missCells = new Set(['99.88', '510'])
  return (
    <div className={styles.compactView} data-compact-view="customer-api">
      <div className={styles.viewHeader}>
        <label className={styles.searchField}>
          Customer
          <input readOnly value="acorn demo org" aria-label="Customer typeahead search" />
        </label>
        <span className={styles.staticControl}>All customers</span>
      </div>
      <div className={styles.regionChips} role="group" aria-label="Region traffic cards">
        {regions.map(([name, share]) => (
          <span key={name} data-selected={region === name || undefined}>
            <strong>{name}</strong>
            <small>{share}</small>
          </span>
        ))}
      </div>
      <p className={styles.sectionLabel}>Health · {region}</p>
      <div className={styles.kpis}>
        <section><span>Availability (last 7d)</span><strong>99.92%</strong><small>Target: 99.9%</small></section>
        <section><span>Latency p99 (last 7d)</span><strong>412 ms</strong><small>Target: 500 ms</small></section>
        <section><span>Requests</span><strong>208k</strong><small>Fictional total</small></section>
      </div>
      <div className={styles.tableScroll}>
        <table>
          <caption>Weekly SLO attainment</caption>
          <thead>
            <tr><th>translate demo endpoint</th><th>W1</th><th>W2</th><th>W3</th><th>W4</th></tr>
          </thead>
          <tbody>
            {matrix.map(([metric, ...cells]) => (
              <tr key={metric}>
                <td>{metric}</td>
                {cells.map((cell, index) => (
                  <td key={`${metric}-${index}`} data-miss={missCells.has(cell) || undefined}>
                    {cell}{missCells.has(cell) ? ' · miss' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.detailGrid}>
        <section>
          <h3>Errors</h3>
          <p>34 total errors · 6 server errors.</p>
          <p className={styles.gateNote}>9 × quota-exceeded — a self-imposed demo limit, flagged by a deterministic check.</p>
        </section>
        <section>
          <h3>Usage · current billing period</h3>
          <p>API calls 208k · Characters translated 3.1M</p>
          <div className={styles.limitBar} role="img" aria-label="Fictional limit usage: 62 percent used">
            <span style={{ width: '62%' }} />
          </div>
          <p className={styles.metaText}>62% of limit used · <span className={styles.staticControl}>CSV</span></p>
        </section>
      </div>
      <p className={styles.gateNote} role="note">
        The production design supports shareable filters. This static preview illustrates the selected scope; AI can draft read-only SQL for custom graphs.
      </p>
    </div>
  )
}

function DatabricksCompact({ stage }: { stage: number }): ReactElement {
  const blocked = stage >= 4
  return (
    <div className={styles.compactView} data-compact-view="databricks-mcp">
      <p className={styles.traceNotice}>Simulated MCP trace — not a live Databricks interface</p>
      <div className={styles.viewHeader}>
        <div className={styles.tabs} aria-label="Chat panel tabs">
          <span data-selected>Chat</span><span>History</span>
        </div>
        <span className={styles.integrationChip}>Databricks — SQL queries (read-only)</span>
      </div>
      <>
          <section className={styles.toolChip}>
            <div className={styles.toolChipTitle}>List demo tables · execute_sql 1 <CopyLabel /></div>
            <code>SHOW TABLES IN demo_catalog</code>
          </section>
          <section className={styles.toolChip}>
            <div className={styles.toolChipTitle}>Weekly usage totals · execute_sql 2 <CopyLabel /></div>
            <code>SELECT week, total FROM demo_usage_summary LIMIT 4</code>
          </section>
          <p className={styles.monoNote}>Lifecycle: pending → running → succeeded (polled once per second)</p>
          <section className={styles.panel}>
            <h3>Result</h3>
            <code className={styles.resultTable}>
              week | total{'\n'}--- | ---{'\n'}W1 | 42k{'\n'}W2 | 51k{'\n'}W3 | 47k{'\n'}W4 | 68k
            </code>
            <small>(Showing 4 of 4 rows · results cap at 500 rows with a truncation footer)</small>
          </section>
          <section className={styles.panel}>
            <h3>Safety</h3>
            {blocked ? (
              <p className={styles.blockedText} role="status">
                Error: Only read-only queries are allowed (SELECT, SHOW, DESCRIBE, WITH, EXPLAIN)
              </p>
            ) : (
              <p>One tool is exposed. Catalog browsing happens through safe SHOW and DESCRIBE statements.</p>
            )}
            <span className={styles.staticControl}>Try blocked write</span>
            <small>Copy the SQL into a custom graph card and press Run — charts never render themselves.</small>
          </section>
      </>
    </div>
  )
}

function SlackCompact({ stage }: { stage: number }): ReactElement {
  const routes = ['Channels', 'Simulator', 'Memory', 'Logs', 'Ratings', 'Threads']
  const route = routes[Math.min(stage, routes.length - 1)]
  const routeDetails: Record<string, ReactElement> = {
    Channels: <><p className={styles.sectionLabel}>Public channel membership</p><ul className={styles.routeList}><li><strong>#demo-support</strong><span>Member</span></li><li><strong>#demo-updates</strong><span>Member</span></li></ul><button type="button">Refresh</button><small className={styles.gateNote}>Private-channel membership is intentionally not listed.</small></>,
    Simulator: <><p>Ask as a chat user</p><div className={styles.fakeComposer}>Why did the demo request slow down?<button type="button">Simulate thread</button></div><p className={styles.sectionLabel}>Recorded thread</p><div className={styles.slackMsg}><span aria-hidden="true">◆</span><p><strong>Demo support bot</strong> <span className={styles.appTag}>SIMULATED</span><br />I found a release timing change and posted a reviewable summary.</p></div></>,
    Memory: <><p>Bounded memories supply prior context only when relevant to the thread.</p><ul className={styles.routeList}><li><strong>Human feedback</strong><span>retained</span></li><li><strong>Resolved demo pattern</strong><span>reviewed</span></li></ul><small className={styles.gateNote}>No memory is written by this simulator.</small></>,
    Logs: <><p className={styles.sectionLabel}>Recent agent activity</p><ul className={styles.logList}><li><strong>trigger</strong><span>message matched demo channel scope</span><small>09:14</small></li><li><strong>tool</strong><span>read bounded demo context</span><small>09:14</small></li><li><strong>response</strong><span>posted simulated summary</span><small>09:15</small></li></ul></>,
    Ratings: <><p>Thread outcome feedback keeps the bot maintainable.</p><div className={styles.ratingRow}><button type="button">Correct</button><button type="button">Partly correct</button><button type="button">Wrong</button></div><small className={styles.gateNote}>Ratings stay on this page.</small></>,
    Threads: <><p className={styles.sectionLabel}>Recent threads</p><ul className={styles.threadList}><li><Pill tone="ok">answered</Pill><strong>Weekly update request</strong><small>3 messages · 9m ago</small></li><li><Pill tone="info">working</Pill><strong>Demo incident question</strong><small>2 messages · now</small></li><li><Pill tone="neutral">resolved</Pill><strong>Access guide lookup</strong><small>5 messages · yesterday</small></li></ul></>,
  }
  return (
    <div className={styles.compactView} data-compact-view="slack-builder">
      <div className={styles.botProfileHeader}>
        <span className={styles.botAvatar} aria-hidden="true">◆</span>
        <div><strong>Demo support bot</strong><p>Answers support questions with bounded context and visible review controls.</p></div>
        <Pill tone="ok">Production</Pill>
      </div>
      <div className={styles.routeTabs} role="tablist" aria-label="Slackbot profile routes">
        {routes.map((item) => <span key={item} data-selected={route === item || undefined}>{item}</span>)}
      </div>
      <section className={styles.panel}><h3>{route}</h3>{routeDetails[route]}</section>
    </div>
  )
}

const MARKET_SKILLS = {
  'Incident recap': ['v1.2.0', 'incident · summary · weekly', 'plugin install incident-recap'],
  'Response checklist': ['v0.9.1', 'response · runbook', 'plugin install response-checklist'],
  'Status formatter': ['v2.0.0', 'status · formatting', 'plugin install status-formatter'],
} as const

function PlaygroundsCompact({ stage }: { stage: number }): ReactElement {
  const details = Object.keys(MARKET_SKILLS) as Array<keyof typeof MARKET_SKILLS>
  const detail = details[Math.min(stage, details.length - 1)]
  const [version, keywords, install] = MARKET_SKILLS[detail]
  return (
    <div className={styles.compactView} data-compact-view="playgrounds-skills">
      <p className={styles.sectionLabel}>Playground hub · ship internal experiments fast</p>
      <div className={styles.hubCards} role="group" aria-label="Fictional playground cards">
        <article><strong>Triage helper</strong><Pill tone="warn">WIP</Pill><small>Updated this week</small></article>
        <article><strong>Accuracy analysis</strong><Pill tone="ok">Active</Pill><small>Updated today</small></article>
        <article data-inert="true"><strong>Review queue</strong><Pill tone="neutral">Coming soon</Pill><small>Not yet clickable</small></article>
      </div>
      <div className={styles.marketplace}>
        <section>
          <h3>Marketplace browse</h3>
          <label>Instant filter<input value="triage" readOnly /></label>
          <span className={styles.staticControl}>AI search</span>
          <p className={styles.banner} role="status">AI results for triage — 2 matches</p>
          {details.map((item) => (
            <span className={styles.staticControl} key={item} data-selected={detail === item || undefined}>{item}</span>
          ))}
        </section>
        <section>
          <h3>{detail} <Pill tone="neutral">{version}</Pill></h3>
          <p className={styles.reasonChip}>Matches: summarizes demo incidents for weekly review</p>
          <p className={styles.metaText}>{keywords}</p>
          <p className={styles.installRow}><code>{install}</code><CopyLabel /></p>
          <span className={styles.staticControl}>Try it in chat</span>
          <small className={styles.gateNote}>Sandboxed tryout · no install, no tool calls</small>
        </section>
        <section>
          <h3>Publication review</h3>
          <p className={styles.lifecyclePath}>
            <Pill tone="neutral">Draft</Pill> → <Pill tone="warn">Pending review</Pill> → <Pill tone="ok">Published</Pill>
          </p>
          <p>A human merges the change request. Publishing is never automatic.</p>
        </section>
      </div>
    </div>
  )
}

const CMDK_RESULTS = [
  ['Apps', 'Triage overview', 'production', 'triage · incidents'],
  ['Pages', 'Attainment matrix', '', 'usage · weekly'],
  ['MCP servers', 'Read-only SQL', 'production', 'data · read-only'],
  ['Skills', 'Incident recap', 'experimental', 'triage · summary'],
] as const

function CmdKCompact({ stage }: { stage: number }): ReactElement {
  const active = Math.min(stage, CMDK_RESULTS.length - 1)
  return (
    <div className={styles.compactView} data-compact-view="cmd-k-discovery">
      <div
        className={styles.commandPalette}
        aria-label="Scripted command palette with autoplaying highlighted result"
      >
        <div className={styles.commandQuery}>
          <kbd>⌘K</kbd>
          <span>triage — search apps and pages</span>
          <strong>FIXED QUERY</strong>
          <kbd>esc</kbd>
        </div>
        <ul>
          {CMDK_RESULTS.map(([group, title, lifecycle, tags], index) => (
            <li key={group} aria-current={active === index ? 'true' : undefined} data-remote={index >= 2 && stage < 2 ? 'pending' : undefined}>
              <span>{group}</span>
              <strong>
                {title}
                {lifecycle ? <em className={styles.lifecycleBadge} data-tone={lifecycle === 'production' ? 'ok' : 'warn'}>{lifecycle}</em> : null}
              </strong>
              <small>{index >= 2 && stage < 2 ? 'Still searching the catalog for more…' : tags}</small>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.resultNote}>
        Local results are instant; catalog groups add up to three results each. Autoplaying highlight · fixed local data · no input or network request
      </p>
    </div>
  )
}

export default function CompactToolView({ toolId, stage }: { toolId: HedwigToolId; stage: number }): ReactElement {
  if (toolId === 'on-call') return <OnCallCompact stage={stage} />
  if (toolId === 'remote-code') return <RemoteCompact stage={stage} />
  if (toolId === 'customer-api') return <CustomerApiCompact stage={stage} />
  if (toolId === 'databricks-mcp') return <DatabricksCompact stage={stage} />
  if (toolId === 'slack-builder') return <SlackCompact stage={stage} />
  if (toolId === 'playgrounds-skills') return <PlaygroundsCompact stage={stage} />
  return <CmdKCompact stage={stage} />
}
