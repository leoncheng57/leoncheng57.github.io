import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackButton from './FeedbackButton'
import { buildFeedbackUrl } from './feedbackConfig'

vi.mock('./feedbackConfig', () => ({
  buildFeedbackUrl: vi.fn(),
}))

const mockedBuildFeedbackUrl = vi.mocked(buildFeedbackUrl)

beforeEach(() => {
  mockedBuildFeedbackUrl.mockReturnValue(
    'https://docs.google.com/forms/d/e/example/viewform?usp=pp_url&entry.123=%2Fblog'
  )
  window.history.replaceState({}, '', '/blog')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('FeedbackButton', () => {
  it('renders an aria-labelled button and opens the feedback dialog', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    const trigger = screen.getByRole('button', { name: 'Send feedback' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      /Found a bug or have an idea?/
    )
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('button', { name: 'Close feedback' })
    ).toHaveFocus()
  })

  it('links to a form prefilled with the current page path', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole('button', { name: 'Send feedback' }))

    expect(mockedBuildFeedbackUrl).toHaveBeenCalledWith('/blog')
    expect(screen.getByRole('link', { name: 'Open feedback form' })).toHaveAttribute(
      'href',
      expect.stringContaining('entry.123=%2Fblog')
    )
  })

  it('does not render in production when the form is unconfigured', () => {
    vi.stubEnv('PROD', true)
    mockedBuildFeedbackUrl.mockReturnValue(null)

    render(<FeedbackButton />)

    expect(
      screen.queryByRole('button', { name: 'Send feedback' })
    ).not.toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)
    const trigger = screen.getByRole('button', { name: 'Send feedback' })

    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole('button', { name: 'Send feedback' }))
    fireEvent.mouseDown(screen.getByTestId('feedback-backdrop'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
