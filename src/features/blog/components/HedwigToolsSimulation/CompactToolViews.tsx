import { useState } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import type { HedwigToolId } from './tools'
import styles from './HedwigToolsSimulation.module.css'

const Status = ({ children }: { children: string }): ReactElement => (
  <span className={styles.statusPill}>{children}</span>
)

function OnCallCompact({ stage }: { stage: number }): ReactElement {
  const lifecycle = ['Detect', 'Triage', 'Investigate', 'Reproduce', 'Coordinate', 'Resolve']
  return (
    <div className={styles.compactView} data-compact-view="on-call">
      <div className={styles.compactToolbar}><Status>{stage >= 5 ? 'Status: handoff ready' : 'Status: investigating'}</Status><button type="button">Acknowledge locally</button><button type="button">Draft update</button></div>
      <ol className={styles.lifecycle} aria-label="Six-step investigation lifecycle">
        {lifecycle.map((item, index) => <li key={item} data-ready={index <= stage}><span>{index + 1}</span><strong>{item}</strong><small>{index <= stage ? 'Complete' : 'Waiting'}</small></li>)}
      </ol>
      <div className={styles.detailGrid}>
        <section><h3>Triage</h3><p>Demo checkout latency · moderate impact · owner assessing.</p></section>
        <section><h3>Cause and evidence</h3><p>Hypothesis: synthetic cache setting changed. Evidence: timing shift follows demo release.</p></section>
        <section><h3>Reproduction</h3><p>Local fixture: expected 180 ms; observed 640 ms. No production request made.</p></section>
        <section><h3>Contacts and action items</h3><p>Primary responder · service steward · revert draft awaiting approval.</p></section>
      </div>
      <details><summary>Discussion and investigation log</summary><p>09:12 signal grouped · 09:16 human gate opened · 09:21 reproduction recorded.</p></details>
    </div>
  )
}

function RemoteCompact(): ReactElement {
  const [tab, setTab] = useState<'delegated' | 'interactive'>('delegated')
  const [panel, setPanel] = useState('Files')
  return (
    <div className={styles.compactView} data-compact-view="remote-code">
      <div className={styles.tabs} role="tablist" aria-label="Remote runner modes">
        <button role="tab" aria-selected={tab === 'delegated'} onClick={() => setTab('delegated')}>Delegated jobs</button>
        <button role="tab" aria-selected={tab === 'interactive'} onClick={() => setTab('interactive')}>Interactive workspace</button>
      </div>
      {tab === 'delegated' ? <div className={styles.detailGrid}>
        <section><h3>Launch</h3><p>Task: update a demo parser fixture.</p><button type="button">Launch local job</button></section>
        <section><h3>Status</h3><Status>Result ready for review</Status><p>Sandbox isolated · writes contained.</p></section>
        <section><h3>Run history</h3><p>Run 014 · 3 checks passed · 1 patch proposed.</p></section>
        <section><h3>Log</h3><code>fixture loaded<br />checks complete<br />patch packaged</code></section>
      </div> : <>
        <div className={styles.detailGrid}><section><h3>Checklist</h3><p>Inspect fixture · edit parser · run checks · request review.</p></section><section><h3>Transcript</h3><p>Workspace created. Waiting for local direction.</p></section></div>
        <div className={styles.tabs} role="tablist" aria-label="Interactive workspace panels">{['Files', 'Changes', 'Preview', 'Commands', 'Change request'].map((item) => <button key={item} role="tab" aria-selected={panel === item} onClick={() => setPanel(item)}>{item}</button>)}</div>
        <section className={styles.panel}><h3>{panel}</h3><p>{panel} contains safe invented workspace data. Review and merge confirmation stay local.</p><button type="button">Confirm local review</button></section>
      </>}
    </div>
  )
}

