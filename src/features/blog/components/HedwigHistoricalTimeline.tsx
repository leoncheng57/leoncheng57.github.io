import type { ReactElement } from 'react'
import HistoricalTimeline from '../../../components/historical-timeline'
import type { HistoricalTimelineEntry } from '../../../components/historical-timeline'

const entries: HistoricalTimelineEntry[] = [
  {
    version: 'v0.0.1',
    date: 'March 11, 2026',
    dateTime: '2026-03-11',
    stage: 'Built',
    milestone: 'The first investigation engine, queue, server, and basic UI were implemented.',
    highlights: ['Bounded investigation jobs entered a queue.', 'A basic UI exposed progress and the final report.', 'The initial scope centered on one on-call workflow.'],
    evidence: ['Initial platform implementation'],
  },
  {
    version: 'v0.1.0',
    date: 'March 16, 2026',
    dateTime: '2026-03-16',
    stage: 'Released',
    milestone: 'The release path added version tags, image builds, and controlled promotion.',
    highlights: ['A repeatable image build established delivery consistency.', 'Promotion made the release boundary explicit.', 'Release mechanics became shared platform infrastructure.'],
    evidence: ['Early release milestone'],
  },
  {
    version: 'v0.1.1',
    date: 'March 18, 2026',
    dateTime: '2026-03-18',
    stage: 'Released',
    milestone: 'The original on-call application first shipped with a visible product identity and a containerized local workflow.',
    highlights: ['The on-call workflow received a distinct product surface.', 'Local container workflows made development repeatable.', 'The application could be reviewed as a complete user flow.'],
    evidence: ['Release milestone and implementation record'],
  },
  {
    version: 'v0.1.2',
    date: 'March 20, 2026',
    dateTime: '2026-03-20',
    stage: 'Deployed',
    milestone: 'A source revision was explicitly recorded as deployed through the long-lived release path.',
    highlights: ['A durable deployment record connected code to a release.', 'The long-lived environment became a distinct operational concern.', 'A deployment record alone was not treated as proof of rollout.'],
    evidence: ['Deployment record'],
  },
  {
    version: 'v0.2.0',
    date: 'April 9, 2026',
    dateTime: '2026-04-09',
    stage: 'Instrumented',
    milestone: 'Langfuse tracing support entered the versioned platform source.',
    highlights: ['Model calls and agent spans gained a common inspection surface.', 'Trace presence required exercised instrumentation to verify.', 'Observability became a reusable platform capability.'],
    evidence: ['Tracing implementation record'],
  },
  {
    version: 'v0.2.1',
    date: 'April 23, 2026',
    dateTime: '2026-04-23',
    stage: 'Expanded',
    milestone: 'Persistent storage gained a durable database option alongside the local path.',
    highlights: ['Workflows could retain durable state beyond local development.', 'The local path remained useful for iteration.', 'Persistence moved from app-specific setup toward shared plumbing.'],
    evidence: ['Storage implementation record'],
  },
  {
    version: 'v0.3.0',
    date: 'May 20, 2026',
    dateTime: '2026-05-20',
    stage: 'Observed',
    milestone: 'A usage snapshot showed wide visibility of the original application, while hands-on use was concentrated among a smaller group.',
    highlights: ['Awareness and repeated use were measured separately.', 'Concentrated hands-on use informed the next investment decisions.', 'Activity was not presented as proof of value.'],
    evidence: ['Usage snapshot from May 2026'],
  },
  {
    version: 'v0.4.0',
    date: 'May 21, 2026',
    dateTime: '2026-05-21',
    stage: 'Reframed',
    milestone: 'The UI changed from a single product into Hedwig, with the original assistant retained as its first application.',
    highlights: ['A shared shell replaced the single-product framing.', 'The original assistant remained a focused application.', 'The platform could now host distinct workflow surfaces.'],
    evidence: ['Platform reframing release record'],
  },
  {
    version: 'v0.4.1',
    date: 'May 21, 2026',
    dateTime: '2026-05-21',
    stage: 'Expanded',
    milestone: 'The first clearly separate vertical application was added, demonstrating the shell could support more than its original domain.',
    highlights: ['A second domain validated the application boundary.', 'Shared foundations avoided rebuilding the surrounding plumbing.', 'Independent workflows could carry different user experiences.'],
    evidence: ['Application implementation record'],
  },
  {
    version: 'v0.4.2',
    date: 'May 21-26, 2026',
    dateTime: '2026-05-21',
    stage: 'Platformized',
    milestone: 'Registry-driven client navigation and a server-side application manifest replaced manual application wiring.',
    highlights: ['Application metadata became a formal registration contract.', 'Navigation followed the registered catalog instead of manual wiring.', 'New applications could use a repeatable entry path.'],
    evidence: ['Navigation and manifest implementation records'],
  },
  {
    version: 'v0.5.0',
    date: 'June 2-5, 2026',
    dateTime: '2026-06-02',
    stage: 'Expanded',
    milestone: 'Planning and coding-agent applications joined the platform, including the first isolated workspace workflow.',
    highlights: ['Planning and code workflows broadened the supported task shapes.', 'Errol, the background coding agent, introduced an isolated workspace with files, logs, previews, and follow-up.', 'The delivery model expanded beyond conversational interactions.'],
    evidence: ['Planning and workspace implementation records'],
  },
  {
    version: 'v0.5.1',
    date: 'June 2026',
    dateTime: '2026-06-12',
    stage: 'Discoverable',
    milestone: 'Source history shows skills discovery becoming a platform capability.',
    highlights: ['Skills could be found through a common discovery surface.', 'Metadata distinguished availability from adoption.', 'Discovery became coupled to ownership and lifecycle information.'],
    evidence: ['Feature development visible in June 2026 source history'],
  },
  {
    version: 'v0.6.0',
    date: 'June 30, 2026',
    dateTime: '2026-06-30',
    stage: 'Generalized',
    milestone: 'A shared workspace-agent manager made isolated execution a platform capability rather than application-specific plumbing.',
    highlights: ['Workspace lifecycle management moved into the platform.', 'Applications reused controlled runtime setup and cleanup.', 'Capacity controls and resilient Kubernetes jobs became shared operational guardrails.'],
    evidence: ['Shared workspace implementation record'],
  },
  {
    version: 'v0.6.1',
    date: 'July 10-12, 2026',
    dateTime: '2026-07-10',
    stage: 'Extended',
    milestone: 'A reusable collaboration-agent framework shipped, followed by a dark launch that moved another workload onto isolated workspace execution.',
    highlights: ['Collaboration workflows adopted a reusable agent foundation.', 'A second workload exercised the workspace execution path.', 'Incremental rollout limited the risk of a new operating model.'],
    evidence: ['Collaboration and isolated-workspace implementation records'],
  },
  {
    version: 'v0.7.0',
    date: 'July 27, 2026',
    dateTime: '2026-07-27',
    stage: 'Delegated',
    milestone: 'Application-level code ownership was expanded so the platform did not depend on one central maintainer for every change.',
    highlights: ['Path-based ownership clarified review responsibility.', 'Domain maintainers could evolve their own workflows.', 'Platform stewards retained shared-contract responsibilities.'],
    evidence: ['Code ownership record'],
  },
  {
    version: 'v0.8.0',
    date: 'August 8-12, 2026',
    dateTime: '2026-08-08',
    stage: 'Added',
    milestone: 'An interactive coding-agent experience entered beta with durable server-side workspaces, live previews, and a native interface.',
    highlights: ['Interactive coding sessions gained durable workspace state.', 'Live previews and automated merge-request comments improved review of frontend changes.', "Slack thread triggers and OpenHands experiments continued to refine Errol's delivery flow."],
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
