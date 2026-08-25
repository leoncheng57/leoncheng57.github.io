import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HedwigToolsSimulation from './HedwigToolsSimulation'

describe('HedwigToolsSimulation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the full keyboard-accessible catalog and disclosure', () => {
    render(<HedwigToolsSimulation />)
    expect(screen.getByRole('region', { name: 'Hedwig tools simulation' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /On-call|Remote code|API graphs|Data helper|Databricks MCP|Slack builder/ })).toHaveLength(6)
    expect(screen.getByText(/fictional and sanitized/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Remote code/ }))
    expect(screen.getByText('Mode A · async delegation')).toBeInTheDocument()
    expect(screen.getByText('Mode B · interactive workspace')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders only the selected tool in compact mode', () => {
    render(<HedwigToolsSimulation mode="compact" toolId="slack-builder" ariaLabel="Slack builder demo" />)
    expect(screen.queryByRole('navigation', { name: 'Hedwig tool selector' })).not.toBeInTheDocument()
    expect(screen.getByText('Slack bot builder')).toBeInTheDocument()
    expect(screen.getByText(/no bot provisioned/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Previous tool' })).not.toBeInTheDocument()
  })

  it('preserves an explicit pause across selector and adjacent-tool selections', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)

    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await user.click(screen.getByRole('button', { name: /Remote code/ }))
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next tool' }))
    expect(screen.getByText('Customer API usage graphs')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Previous tool' }))
    expect(screen.getByText('Remote code runners')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
  })

  it('moves focus and selection with selector keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)
    const onCall = screen.getByRole('button', { name: /On-call/ })

    onCall.focus()
    await user.keyboard('{ArrowRight}')
    const remoteCode = screen.getByRole('button', { name: /Remote code/ })
    expect(remoteCode).toHaveFocus()
    expect(remoteCode).toHaveAttribute('aria-current', 'step')

    await user.keyboard('{End}')
    const slackBuilder = screen.getByRole('button', { name: /Slack builder/ })
    expect(slackBuilder).toHaveFocus()
    expect(slackBuilder).toHaveAttribute('aria-current', 'step')

    await user.keyboard('{Home}')
    expect(onCall).toHaveFocus()
    expect(onCall).toHaveAttribute('aria-current', 'step')

    await user.keyboard('{ArrowLeft}')
    expect(slackBuilder).toHaveFocus()
    expect(slackBuilder).toHaveAttribute('aria-current', 'step')
  })

  it('restarts the catalog from the first tool and resumes playback intent', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)

    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await user.click(screen.getByRole('button', { name: /API graphs/ }))
    await user.click(screen.getByRole('button', { name: 'Restart' }))

    expect(screen.getByText('On-call investigations')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Simulation progress' })).toHaveAttribute(
      'aria-valuenow',
      '1'
    )
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('does not autoplay and starts complete when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<HedwigToolsSimulation mode="compact" toolId="customer-api" />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeDisabled()
    expect(screen.getByText(/does not autoplay/i)).toBeInTheDocument()
  })
})
