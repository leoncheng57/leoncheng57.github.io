/**
 * Static scenario data for the "interleaved vs. delegated" waiting-modes
 * figure embedded in `the-cost-of-waiting-on-agents` blog post.
 *
 * Both scenarios describe the same twenty-tick window. `interleaved` is the
 * plan-mode trap: two questions share one thread, and each answer arrives
 * while attention is on the other question, forcing a switch back.
 * `delegated` is the background-child-agent practice: the long task runs
 * continuously in a child lane, and the parent lane only ever has to
 * answer brief, self-contained questions.
 *
 * This is deterministic, hand-authored data (not a live simulation loop) —
 * click-through between the two modes, no autoplay, matching the other
 * click-through walkthroughs in this codebase.
 */

export type Mode = 'interleaved' | 'delegated'

export type SegmentKind = 'ask' | 'blocked' | 'answer' | 'quick' | 'work' | 'free'

export interface Segment {
  start: number
  end: number
  kind: SegmentKind
  /** Short label rendered inside the segment, when there is room for it. */
  label: string
}

export interface Lane {
  id: string
  label: string
  segments: Segment[]
}

export interface Scenario {
  totalTicks: number
  lanes: Lane[]
  /** How many times attention has to jump back to a thread it left. */
  contextSwitches: number
  narrative: string
}

export const SEGMENT_INFO: Record<SegmentKind, { label: string }> = {
  ask: { label: 'Asking a question' },
  blocked: { label: 'Waiting, blocked' },
  answer: { label: 'Answer arrives, follow-up asked' },
  quick: { label: 'Quick question, parent stays free' },
  work: { label: 'Background work, uninterrupted' },
  free: { label: 'Free, nothing pending' },
}

export const SCENARIOS: Record<Mode, Scenario> = {
  interleaved: {
    totalTicks: 20,
    lanes: [
      {
        id: 'thread-a',
        label: 'Question A',
        segments: [
          { start: 0, end: 2, kind: 'ask', label: 'Ask Q1' },
          { start: 2, end: 9, kind: 'blocked', label: '' },
          { start: 9, end: 11, kind: 'answer', label: 'A1 → follow-up' },
          { start: 11, end: 20, kind: 'blocked', label: '' },
        ],
      },
      {
        id: 'thread-b',
        label: 'Question B',
        segments: [
          { start: 0, end: 2, kind: 'free', label: '' },
          { start: 2, end: 4, kind: 'ask', label: 'Ask Q2' },
          { start: 4, end: 14, kind: 'blocked', label: '' },
          { start: 14, end: 16, kind: 'answer', label: 'A2 → follow-up' },
          { start: 16, end: 20, kind: 'blocked', label: '' },
        ],
      },
    ],
    contextSwitches: 3,
    narrative:
      'Two threads share one session. Q2 gets asked before A1 arrives, so both answers land while attention is somewhere else — each one forces a switch back.',
  },
  delegated: {
    totalTicks: 20,
    lanes: [
      {
        id: 'parent',
        label: 'Parent session',
        segments: [
          { start: 0, end: 1, kind: 'quick', label: 'q' },
          { start: 1, end: 5, kind: 'free', label: '' },
          { start: 5, end: 6, kind: 'quick', label: 'q' },
          { start: 6, end: 10, kind: 'free', label: '' },
          { start: 10, end: 11, kind: 'quick', label: 'q' },
          { start: 11, end: 15, kind: 'free', label: '' },
          { start: 15, end: 16, kind: 'quick', label: 'q' },
          { start: 16, end: 20, kind: 'free', label: '' },
        ],
      },
      {
        id: 'child',
        label: 'Background child agent',
        segments: [{ start: 0, end: 20, kind: 'work', label: 'Long refactor, running the whole time' }],
      },
    ],
    contextSwitches: 0,
    narrative:
      'The long task runs in a background child agent the whole time. The parent session stays free and only ever answers something small and self-contained.',
  },
}
