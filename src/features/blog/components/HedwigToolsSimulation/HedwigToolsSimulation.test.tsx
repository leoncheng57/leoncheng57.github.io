import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HedwigToolsSimulation from './HedwigToolsSimulation'

describe('HedwigToolsSimulation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders a static catalog with arrow-only tool navigation', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)
    expect(screen.getByRole('region', { name: 'Hedwig tools simulation' })).toBeInTheDocument()
    const selector = screen.getByRole('navigation', { name: 'Hedwig tool selector' })
    expect(selector.querySelectorAll('button')).toHaveLength(0)
    expect(selector.querySelectorAll('li')).toHaveLength(7)
    expect(selector).toHaveTextContent('Playgrounds')
    expect(selector).toHaveTextContent('Cmd+K')
    expect(screen.getByText('Tool 01 / 07')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next tool: Remote code runners' }))
    expect(screen.getByText('Mode A · interactive workspace')).toBeInTheDocument()
    expect(screen.getByText('Mode B · delegated jobs')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders only the selected tool in compact mode', () => {
    render(<HedwigToolsSimulation mode="compact" toolId="slack-builder" ariaLabel="Slack builder demo" />)
    expect(screen.queryByRole('navigation', { name: 'Hedwig tool selector' })).not.toBeInTheDocument()
    expect(screen.getByText('Slackbot operations')).toBeInTheDocument()
    expect(screen.getByText(/channels, simulation, memory, logs, ratings, and threads/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous stage of Slackbot operations' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next stage of Slackbot operations' })).toBeInTheDocument()
  })

  it('steps within the embedded tool instead of switching tools', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation mode="compact" toolId="slack-builder" />)
    const next = screen.getByRole('button', { name: 'Next stage of Slackbot operations' })
    const previous = screen.getByRole('button', { name: 'Previous stage of Slackbot operations' })
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument()
    expect(previous).toBeDisabled()

    await user.click(next)
    expect(screen.getByText('Step 2 of 7')).toBeInTheDocument()
    expect(screen.getByText('Slackbot operations')).toBeInTheDocument()
    expect(previous).toBeEnabled()

    await user.click(previous)
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument()
    expect(screen.getByText('Slackbot operations')).toBeInTheDocument()
  })

  it('disables the next arrow on the final stage of an embedded tool', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation mode="compact" toolId="slack-builder" />)
    const next = screen.getByRole('button', { name: 'Next stage of Slackbot operations' })
    for (let step = 0; step < 6; step += 1) await user.click(next)
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(next).toBeDisabled()
    expect(screen.getByText('Slackbot operations')).toBeInTheDocument()
  })

  it('does not autoplay and starts complete when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<HedwigToolsSimulation mode="compact" toolId="customer-api" />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next stage of Customer API usage graphs' })).toBeDisabled()
    expect(screen.getByText(/does not autoplay/i)).toBeInTheDocument()
  })

  it('keeps the arrow-only toolbar outside the simulation frame', () => {
    const { container } = render(<HedwigToolsSimulation />)
    const frame = container.querySelector('[class*="simulationFrame"]')
    const controls = container.querySelector('[class*="controls"]')
    const selector = screen.getByRole('navigation', { name: 'Hedwig tool selector' })
    expect(frame).toBeTruthy()
    expect(controls).toBeTruthy()
    expect(frame?.contains(controls)).toBe(false)
    expect(frame?.contains(selector)).toBe(true)
    expect(selector.querySelector('ol')?.children).toHaveLength(7)
    expect(controls?.querySelectorAll('button')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Previous tool: On-call investigations' })).toHaveAttribute('data-tooltip', 'Previous tool: On-call investigations')
    expect(screen.getByRole('button', { name: 'Next tool: Remote code runners' })).toBeInTheDocument()
  })

  it.each([
    ['on-call', 'Teams to contact'],
    ['remote-code', 'Delegated jobs'],
    ['customer-api', 'Weekly SLO attainment'],
    ['databricks-mcp', 'Simulated MCP trace'],
    ['slack-builder', 'Public channel membership'],
    ['playgrounds-skills', 'Marketplace browse'],
    ['cmd-k-discovery', 'no input or network request'],
  ] as const)('renders the detailed %s compact view', (toolId, expected) => {
    render(<HedwigToolsSimulation mode="compact" toolId={toolId} />)
    expect(screen.getByText(new RegExp(expected, 'i'))).toBeInTheDocument()
  })

  it('renders compact control labels as static content while arrows remain external', () => {
    render(<HedwigToolsSimulation mode="compact" toolId="slack-builder" />)
    expect(screen.getAllByText('Channels')).not.toHaveLength(0)
    expect(screen.getByText('Threads')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous stage of Slackbot operations' })).toBeInTheDocument()
  })
})
