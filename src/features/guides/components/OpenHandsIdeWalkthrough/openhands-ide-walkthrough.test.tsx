import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import OpenHandsIdeWalkthrough from './OpenHandsIdeWalkthrough'
import { IDE_FRAMES } from './frames'

describe('OpenHandsIdeWalkthrough', () => {
  it('starts on the project picker with Back disabled', () => {
    render(<OpenHandsIdeWalkthrough />)

    expect(screen.getByText(`1 / ${IDE_FRAMES.length}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
    expect(screen.getByText('What should the agent do?')).toBeInTheDocument()
    expect(screen.getByText('Use a new git worktree for each session')).toBeInTheDocument()
  })

  it('reaches the plan-mode gate and shows Approve / Reject', async () => {
    const user = userEvent.setup()
    render(<OpenHandsIdeWalkthrough />)

    const gateIndex = IDE_FRAMES.findIndex((frame) => frame.confirmation)
    for (let step = 0; step < gateIndex; step += 1) {
      await user.click(screen.getByRole('button', { name: 'Next step' }))
    }

    expect(screen.getByText('waiting for confirmation')).toBeInTheDocument()
    expect(
      screen.getByText('The agent wants to perform a write action while in plan mode.')
    ).toBeInTheDocument()
    expect(screen.getByText('Approve')).toBeInTheDocument()
    expect(screen.getByText('Reject')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
  })

  it('steps through every frame, ending on the pull request with Next disabled', async () => {
    const user = userEvent.setup()
    render(<OpenHandsIdeWalkthrough />)

    for (let step = 1; step < IDE_FRAMES.length; step += 1) {
      await user.click(screen.getByRole('button', { name: 'Next step' }))
      expect(screen.getByText(`${step + 1} / ${IDE_FRAMES.length}`)).toBeInTheDocument()
    }

    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled()
    expect(screen.getByText('finished')).toBeInTheDocument()
    const panel = screen.getByRole('complementary', { name: 'Simulated merge requests panel' })
    expect(within(panel).getByText('pipeline: success')).toBeInTheDocument()
  })

  it('supports arrow keys and takes no free text input', async () => {
    const user = userEvent.setup()
    render(<OpenHandsIdeWalkthrough />)

    screen.getByRole('button', { name: 'Next step' }).focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText(`3 / ${IDE_FRAMES.length}`)).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText(`2 / ${IDE_FRAMES.length}`)).toBeInTheDocument()

    const section = screen.getByRole('region', {
      name: 'Guided walkthrough of the custom OpenHands IDE',
    })
    expect(within(section).queryByRole('textbox')).not.toBeInTheDocument()
    expect(within(section).queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('uses the caption as a live region so steps are announced', () => {
    render(<OpenHandsIdeWalkthrough />)

    const caption = screen.getByText(/^Step 1:/)
    expect(caption.closest('[aria-live="polite"]')).not.toBeNull()
  })

  it('accepts an accessible label from the markdown embed alt text', () => {
    render(<OpenHandsIdeWalkthrough ariaLabel="A guided walkthrough of the IDE" />)

    expect(screen.getByRole('region', { name: 'A guided walkthrough of the IDE' })).toBeInTheDocument()
  })
})
