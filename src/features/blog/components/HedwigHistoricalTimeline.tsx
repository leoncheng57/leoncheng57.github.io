import type { ReactElement } from 'react'
import HistoricalTimeline from '../../../components/historical-timeline'
import type { HistoricalTimelineEntry } from '../../../components/historical-timeline'

const entries: HistoricalTimelineEntry[] = [
  {
    date: 'March 11, 2026',
    dateTime: '2026-03-11',
    stage: 'Built',
    milestone: 'The first investigation engine, queue, server, and basic UI were implemented.',
    evidence: ['Initial platform implementation'],
  },
  {
    date: 'March 16, 2026',
    dateTime: '2026-03-16',
    stage: 'Released',
    milestone: 'The release path added version tags, image builds, and controlled promotion.',
    evidence: ['Early release milestone'],
  },
  {
    date: 'March 18, 2026',
    dateTime: '2026-03-18',
    stage: 'Released',
    milestone: 'The original on-call application first shipped with a visible product identity and a containerized local workflow.',
    evidence: ['Release milestone and implementation record'],
  },
  {
    date: 'March 20, 2026',
    dateTime: '2026-03-20',
    stage: 'Deployed',
    milestone: 'A source revision was explicitly recorded as deployed through the long-lived release path.',
    evidence: ['Deployment record'],
  },
  {
    date: 'April 9, 2026',
    dateTime: '2026-04-09',
    stage: 'Instrumented',
    milestone: 'Langfuse tracing support entered the versioned platform source.',
    evidence: ['Tracing implementation record'],
  },
  {
    date: 'April 23, 2026',
    dateTime: '2026-04-23',
    stage: 'Expanded',
    milestone: 'Persistent storage gained a durable database option alongside the local path.',
    evidence: ['Storage implementation record'],
  },
  {
    date: 'May 20, 2026',
    dateTime: '2026-05-20',
    stage: 'Observed',
    milestone: 'A usage snapshot showed wide visibility of the original application, while hands-on use was concentrated among a smaller group.',
    evidence: ['Usage snapshot from May 2026'],
  },
  {
    date: 'May 21, 2026',
    dateTime: '2026-05-21',
    stage: 'Reframed',
    milestone: 'The UI changed from a single product into Hedwig, with the original assistant retained as its first application.',
    evidence: ['Platform reframing release record'],
  },
  {
    date: 'May 21, 2026',
    dateTime: '2026-05-21',
    stage: 'Expanded',
    milestone: 'The first clearly separate vertical application was added, demonstrating the shell could support more than its original domain.',
    evidence: ['Application implementation record'],
  },
  {
    date: 'May 21-26, 2026',
    dateTime: '2026-05-21',
    stage: 'Platformized',
    milestone: 'Registry-driven client navigation and a server-side application manifest replaced manual application wiring.',
    evidence: ['Navigation and manifest implementation records'],
  },
  {
    date: 'June 2-5, 2026',
    dateTime: '2026-06-02',
    stage: 'Expanded',
    milestone: 'Planning and coding-agent applications joined the platform, including the first isolated workspace workflow.',
    evidence: ['Planning and workspace implementation records'],
  },
  {
    date: 'June 2026',
    dateTime: '2026-06-12',
    stage: 'Discoverable',
    milestone: 'Source history shows skills discovery becoming a platform capability.',
    evidence: ['Feature development visible in June 2026 source history'],
  },
  {
    date: 'June 30, 2026',
    dateTime: '2026-06-30',
    stage: 'Generalized',
    milestone: 'A shared workspace-agent manager made isolated execution a platform capability rather than application-specific plumbing.',
    evidence: ['Shared workspace implementation record'],
  },
  {
    date: 'July 10-12, 2026',
    dateTime: '2026-07-10',
    stage: 'Extended',
    milestone: 'A reusable collaboration-agent framework shipped, followed by a dark launch that moved another workload onto isolated workspace execution.',
    evidence: ['Collaboration and isolated-workspace implementation records'],
  },
  {
    date: 'July 27, 2026',
    dateTime: '2026-07-27',
    stage: 'Delegated',
    milestone: 'Application-level code ownership was expanded so the platform did not depend on one central maintainer for every change.',
    evidence: ['Code ownership record'],
  },
  {
    date: 'August 8-12, 2026',
    dateTime: '2026-08-08',
    stage: 'Added',
    milestone: 'An interactive coding-agent experience entered beta with durable server-side workspaces, live previews, and a native interface.',
    evidence: ['Interactive coding-agent implementation records'],
  },
]

export default function HedwigHistoricalTimeline(): ReactElement {
  return (
    <div>
      <HistoricalTimeline ariaLabel="Hedwig historical timeline" entries={entries} />
      <aside aria-label="Timeline evidence cautions">
        <p>
          A release proves that code reached the release process; it does not by
          itself prove a rollout.
        </p>
        <p>
          An adoption snapshot is evidence of use at a point in time, not proof
          of long-term value.
        </p>
      </aside>
    </div>
  )
}
