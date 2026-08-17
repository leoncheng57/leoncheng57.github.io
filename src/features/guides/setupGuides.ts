import type { Guide } from './types'

/**
 * Setup guides implemented as bespoke React pages rather than markdown
 * chapter documents. They are registered as static routes in App.tsx
 * (above the `/guides/:slug/*` catch-all) and appended to the guides
 * index so they appear alongside the markdown guides.
 */
const setupGuides: Guide[] = [
  {
    slug: 'cmux-personal-config',
    title: 'cmux personal config',
    description:
      'How my cmux configuration is kept portable across laptops: window layout, notification routing for OpenCode agents (silent completions, spoken input prompts), the shared config file, and the installer.',
    updatedAt: '2026-08-17',
    tags: ['cmux', 'opencode', 'setup'],
    overview: '',
    readingTimeMinutes: 4,
    chapters: [],
  },
  {
    slug: 'opencode-personal-config',
    title: 'opencode personal config',
    description:
      'How my OpenCode configuration is structured and reinstalled: repository layout, MCP servers by transport, skills and agents, environment-variable secret handling, and the installer.',
    updatedAt: '2026-08-17',
    tags: ['opencode', 'mcp', 'setup'],
    overview: '',
    readingTimeMinutes: 4,
    chapters: [],
  },
]

export function getSetupGuides(): Guide[] {
  return setupGuides
}