function CustomerApiCompact(): ReactElement {
  return (
    <div className={styles.compactView} data-compact-view="customer-api">
      <div className={styles.filters} aria-label="Fictional usage filters"><label>Customer<select defaultValue="Acorn demo"><option>Acorn demo</option></select></label><label>Period<select defaultValue="Last 4 weeks"><option>Last 4 weeks</option></select></label><label>Region<select defaultValue="Demo east"><option>Demo east</option></select></label></div>
      <div className={styles.kpis}><section><span>Requests</span><strong>208k</strong><small>Fictional total</small></section><section><span>Attainment</span><strong>96%</strong><small>Demo target</small></section><section><span>Error rate</span><strong>0.7%</strong><small>Invented metric</small></section></div>
      <div className={styles.tableScroll}><table><caption>Weekly attainment matrix</caption><thead><tr><th>Week</th><th>Usage</th><th>Target</th><th>Status</th></tr></thead><tbody>{[['W1','42k','45k','Below target'],['W2','51k','48k','Above target'],['W3','47k','50k','Below target'],['W4','68k','55k','Above target']].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>
      <div className={styles.detailGrid}><section><h3>Error trend</h3><div className={styles.sparkBars} role="img" aria-label="Invented errors: 8, 5, 7, 3"><i /><i /><i /><i /></div></section><section><h3>Usage trend</h3><div className={styles.sparkBars} role="img" aria-label="Invented usage: 42, 51, 47, 68"><i /><i /><i /><i /></div></section><section><h3>Consumption view</h3><p>Core 61% · batch 24% · preview 15%. All values synthetic.</p></section></div>
    </div>
  )
}

function DatabricksCompact(): ReactElement {
  const [tab, setTab] = useState('Input')
  const [blocked, setBlocked] = useState(false)
  const descriptions: Record<string, string> = {
    Input: 'Synthetic SQL: SELECT week, total FROM demo_usage_summary',
    Lifecycle: 'Queued → policy checked → running → completed',
    Result: 'Three aggregate rows. No customer records.',
    Safety: 'Read-only policy active. Mutation operations are blocked.',
  }
  return <div className={styles.compactView} data-compact-view="databricks-mcp">
    <p className={styles.traceNotice}>Simulated MCP trace — not a live Databricks interface</p>
    <div className={styles.traceLayout}><ol className={styles.callList} aria-label="Simulated call list"><li><Status>Completed</Status><strong>catalog.list</strong></li><li><Status>{blocked ? 'Blocked write' : 'Completed'}</Status><strong>{blocked ? 'table.update' : 'statement.execute'}</strong></li></ol><div><div className={styles.tabs} role="tablist" aria-label="Trace detail tabs">{Object.keys(descriptions).map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div><section className={styles.panel}><h3>{tab}</h3><p>{descriptions[tab]}</p>{tab === 'Safety' && <button type="button" onClick={() => setBlocked(true)}>Try blocked write</button>}<button type="button">Use generated query</button><small>Local review gate only</small></section></div></div>
  </div>
}

function SlackCompact(): ReactElement {
  const steps = ['Basics', 'Purpose', 'Knowledge', 'Destinations', 'Test', 'Review']
  const [step, setStep] = useState(0)
  return <div className={styles.compactView} data-compact-view="slack-builder">
    <div className={styles.stepButtons}>{steps.map((item, index) => <button type="button" key={item} aria-current={step === index ? 'step' : undefined} onClick={() => setStep(index)}><span>{index + 1}</span>{item}</button>)}</div>
    <div className={styles.detailGrid}><section><h3>{steps[step]}</h3><p>{step === 5 ? 'Demo submission is ready. There is no reviewer, manifest, or bot.' : `Scripted ${steps[step].toLowerCase()} choices are shown for local review.`}</p></section><section><h3>Live preview</h3><p><strong>Weekly helper</strong><br />Summarizes canned demo updates.</p></section><section><h3>Local test chat</h3><p>You: Show this week<br />Demo: Three invented updates are ready.</p></section><section><h3>Permission review</h3><p>Read canned messages: requested · Post demo reply: requested · Human approval: required.</p></section></div>
  </div>
}

function PlaygroundsCompact(): ReactElement {
  const [detail, setDetail] = useState('Incident recap')
  return <div className={styles.compactView} data-compact-view="playgrounds-skills">
    <section className={styles.gateCard}><Status>Feature gate: demo cohort only</Status><h3>Private experiment</h3><p>Prompt fixture → local evaluation → evidence packet → human decision.</p><button type="button">Run gated experiment</button></section>
    <div className={styles.marketplace}><section><h3>Marketplace browse</h3><label>Search canned catalog<input value="triage" readOnly /></label>{['Incident recap', 'Response checklist', 'Status formatter'].map((item) => <button type="button" key={item} onClick={() => setDetail(item)}>{item}</button>)}</section><section><h3>{detail}</h3><p>Lifecycle: in review · permission: demo content only · evidence: sample attached.</p><button type="button">Add to review packet</button></section><section><h3>Publication review</h3><p>Owner sign-off and evidence are required. Nothing is automatically published.</p></section></div>
  </div>
}

function CmdKCompact(): ReactElement {
  const results = [['Apps','Triage overview','Approved'],['MCPs','Read-only signals','Permitted'],['Skills','Incident summary','In review'],['Docs','Response guide','Current']]
  const [active, setActive] = useState(0)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    setActive((current) => (current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length)
  }
  return <div className={styles.compactView} data-compact-view="cmd-k-discovery">
    <div className={styles.commandPalette} tabIndex={0} onKeyDown={onKeyDown} aria-label="Scripted command palette; use arrow keys to navigate"><div className={styles.commandQuery}><kbd>⌘K</kbd><span>approved incident triage</span><strong>FIXED QUERY</strong></div><ul>{results.map(([category, title, status], index) => <li key={category} aria-current={active === index ? 'true' : undefined}><span>{category}</span><strong>{title}</strong><small>Lifecycle: {status} · Permission: {category === 'Skills' ? 'Review needed' : 'Allowed'}</small></li>)}</ul></div>
    <p className={styles.resultNote}>Keyboard navigation only · fixed local data · no input or network request</p>
  </div>
}

export default function CompactToolView({ toolId, stage }: { toolId: HedwigToolId; stage: number }): ReactElement {
  if (toolId === 'on-call') return <OnCallCompact stage={stage} />
  if (toolId === 'remote-code') return <RemoteCompact />
  if (toolId === 'customer-api') return <CustomerApiCompact />
  if (toolId === 'databricks-mcp') return <DatabricksCompact />
  if (toolId === 'slack-builder') return <SlackCompact />
  if (toolId === 'playgrounds-skills') return <PlaygroundsCompact />
  return <CmdKCompact />
}
