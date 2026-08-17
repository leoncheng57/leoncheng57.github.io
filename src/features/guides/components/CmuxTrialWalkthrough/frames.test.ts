import { describe, expect, it } from 'vitest'
import { STATUS_PHASES, TRIAL_FRAMES } from './frames'
import type { StatusPhase } from './frames'

describe('cmux trial walkthrough frames', () => {
  it('has the expected number of scripted frames', () => {
    expect(TRIAL_FRAMES.length).toBeGreaterThanOrEqual(7)
    expect(TRIAL_FRAMES.length).toBeLessThanOrEqual(9)
  })

  it('gives every frame a unique id, a title, and a non-empty caption', () => {
    const ids = new Set<string>()
    for (const frame of TRIAL_FRAMES) {
      expect(frame.id.length).toBeGreaterThan(0)
      expect(ids.has(frame.id)).toBe(false)
      ids.add(frame.id)
      expect(frame.title.trim().length).toBeGreaterThan(0)
      expect(frame.caption.trim().length).toBeGreaterThan(0)
      expect(frame.transcript.length).toBeGreaterThan(0)
      for (const line of frame.transcript) {
        expect(line.text.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('only uses phases from the status protocol vocabulary', () => {
    const legal = new Set<StatusPhase>(STATUS_PHASES)
    for (const frame of TRIAL_FRAMES) {
      for (const workspace of frame.workspaces) {
        if (workspace.statusPhase !== null) {
          expect(legal.has(workspace.statusPhase)).toBe(true)
        }
      }
    }
  })

  it("names child workspaces with the guide's Child: prefix", () => {
    for (const frame of TRIAL_FRAMES) {
      for (const workspace of frame.workspaces) {
        if (workspace.id === 'manager') {
          expect(workspace.name).toBe('manager')
        } else {
          expect(workspace.name.startsWith('Child: ')).toBe(true)
        }
      }
    }
  })

  it('always focuses a workspace present in the frame', () => {
    for (const frame of TRIAL_FRAMES) {
      expect(frame.workspaces.some((workspace) => workspace.id === frame.focusWorkspace)).toBe(
        true
      )
    }
  })

  it('tells the scripted story: plan first, dispatch grows the sidebar, recap last', () => {
    const first = TRIAL_FRAMES[0]
    expect(first.workspaces).toHaveLength(1)
    expect(first.workspaces[0].id).toBe('manager')
    expect(first.workspaces[0].actor).toBe('human')

    const dispatch = TRIAL_FRAMES[1]
    expect(dispatch.workspaces).toHaveLength(4)

    const last = TRIAL_FRAMES[TRIAL_FRAMES.length - 1]
    expect(last.recap).toBeDefined()
    expect(last.recap && last.recap.humanMinutes).toBeGreaterThan(0)
    expect(last.recap && last.recap.aiMinutes).toBeGreaterThan(0)
    expect(last.recap && last.recap.waitMinutes).toBeGreaterThan(0)
    // Only the recap frame carries totals.
    expect(TRIAL_FRAMES.filter((frame) => frame.recap).length).toBe(1)
  })

  it('surfaces the draft-PR toast on the frame where worker B finishes first', () => {
    const toastFrames = TRIAL_FRAMES.filter((frame) => frame.toast)
    expect(toastFrames.length).toBeGreaterThanOrEqual(1)
    const first = toastFrames[0]
    expect(first.toast).toMatch(/Child: Task B/)
    const taskB = first.workspaces.find((workspace) => workspace.id === 'task-b')
    expect(taskB?.actor).toBe('waiting')
    expect(taskB?.statusPhase).toBe('pr-open')
  })

  it('keeps the walkthrough consistent with the real conventions', () => {
    const allText = TRIAL_FRAMES.flatMap((frame) =>
      frame.transcript.map((line) => line.text)
    ).join('\n')
    expect(allText).toContain('git worktree add -b')
    expect(allText).toContain('.agent-status.json')
    expect(allText).toContain('gh pr create --draft')
    expect(allText).toContain('cmux notify')
    expect(allText).toContain('date -u +%Y-%m-%dT%H:%M:%SZ')
    expect(allText).toContain('git merge --no-ff')
  })
})
