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
    expect(screen.getByText(/fictional and sanitized/i)).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: 'Previous tool: Read-only Databricks MCP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next tool: Playgrounds & Skills Marketplace' })).toBeInTheDocument()
  })

  it('does not autoplay and starts complete when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<HedwigToolsSimulation mode="compact" toolId="customer-api" />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next tool: Read-only Databricks MCP' })).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: 'Previous tool: Read-only Databricks MCP' })).toBeInTheDocument()
  })
})
