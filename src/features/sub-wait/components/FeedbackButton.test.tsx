import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackButton from './FeedbackButton'
import {
  buildEmbeddedFeedbackUrl,
  buildFeedbackUrl,
} from './feedbackConfig'

vi.mock('./feedbackConfig', () => ({
  buildFeedbackUrl: vi.fn(),
  buildEmbeddedFeedbackUrl: vi.fn(),
}))

const mockedBuildFeedbackUrl = vi.mocked(buildFeedbackUrl)
const mockedBuildEmbeddedFeedbackUrl = vi.mocked(buildEmbeddedFeedbackUrl)

beforeEach(() => {
  mockedBuildFeedbackUrl.mockReturnValue(
    'https://docs.google.com/forms/d/e/example/viewform?usp=pp_url&entry.123=%2Fsub-wait%2Fmap'
  )
  mockedBuildEmbeddedFeedbackUrl.mockReturnValue(
    'https://docs.google.com/forms/d/e/example/viewform?usp=pp_url&entry.123=%2Fsub-wait%2Fmap&embedded=true'
  )
  window.history.replaceState({}, '', '/sub-wait/map')
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

  it('embeds the form prefilled with the current page path', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole('button', { name: 'Send feedback' }))

    expect(mockedBuildEmbeddedFeedbackUrl).toHaveBeenCalledWith('/sub-wait/map')
    const frame = screen.getByTitle('Feedback form')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute(
      'src',
      expect.stringContaining('embedded=true')
    )
    expect(frame).toHaveAttribute(
      'src',
      expect.stringContaining('entry.123=%2Fsub-wait%2Fmap')
    )
  })

  it('offers a new-tab fallback link to the non-embedded form', async () => {
    const user = userEvent.setup()
    render(<FeedbackButton />)

    await user.click(screen.getByRole('button', { name: 'Send feedback' }))

    const link = screen.getByRole('link', {
      name: /Open feedback form in a new tab/,
    })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute(
      'href',
      expect.not.stringContaining('embedded=true')
    )
  })

  it('does not render in production when the form is unconfigured', () => {
    vi.stubEnv('PROD', true)
    mockedBuildFeedbackUrl.mockReturnValue(null)
    mockedBuildEmbeddedFeedbackUrl.mockReturnValue(null)

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
