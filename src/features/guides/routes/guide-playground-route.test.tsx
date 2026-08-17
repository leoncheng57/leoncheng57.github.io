import { render, screen } from '@testing-library/react'
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

describe('guide playground route', () => {
  it('renders the experimental simulator playground', () => {
    renderAt(PLAYGROUND_PATH)

    expect(
      screen.getByRole('heading', { level: 1, name: /Manager\/worker run simulator/ })
    ).toBeInTheDocument()
    expect(screen.getByText('Experimental')).toBeInTheDocument()

    // The simulator region with its labelled controls and transport.
    const simulator = screen.getByRole('region', { name: 'Manager and worker run simulator' })
    expect(simulator).toBeInTheDocument()
    expect(screen.getByLabelText(/Workers/)).toBeInTheDocument()
    expect(screen.getByLabelText('Autonomy level')).toBeInTheDocument()
    expect(screen.getByLabelText('Task size variance')).toBeInTheDocument()
    expect(screen.getByLabelText(/Human review latency/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    expect(screen.getByLabelText('Scrub')).toBeInTheDocument()

    // Swimlanes for the manager and the default worker count.
    expect(screen.getByText('Manager')).toBeInTheDocument()
    expect(screen.getByText('Worker 1')).toBeInTheDocument()

    // Legend explains the human/AI/waiting encoding.
    expect(screen.getByRole('list', { name: 'Timeline color legend' })).toBeInTheDocument()

    // aria-live summary announces the current state.
    expect(screen.getByText(/Minute 0 of \d+\. Manager:/)).toBeInTheDocument()
  })

  it('steps the clock forward deterministically', async () => {
    const user = userEvent.setup()
    renderAt(PLAYGROUND_PATH)

    expect(screen.getByRole('timer', { name: 'Simulated clock' })).toHaveTextContent(/^t = 0 \//)
    await user.click(screen.getByRole('button', { name: '+1 min' }))
    expect(screen.getByRole('timer', { name: 'Simulated clock' })).toHaveTextContent(/^t = 1 \//)
  })

  it('shows GuideNotFound for a playground on other slugs', () => {
    renderAt('/guides/some-other-guide/playground')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Playground not found' })
    ).toBeInTheDocument()
  })

  it('links to the playground from the guide overview CTA row', () => {
    renderAt(GUIDE_PATH)

    expect(
      screen.getByRole('link', { name: /Open the simulator/ })
    ).toHaveAttribute('href', PLAYGROUND_PATH)
  })
})
