import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import CmuxTrialWalkthrough from './CmuxTrialWalkthrough'
import { TRIAL_FRAMES } from './frames'

describe('CmuxTrialWalkthrough', () => {
  it('starts on frame 1 with Back disabled and the manager planning', () => {
    render(<CmuxTrialWalkthrough />)

    expect(screen.getByText(`1 / ${TRIAL_FRAMES.length}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next step' })).toBeEnabled()
    expect(screen.getByText(new RegExp(`Step 1: ${TRIAL_FRAMES[0].title}`))).toBeInTheDocument()

    const sidebar = screen.getByRole('navigation', { name: 'Simulated cmux workspaces' })
    expect(within(sidebar).getByText('manager')).toBeInTheDocument()
    expect(within(sidebar).queryByText('Child: Task A')).not.toBeInTheDocument()
  })

  it('steps through every frame with Next, then disables Next on the recap', async () => {
    const user = userEvent.setup()
    render(<CmuxTrialWalkthrough />)

    for (let step = 1; step < TRIAL_FRAMES.length; step += 1) {
      await user.click(screen.getByRole('button', { name: 'Next step' }))
      expect(screen.getByText(`${step + 1} / ${TRIAL_FRAMES.length}`)).toBeInTheDocument()
      expect(
        screen.getByText(new RegExp(`Step ${step + 1}: ${TRIAL_FRAMES[step].title}`))
      ).toBeInTheDocument()
    }

    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled()
    // The recap frame shows the three totals.
    expect(screen.getByText('Human hands-on')).toBeInTheDocument()
    expect(screen.getByText('AI working (in parallel)')).toBeInTheDocument()
    expect(screen.getByText('Blocked waiting on a human')).toBeInTheDocument()
  })

  it('shows the sidebar growing and the draft-PR toast mid-run', async () => {
    const user = userEvent.setup()
    render(<CmuxTrialWalkthrough />)

    // Frame 2: dispatch — child workspaces appear.
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    const sidebar = screen.getByRole('navigation', { name: 'Simulated cmux workspaces' })
    expect(within(sidebar).getByText('Child: Task A')).toBeInTheDocument()
    expect(within(sidebar).getByText('Child: Task B')).toBeInTheDocument()
    expect(within(sidebar).getByText('Child: Task C')).toBeInTheDocument()

    // Advance to the first toast frame.
    const toastIndex = TRIAL_FRAMES.findIndex((frame) => frame.toast)
    for (let step = 1; step < toastIndex; step += 1) {
      await user.click(screen.getByRole('button', { name: 'Next step' }))
    }
    expect(screen.getByText('cmux notify')).toBeInTheDocument()
    expect(screen.getByText(/Child: Task B — Draft PR #101 open/)).toBeInTheDocument()
  })

  it('supports arrow keys on the focused walkthrough without free text input', async () => {
    const user = userEvent.setup()
    render(<CmuxTrialWalkthrough />)

    const next = screen.getByRole('button', { name: 'Next step' })
    next.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText(`3 / ${TRIAL_FRAMES.length}`)).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText(`2 / ${TRIAL_FRAMES.length}`)).toBeInTheDocument()

    // The walkthrough is purely stepped: no textboxes anywhere.
    const section = screen.getByRole('region', { name: 'Guided cmux trial walkthrough' })
    expect(within(section).queryByRole('textbox')).not.toBeInTheDocument()
    expect(within(section).queryByRole('spinbutton')).not.toBeInTheDocument()
  })
})
