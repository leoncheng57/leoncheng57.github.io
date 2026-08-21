import { describe, expect, it } from 'vitest'
import { IDE_FRAMES } from './frames'

describe('IDE_FRAMES', () => {
  it('gives every frame a unique id, a title, and a caption', () => {
    const ids = IDE_FRAMES.map((frame) => frame.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const frame of IDE_FRAMES) {
      expect(frame.title.trim()).not.toBe('')
      expect(frame.caption.trim()).not.toBe('')
    }
  })

  it('opens on the project picker with the worktree default left on', () => {
    const first = IDE_FRAMES[0]
    expect(first.screen).toBe('hub')
    expect(first.hub?.worktree).toBe(true)
    expect(first.hub?.projects.length).toBeGreaterThan(1)
  })

  it('tells one story: research, a blocked write, then build', () => {
    const gate = IDE_FRAMES.find((frame) => frame.status === 'waiting_for_confirmation')
    expect(gate).toBeDefined()
    expect(gate?.mode).toBe('plan')
    expect(gate?.confirmation).toBe(true)

    // The gate must come after some read-only research and before any build frame.
    const gateIndex = IDE_FRAMES.indexOf(gate!)
    const firstBuild = IDE_FRAMES.findIndex((frame) => frame.mode === 'build')
    expect(gateIndex).toBeGreaterThan(0)
    expect(firstBuild).toBeGreaterThan(gateIndex)
  })

  it('only risk-labels the write action that parks the run', () => {
    const risky = IDE_FRAMES.flatMap((frame) =>
      (frame.transcript ?? []).filter((row) => row.kind === 'tool' && row.risk)
    )
    expect(risky).toHaveLength(1)
    expect(risky[0]).toMatchObject({ kind: 'tool', risk: 'MEDIUM' })
  })

  it('never lets a task regress once it is done', () => {
    const conversations = IDE_FRAMES.filter((frame) => frame.tasks)
    for (let i = 1; i < conversations.length; i += 1) {
      const before = conversations[i - 1].tasks!
      const after = conversations[i].tasks!
      for (const task of before.filter((t) => t.state === 'done')) {
        const later = after.find((t) => t.title === task.title)
        expect(later?.state).toBe('done')
      }
    }
  })

  it('ends on a finished run with an open pull request', () => {
    const last = IDE_FRAMES[IDE_FRAMES.length - 1]
    expect(last.status).toBe('finished')
    expect(last.panel?.kind).toBe('mr')
    expect(last.tasks?.every((task) => task.state === 'done')).toBe(true)
    expect(last.toast).toBeTruthy()
  })

  it('shows the diff and preview panels somewhere in the run', () => {
    const kinds = IDE_FRAMES.map((frame) => frame.panel?.kind).filter(Boolean)
    expect(kinds).toContain('changes')
    expect(kinds).toContain('preview')
  })

  it('keeps real project and repository names out of the script', () => {
    const script = JSON.stringify(IDE_FRAMES)
    expect(script).not.toMatch(/leoncheng/i)
    expect(script).not.toMatch(/custom-dca-ide/i)
  })
})
