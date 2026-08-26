import { describe, expect, it } from 'vitest'
import { getHedwigTool, HEDWIG_TOOLS } from './tools'

describe('Hedwig tool catalog', () => {
  it('contains exactly the seven sanitized tools in presentation order', () => {
    expect(HEDWIG_TOOLS).toHaveLength(7)
    expect(HEDWIG_TOOLS.map((tool) => tool.id)).toEqual([
      'on-call', 'remote-code', 'customer-api', 'databricks-mcp', 'slack-builder',
      'playgrounds-skills', 'cmd-k-discovery',
    ])
    expect(new Set(HEDWIG_TOOLS.map((tool) => tool.id)).size).toBe(7)
    expect(JSON.stringify(HEDWIG_TOOLS).toLowerCase()).not.toContain('data-helper')
    expect(JSON.stringify(HEDWIG_TOOLS).toLowerCase()).not.toContain('data team helper')
  })

  it('keeps every scenario complete, fictional, and sanitized', () => {
    const denylist = [
      /\bdeepl\b/i,
      /\bsupabase\b/i,
      /deepl\.dev/i,
      /gitlab\.com/i,
      /https?:\/\//i,
      /\bwww\./i,
      /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?:\/[^\s]*)?\b/i,
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
      /\b(?:api[_ -]?key|access[_ -]?token|secret|token)\s*[:=]\s*["']?[A-Z0-9_-]{8,}/i,
      /\b(?:ghp|glpat|sk|xox[baprs])[-_][A-Z0-9_-]{8,}\b/i,
      /\beyJ[A-Z0-9_-]+\.[A-Z0-9_-]+\.[A-Z0-9_-]+\b/i,
      /\b[A-Z0-9_-]{24,}\b/i,
    ]

    for (const tool of HEDWIG_TOOLS) {
      expect(tool.events.length).toBeGreaterThanOrEqual(4)

      for (const event of tool.events) {
        expect(event.label.trim()).not.toBe('')
        expect(event.detail.trim()).not.toBe('')
      }

      const scenarioCopy = [
        tool.title,
        tool.shortTitle,
        tool.summary,
        ...tool.events.flatMap((event) => [event.label, event.detail]),
      ].join(' ')

      for (const deniedPattern of denylist) {
        expect(scenarioCopy).not.toMatch(deniedPattern)
      }
    }
  })

  it('makes the Slack builder review boundary explicit', () => {
    expect(getHedwigTool('slack-builder').events.at(-1)).toEqual({
      label: 'Submit for review',
      detail: 'Simulation stops here. No bot is provisioned.',
    })
  })

  it('uses workflow-specific event counts and a dynamic catalog total', () => {
    const counts = HEDWIG_TOOLS.map((tool) => tool.events.length)
    expect(new Set(counts).size).toBeGreaterThan(1)
    expect(counts.reduce((total, count) => total + count, 0)).toBe(36)
  })

  it('keeps playground publication and discovery results behind safe boundaries', () => {
    expect(getHedwigTool('playgrounds-skills').events.at(-1)?.detail).toMatch(/never automatic/i)
    expect(getHedwigTool('cmd-k-discovery').events.at(-1)?.detail).toMatch(/lifecycle/i)
  })
})
