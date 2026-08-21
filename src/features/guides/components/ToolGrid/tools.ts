/**
 * The catalogue behind the "tools I built" chapter: everything the control
 * plane adds on top of the stock agent server, one card each.
 *
 * Pure data so the copy is unit-testable. Diagrams are plain text rendered in
 * a monospace block inside the card, so they must stay narrow — the width is
 * asserted in tools.test.ts, because a diagram that overflows its card is not
 * obvious until it renders on a narrow viewport.
 */

export interface Tool {
  id: string
  name: string
  /** One or two sentences. Kept short: the card is a catalogue entry. */
  blurb: string
  /** A small ASCII sketch. Lines must stay within MAX_DIAGRAM_WIDTH. */
  diagram: string
}

/**
 * Widest line a diagram may use before it overflows a two-column card.
 * Measured, not guessed: the grid sits in the article column (~760px), so a
 * card is ~370px, which fits about 44 monospace characters at this size.
 */
export const MAX_DIAGRAM_WIDTH = 44

export const TOOLS: Tool[] = [
  {
    id: 'plan-mode',
    name: 'Plan mode',
    blurb:
      'Start read-only. The agent researches and proposes; the first write parks the run until I approve, and approving flips the same conversation to Build without restarting it.',
    diagram: ['read → read → write?', '        │', '        ▼', 'waiting → approve → build'].join(
      '\n'
    ),
  },
  {
    id: 'turn-reminders',
    name: 'Turn reminders',
    blurb:
      'Standing instructions appended to every message I send, so rules like “cite file:line” survive a long transcript instead of decaying as history is condensed.',
    diagram: ['my message ──┐', '             ├─► agent', 'reminders ───┘'].join('\n'),
  },
  {
    id: 'manager-runs',
    name: 'Manager runs',
    blurb:
      'One conversation plans waves of work and launches parallel workers, each on its own branch. Judgement lives in the model; wave caps, validation, and phase tracking live in ordinary code.',
    diagram: ['manager ──► wave 1 ──┬─► worker → PR', '                     ├─► worker → PR', '                     └─► worker → PR'].join('\n'),
  },
  {
    id: 'skill-toggles',
    name: 'Skill toggles',
    blurb:
      'One list of every skill the agent can load, with an on/off that sticks — including the auto-loaded ones, which otherwise cannot be turned off at all.',
    diagram: ['installed ─┐', 'public   ──┼─► effective ── deny ──► agent', 'user     ──┘'].join(
      '\n'
    ),
  },
  {
    id: 'settings-forwarding',
    name: 'Settings that reach a run',
    blurb:
      'The stock server does not merge your saved profile into a new conversation. The backend forwards it explicitly, through an allow-list so masked secrets are never copied.',
    diagram: ['saved profile', '   └─► allow-list ──► new conversation'].join('\n'),
  },
  {
    id: 'context-tuning',
    name: 'Context tuning',
    blurb:
      'How early history gets summarised is exposed as a setting, because the default only triggers on event count and long sessions crawl.',
    diagram: 'history grows ──► threshold ──► condense',
  },
  {
    id: 'preview-proxy',
    name: 'Live preview proxy',
    blurb:
      'The agent starts a dev server inside the container; I open it same-origin at a conversation-scoped URL, with no port published per task.',
    diagram: ['dev server :2xxxx', '        │  BFF proxy', '        ▼', '/conversations/<id>/preview'].join('\n'),
  },
  {
    id: 'worktrees',
    name: 'Project grid and worktrees',
    blurb:
      'The home screen is my real folders, not a blank prompt, and a task defaults to its own detached worktree so parallel agents cannot collide.',
    diagram: ['main checkout ─┬─ session A → feat/a', '               ├─ session B → fix/b', '               └─ session C → docs/c'].join('\n'),
  },
  {
    id: 'command-palette',
    name: 'Command palette',
    blurb:
      'Cmd/Ctrl+K over pages, docs, and every conversation. Hand-rolled, ranked title-prefix first, and no new dependency.',
    diagram: ['⌘K ──► rank matches ──► jump', '       title > word > substring'].join('\n'),
  },
  {
    id: 'notifications',
    name: 'Three notification channels',
    blurb:
      'Finished, error, stuck, and needs-input, delivered as a phone push, a chime, or a desktop banner that deep-links back into the conversation.',
    diagram: ['run event ──┬─► push (phone)', '            ├─► chime (tab)', '            └─► banner (OS)'].join('\n'),
  },
  {
    id: 'phone-access',
    name: 'Phone access',
    blurb:
      'One flag on the dev script detects the tailnet name and opens the same app to a phone; execution never leaves the laptop.',
    diagram: 'phone ──tailnet──► same BFF ──► my machine',
  },
  {
    id: 'packaging',
    name: 'One-command install',
    blurb:
      'The packaged build puts the UI, the backend, and the agent container behind a single browser port, so Docker is the only prerequisite. Still beta.',
    diagram: ['install.sh ──► app + agent containers', '           ──► one browser port'].join('\n'),
  },
]
