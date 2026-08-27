import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HedwigToolsSimulation from './HedwigToolsSimulation'

describe('HedwigToolsSimulation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders a static catalog with arrows that step the visible tool', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)
    expect(screen.getByRole('region', { name: 'Hedwig tools simulation' })).toBeInTheDocument()
    const selector = screen.getByRole('navigation', { name: 'Hedwig tool selector' })
    expect(selector.querySelectorAll('button')).toHaveLength(0)
    expect(selector.querySelectorAll('li')).toHaveLength(8)
    expect(selector).toHaveTextContent('Playgrounds')
    expect(selector).toHaveTextContent('Cmd+K')
    expect(screen.getByText('Tool 01 / 08')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next frame in control-panel tour' }))
    expect(screen.getByText('Step 2 of 7')).toBeInTheDocument()
    expect(screen.getByText('On-call investigations')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('moves the aggregate tour from one tool final frame to the next tool first frame', async () => {
    const user = userEvent.setup()
    render(<HedwigToolsSimulation />)
    const next = screen.getByRole('button', { name: 'Next frame in control-panel tour' })
    for (let frame = 0; frame < 7; frame += 1) await user.click(next)
    expect(screen.getByText('Tool 02 / 08')).toBeInTheDocument()
    expect(screen.getByText('Remote code runners')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Previous frame in control-panel tour' }))
    expect(screen.getByText('Tool 01 / 08')).toBeInTheDocument()
    expect(screen.getByText('Step 7 of 7')).toBeInTheDocument()
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

  it('shows the generated weekly operations review at the end of the on-call flow', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<HedwigToolsSimulation mode="compact" toolId="on-call" />)
    expect(screen.getByText('Weekly operations review')).toBeInTheDocument()
    expect(screen.getByText('Action-item completion')).toBeInTheDocument()
    expect(screen.getByText('42% → 81%')).toBeInTheDocument()
  })

  it('keeps the arrow-only toolbar at the top of the simulation frame', () => {
    const { container } = render(<HedwigToolsSimulation />)
    const frame = container.querySelector('[class*="simulationFrame"]')
    const controls = container.querySelector('[class*="controls"]')
    const playbackBar = container.querySelector('[class*="playbackBar"]')
    const selector = screen.getByRole('navigation', { name: 'Hedwig tool selector' })
    expect(frame).toBeTruthy()
    expect(controls).toBeTruthy()
    expect(playbackBar).toBeTruthy()
    expect(frame?.contains(controls)).toBe(true)
    expect(playbackBar?.contains(controls)).toBe(true)
    expect(playbackBar).toHaveTextContent('Step 1 of 7')
    expect(playbackBar).toHaveTextContent('Alert received')
    expect(frame?.contains(selector)).toBe(true)
    expect(selector.querySelector('ol')?.children).toHaveLength(8)
    expect(controls?.querySelectorAll('button')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Previous frame in control-panel tour' })).toHaveAttribute('data-tooltip', 'Previous frame in control-panel tour')
    expect(screen.getByRole('button', { name: 'Next frame in control-panel tour' })).toBeInTheDocument()
  })

  it.each([
    ['on-call', 'Teams to contact'],
    ['remote-code', 'Delegated jobs'],
    ['customer-api', 'Weekly SLO attainment'],
    ['databricks-mcp', 'Simulated MCP trace'],
    ['mcp-library', 'Selected tool policy'],
    ['slack-builder', 'Public channel membership'],
    ['playgrounds-skills', 'Marketplace browse'],
    ['cmd-k-discovery', 'no input or network request'],
  ] as const)('renders the detailed %s compact view', (toolId, expected) => {
    render(<HedwigToolsSimulation mode="compact" toolId={toolId} />)
    expect(screen.getByText(new RegExp(expected, 'i'))).toBeInTheDocument()
  })

  it('shows recognizable governed integrations in the MCP library', () => {
    render(<HedwigToolsSimulation mode="compact" toolId="mcp-library" />)
    expect(screen.getByText(/Slack · search threads/i)).toBeInTheDocument()
    expect(screen.getByText(/Backstage · service catalog/i)).toBeInTheDocument()
    expect(screen.getByText(/Confluence · search pages/i)).toBeInTheDocument()
    expect(screen.getByText(/Grafana · query dashboards/i)).toBeInTheDocument()
    expect(screen.getByText(/GitLab · draft MR comment/i)).toBeInTheDocument()
  })

  it('renders compact control labels as static content while arrows remain external', () => {
    render(<HedwigToolsSimulation mode="compact" toolId="slack-builder" />)
    expect(screen.getAllByText('Channels')).not.toHaveLength(0)
    expect(screen.getByText('Threads')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous stage of Slackbot operations' })).toBeInTheDocument()
  })
})
