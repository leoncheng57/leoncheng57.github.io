import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

const GUIDE_PATH = '/guides/manager-worker-parallel-agents'
const PLAYGROUND_PATH = `${GUIDE_PATH}/playground`

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('guide simulator chapter', () => {
  it('renders the simulator inline as a beta chapter of the one-pager', () => {
    renderAt(GUIDE_PATH)

    const heading = screen.getByRole('heading', { level: 2, name: /Run simulator/ })
    expect(heading).toBeInTheDocument()
    expect(document.getElementById('simulator')).toBeInTheDocument()

    // The simulator region with its labelled controls and transport.
    const simulator = screen.getByRole('region', { name: 'Manager and worker run simulator' })
    expect(simulator).toBeInTheDocument()
    expect(within(simulator).getByLabelText(/Workers/)).toBeInTheDocument()
    expect(within(simulator).getByLabelText('Autonomy level')).toBeInTheDocument()
    expect(within(simulator).getByLabelText('Task size variance')).toBeInTheDocument()
    expect(within(simulator).getByLabelText(/Human review latency/)).toBeInTheDocument()
    expect(within(simulator).getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(within(simulator).getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    expect(within(simulator).getByLabelText('Scrub')).toBeInTheDocument()

    // Swimlanes for the manager and the default worker count.
    expect(within(simulator).getAllByText('Manager').length).toBeGreaterThan(0)
    expect(within(simulator).getByText('Worker 1')).toBeInTheDocument()

    // Legend explains the human/AI/waiting encoding.
    expect(
      within(simulator).getByRole('list', { name: 'Timeline color legend' })
    ).toBeInTheDocument()

    // aria-live summary announces the current state.
    expect(within(simulator).getByText(/Minute 0 of \d+\. Manager:/)).toBeInTheDocument()
  })

  it('steps the clock forward deterministically', async () => {
    const user = userEvent.setup()
    renderAt(GUIDE_PATH)

    const simulator = screen.getByRole('region', { name: 'Manager and worker run simulator' })
    expect(
      within(simulator).getByRole('timer', { name: 'Simulated clock' })
    ).toHaveTextContent(/^t = 0 \//)
    await user.click(within(simulator).getByRole('button', { name: '+1 min' }))
    expect(
      within(simulator).getByRole('timer', { name: 'Simulated clock' })
    ).toHaveTextContent(/^t = 1 \//)
  })

  it('redirects the legacy playground url to the simulator anchor', () => {
    renderAt(PLAYGROUND_PATH)

    // Lands on the one-pager with the simulator chapter present.
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Running Parallel Coding Agents/,
      })
    ).toBeInTheDocument()
    expect(document.getElementById('simulator')).toBeInTheDocument()
  })

  it('shows GuideNotFound for a playground on other slugs', () => {
    renderAt('/guides/some-other-guide/playground')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Playground not found' })
    ).toBeInTheDocument()
  })

  it('links to the simulator anchor from the guide CTA row', () => {
    renderAt(GUIDE_PATH)

    expect(screen.getByRole('link', { name: /Open the simulator/ })).toHaveAttribute(
      'href',
      '#simulator'
    )
  })
})
