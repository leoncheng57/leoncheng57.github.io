import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../../App'

function stubLocalStorage(): void {
  const values = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })
}

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('OpenCode remote control guide', () => {
  beforeEach(() => {
    stubLocalStorage()
    window.localStorage.clear()
  })

  it('renders the one-page guide under /guides', () => {
    renderAt('/guides/opencode-remote-control')

    expect(
      screen.getByRole('heading', {
        name: 'OpenCode, from anywhere and anytime.',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Two private loops. One local agent.' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'How to Setup' })
    ).toBeInTheDocument()
    expect(screen.getByText('CONTROL PLANE')).toBeInTheDocument()
    expect(screen.getByText('NOTIFICATION PLANE')).toBeInTheDocument()
    expect(screen.getByText('03 / DAILY COMMANDS')).toBeInTheDocument()
    expect(screen.getByText('06 / A DAY IN THE LIFE')).toBeInTheDocument()
    expect(screen.getByText('08 / TROUBLESHOOTING')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /leoncheng\.dev/ })
    ).toBeInTheDocument()
    expect(screen.getAllByText('BETA').length).toBeGreaterThan(0)
  })

  it('redirects the old app path to the guide', () => {
    renderAt('/opencode-remote-control')

    expect(
      screen.getByRole('heading', {
        name: 'OpenCode, from anywhere and anytime.',
      })
    ).toBeInTheDocument()
  })

  it('documents how to customize ntfy notifications', () => {
    renderAt('/guides/opencode-remote-control')

    expect(screen.getByText('05 / CUSTOMIZE NOTIFICATIONS')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Runtime knobs' })
    ).toBeInTheDocument()
    expect(screen.getByText('OPENCODE_NTFY_TOPIC')).toBeInTheDocument()
    expect(screen.getByText('OPENCODE_NTFY_SERVER')).toBeInTheDocument()
    expect(screen.getByText('OPENCODE_NTFY_DISABLED=1')).toBeInTheDocument()
    expect(
      screen.getByText(/silently disables notifications for every project/)
    ).toBeInTheDocument()
  })

  it('links to the GitHub repository from the nav and the hero note', () => {
    renderAt('/guides/opencode-remote-control')

    const repoUrl =
      'https://github.com/leoncheng57/opencode-remote-control-and-notifications'
    expect(screen.getByRole('link', { name: 'GitHub ↗' })).toHaveAttribute(
      'href',
      repoUrl
    )
    expect(
      screen.getByRole('link', {
        name: 'opencode-remote-control-and-notifications ↗',
      })
    ).toHaveAttribute('href', repoUrl)
    expect(
      screen.getByText(/a simple public repo I created/)
    ).toBeInTheDocument()
  })

  it('updates generated commands and saves non-secret settings', async () => {
    const user = userEvent.setup()
    renderAt('/guides/opencode-remote-control')

    const root = screen.getByLabelText('Project root')
    await user.clear(root)
    await user.type(root, '/Users/leon/code')
    const port = screen.getByLabelText('Web port')
    await user.clear(port)
    await user.type(port, '9000')

    expect(screen.getByText("oc-remote web '/Users/leon/code'")).toBeInTheDocument()
    expect(screen.getByText(/PORT=9000/)).toBeInTheDocument()
    expect(
      window.localStorage.getItem('opencode-remote-control-settings-v1')
    ).toContain('/Users/leon/code')
  })
})
