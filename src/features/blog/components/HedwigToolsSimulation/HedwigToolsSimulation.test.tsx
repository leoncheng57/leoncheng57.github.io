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
    expect(screen.getByRole('navigation', { name: 'Hedwig tool selector' }).querySelectorAll('button')).toHaveLength(7)
    expect(screen.getByRole('button', { name: /Playgrounds/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cmd\+K/ })).toBeInTheDocument()
    expect(screen.getByText('Tool 01 / 07')).toBeInTheDocument()
    expect(screen.getByText(/fictional and sanitized/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^02Remote code$/ }))
    expect(screen.getByText('Mode A · interactive workspace')).toBeInTheDocument()
    expect(screen.getByText('Mode B · delegated jobs')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders only the selected tool in compact mode', () => {
    render(<HedwigToolsSimulation mode="compact" toolId="slack-builder" ariaLabel="Slack builder demo" />)
    expect(screen.queryByRole('navigation', { name: 'Hedwig tool selector' })).not.toBeInTheDocument()
    expect(screen.getByText('Slack bot builder')).toBeInTheDocument()
    expect(screen.getByText(/stop before anything can be provisioned/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Previous tool:/ })).not.toBeInTheDocument()
  })

  it('preserves an explicit pause across selector and adjacent-tool selections', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)

    await user.click(screen.getByRole('button', { name: 'Pause simulation' }))
    await user.click(screen.getByRole('button', { name: /^02Remote code$/ }))
    expect(screen.getByRole('button', { name: 'Play simulation' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next tool: Customer API usage graphs' }))
    expect(screen.getByText('Customer API usage graphs')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play simulation' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Previous tool: Remote code runners' }))
    expect(screen.getByText('Remote code runners')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play simulation' })).toBeInTheDocument()
  })

  it('moves focus and selection with selector keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)
    const onCall = screen.getByRole('button', { name: /^01On-call$/ })

    onCall.focus()
    await user.keyboard('{ArrowRight}')
    const remoteCode = screen.getByRole('button', { name: /^02Remote code$/ })
    expect(remoteCode).toHaveFocus()
    expect(remoteCode).toHaveAttribute('aria-current', 'step')

    await user.keyboard('{End}')
    const cmdK = screen.getByRole('button', { name: /^07Cmd\+K$/ })
    expect(cmdK).toHaveFocus()
    expect(cmdK).toHaveAttribute('aria-current', 'step')

    await user.keyboard('{Home}')
    expect(onCall).toHaveFocus()
    expect(onCall).toHaveAttribute('aria-current', 'step')

    await user.keyboard('{ArrowLeft}')
    expect(cmdK).toHaveFocus()
    expect(cmdK).toHaveAttribute('aria-current', 'step')
  })

  it('renders accessible review and lifecycle-labeled discovery output without inputs', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)

    await user.click(screen.getByRole('button', { name: /^06Playgrounds$/ }))
    expect(screen.getByLabelText('Playground and marketplace review flow')).toBeInTheDocument()
    expect(screen.getByText(/never automatically published/i)).toHaveAttribute('role', 'status')

    await user.click(screen.getByRole('button', { name: /^07Cmd\+K$/ }))
    expect(screen.getByLabelText('Scripted discovery results')).toBeInTheDocument()
    expect(screen.getByLabelText(/Lifecycle-labeled results/).children).toHaveLength(4)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('restarts the catalog from the first tool and resumes playback intent', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)

    await user.click(screen.getByRole('button', { name: 'Pause simulation' }))
    await user.click(screen.getByRole('button', { name: /API graphs/ }))
    await user.click(screen.getByRole('button', { name: 'Restart simulation' }))

    expect(screen.getByText('On-call investigations')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Simulation progress' })).toHaveAttribute(
      'aria-valuenow',
      '1'
    )
    expect(screen.getByRole('button', { name: 'Pause simulation' })).toBeInTheDocument()
  })

  it('does not autoplay and starts complete when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<HedwigToolsSimulation mode="compact" toolId="customer-api" />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play simulation' })).toBeDisabled()
    expect(screen.getByText(/does not autoplay/i)).toBeInTheDocument()
  })

  it('keeps the icon toolbar outside the simulation frame with accessible tooltips', () => {
    const { container } = render(<HedwigToolsSimulation />)
    const frame = container.querySelector('[class*="simulationFrame"]')
    const controls = container.querySelector('[class*="controls"]')
    const selector = screen.getByRole('navigation', { name: 'Hedwig tool selector' })
    expect(frame).toBeTruthy()
    expect(controls).toBeTruthy()
    expect(frame?.contains(controls)).toBe(false)
    expect(frame?.contains(selector)).toBe(true)
    expect(selector.querySelector('ol')?.children).toHaveLength(7)
    expect(screen.getByRole('button', { name: 'Previous tool: On-call investigations' })).toHaveAttribute('data-tooltip', 'Previous tool: On-call investigations')
    expect(screen.getByRole('button', { name: 'Pause simulation' }).querySelector('svg')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Restart simulation' })).toHaveAttribute('data-tooltip', 'Restart simulation')
    expect(screen.getByRole('button', { name: 'Next tool: Remote code runners' })).toBeInTheDocument()
  })

  it.each([
    ['on-call', 'Teams to contact'],
    ['remote-code', 'Delegated jobs'],
    ['customer-api', 'Weekly SLO attainment'],
    ['databricks-mcp', 'Simulated MCP trace'],
    ['slack-builder', 'Live preview'],
    ['playgrounds-skills', 'Marketplace browse'],
    ['cmd-k-discovery', 'no input or network request'],
  ] as const)('renders the detailed %s compact view', (toolId, expected) => {
    render(<HedwigToolsSimulation mode="compact" toolId={toolId} />)
    expect(screen.getByText(new RegExp(expected, 'i'))).toBeInTheDocument()
  })

  it('supports scripted compact tabs and steps without network input', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<HedwigToolsSimulation mode="compact" toolId="remote-code" />)
    await user.click(screen.getByRole('tab', { name: 'Interactive workspace' }))
    expect(screen.getByRole('tab', { name: 'Files' })).toBeInTheDocument()

    rerender(<HedwigToolsSimulation mode="compact" toolId="slack-builder" />)
    await user.click(screen.getByRole('button', { name: /6Review/ }))
    expect(screen.getByText(/no reviewer, manifest, or bot/i)).toBeInTheDocument()
  })
})
