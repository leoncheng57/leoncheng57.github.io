import type { ReactElement } from 'react'
import HistoricalTimeline from '../../../components/historical-timeline'
import type { HistoricalTimelineEntry } from '../../../components/historical-timeline'

const entries: HistoricalTimelineEntry[] = [
  {
    date: 'March 11, 2026',
    dateTime: '2026-03-11',
    stage: 'Built',
    milestone: 'The first investigation engine, queue, server, and basic UI were implemented.',
    evidence: ['Initial source commit fa920e1e'],
  },
  {
    date: 'March 16, 2026',
    dateTime: '2026-03-16',
    stage: 'Released',
    milestone: 'The release path added version tags, image builds, and controlled promotion.',
    evidence: ['Release v0.1.0, commit 1124a7c3'],
  },
  {
    date: 'March 18, 2026',
    dateTime: '2026-03-18',
    stage: 'Released',
    milestone: 'The original on-call application first shipped with a visible product identity and a containerized local workflow.',
    evidence: ['Release v0.13.0, implementation 7a25576d'],
  },
  {
    date: 'March 20, 2026',
    dateTime: '2026-03-20',
    stage: 'Deployed',
    milestone: 'A source revision was explicitly recorded as deployed through the long-lived release path.',
    evidence: ['Release v0.15.1, commit 9a146f55'],
  },
  {
    date: 'April 9, 2026',
    dateTime: '2026-04-09',
    stage: 'Instrumented',
    milestone: 'Langfuse tracing support entered the versioned platform source.',
    evidence: ['Release v0.27.0, commit 1831bcb1'],
  },
  {
    date: 'April 23, 2026',
    dateTime: '2026-04-23',
    stage: 'Expanded',
    milestone: 'Persistent storage gained a durable database option alongside the local path.',
    evidence: ['Release v0.63.0, implementation ce92b504'],
  },
  {
    date: 'May 20, 2026',
    dateTime: '2026-05-20',
    stage: 'Observed',
    milestone: 'A checked-in usage snapshot showed broad awareness of the original application, while also showing that hands-on use was concentrated.',
    evidence: ['Dated internal analytics report'],
  },
  {
    date: 'May 21, 2026',
    dateTime: '2026-05-21',
    stage: 'Reframed',
    milestone: 'The UI changed from a single product into Hedwig, with the original assistant retained as its first application.',
    evidence: ['Release v0.136.0, commit b36e0327'],
  },
  {
    date: 'May 21, 2026',
    dateTime: '2026-05-21',
    stage: 'Expanded',
    milestone: 'The first clearly separate vertical application was added, proving the shell could support more than its original domain.',
    evidence: ['Release v0.141.0, implementation eb88cf55'],
  },
  {
    date: 'May 21-26, 2026',
    dateTime: '2026-05-21',
    stage: 'Platformized',
    milestone: 'Registry-driven client navigation and a server-side application manifest replaced manual application wiring.',
    evidence: ['Releases v0.145.0 and v0.158.0, commits 3b43e8e6 and 982d1177'],
  },
  {
    date: 'June 2-5, 2026',
    dateTime: '2026-06-02',
    stage: 'Expanded',
    milestone: 'Planning and coding-agent applications joined the platform, including the first isolated workspace workflow.',
    evidence: ['Releases v0.188.0 and v0.202.0, commits 94395de7 and aff56718'],
  },
  {
    date: 'June 2026',
    dateTime: '2026-06',
    stage: 'Discoverable',
    milestone: 'Source history shows skills discovery becoming a platform capability.',
    evidence: ['Versioned source history; no exact release claimed'],
  },
  {
    date: 'June 30, 2026',
    dateTime: '2026-06-30',
    stage: 'Generalized',
    milestone: 'A shared workspace-agent manager made isolated execution a platform capability rather than application-specific plumbing.',
    evidence: ['Release v1.95.0, commit ae508f50'],
  },
  {
    date: 'July 10-12, 2026',
    dateTime: '2026-07-10',
    stage: 'Extended',
    milestone: 'A reusable collaboration-agent framework shipped, followed by a dark launch that moved another workload onto isolated workspace execution.',
    evidence: ['Releases v1.177.0 and v1.181.0, commits 089f34d5 and 40d92511'],
  },
  {
    date: 'July 27, 2026',
    dateTime: '2026-07-27',
    stage: 'Delegated',
    milestone: 'Application-level code ownership was expanded so the platform did not depend on one central maintainer for every change.',
    evidence: ['Release v1.257.0, commit 8bd4c2dd'],
  },
  {
    date: 'August 8-12, 2026',
    dateTime: '2026-08-08',
    stage: 'Added',
    milestone: 'An interactive coding-agent experience entered beta with durable server-side workspaces, live previews, and a native interface.',
    evidence: ['Releases v1.317.0 and v1.329.0, commits b43219fe and d41207af'],
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
