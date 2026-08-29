import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import WaitingModesSimulator from './WaitingModesSimulator'

describe('WaitingModesSimulator', () => {
  it('defaults to the interleaved scenario', () => {
    render(<WaitingModesSimulator />)

    expect(
      screen.getByRole('region', { name: 'Interleaved vs. delegated waiting modes' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Interleaved' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Delegated' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByText('Context switches required:')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText(/two threads share one session/i)).toBeInTheDocument()
    expect(screen.getByText('Question A')).toBeInTheDocument()
    expect(screen.getByText('Question B')).toBeInTheDocument()
  })

  it('switches to the delegated scenario on click, with zero context switches', async () => {
    const user = userEvent.setup()
    render(<WaitingModesSimulator />)

    await user.click(screen.getByRole('button', { name: 'Delegated' }))

    expect(screen.getByRole('button', { name: 'Delegated' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Interleaved' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/runs in a background child agent the whole time/i)).toBeInTheDocument()
    expect(screen.getByText('Parent session')).toBeInTheDocument()
    expect(screen.getByText('Background child agent')).toBeInTheDocument()
    expect(screen.queryByText('Question A')).not.toBeInTheDocument()
  })

  it('accepts a custom accessible label', () => {
    render(<WaitingModesSimulator ariaLabel="Custom label" />)
    expect(screen.getByRole('region', { name: 'Custom label' })).toBeInTheDocument()
  })

  it('lists the timeline legend', () => {
    render(<WaitingModesSimulator />)
    const legend = screen.getByRole('list', { name: 'Timeline color legend' })
    expect(legend).toHaveTextContent('Asking a question')
    expect(legend).toHaveTextContent('Waiting, blocked')
    expect(legend).toHaveTextContent('Answer arrives, follow-up asked')
    expect(legend).toHaveTextContent('Quick question, parent stays free')
    expect(legend).toHaveTextContent('Background work, uninterrupted')
  })
})
