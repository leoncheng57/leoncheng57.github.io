import { describe, expect, it } from 'vitest'
import { MAX_DIAGRAM_WIDTH, TOOLS } from './tools'

describe('TOOLS', () => {
  it('gives every tool a unique id, a name, and a blurb', () => {
    const ids = TOOLS.map((tool) => tool.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const tool of TOOLS) {
      expect(tool.name.trim()).not.toBe('')
      expect(tool.blurb.trim()).not.toBe('')
    }
  })

  it('keeps every diagram narrow enough for a two-column card', () => {
    // A diagram that overflows its card is invisible until it renders on a
    // narrow viewport, so the bound is asserted rather than eyeballed.
    for (const tool of TOOLS) {
      const widest = Math.max(...tool.diagram.split('\n').map((line) => line.length))
      expect(widest, `${tool.id} diagram is ${widest} chars`).toBeLessThanOrEqual(
        MAX_DIAGRAM_WIDTH
      )
    }
  })

  it('keeps every diagram short enough to sit at the foot of a card', () => {
    for (const tool of TOOLS) {
      expect(tool.diagram.split('\n').length, tool.id).toBeLessThanOrEqual(4)
    }
  })

  it('covers the capabilities the chapter claims', () => {
    const ids = TOOLS.map((tool) => tool.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        'plan-mode',
        'manager-runs',
        'preview-proxy',
        'worktrees',
        'notifications',
      ])
    )
    expect(TOOLS.length).toBeGreaterThanOrEqual(10)
  })

  it('links the beta package card to the v0.0.1 prerelease', () => {
    const packaging = TOOLS.find((tool) => tool.id === 'packaging')
    expect(packaging?.blurb).toMatch(/v0\.0\.1 prerelease/i)
    expect(packaging?.blurb).toMatch(/remains beta/i)
    expect(packaging?.href).toBe(
      'https://github.com/leoncheng57/Customizable-DCA-OpenHands/releases/tag/v0.0.1'
    )
  })

  it('keeps internal platform names out of the copy', () => {
    const copy = JSON.stringify(TOOLS)
    expect(copy).not.toMatch(/deepl/i)
    expect(copy).not.toMatch(/helix/i)
  })
})
