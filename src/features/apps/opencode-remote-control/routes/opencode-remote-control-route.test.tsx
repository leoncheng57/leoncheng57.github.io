import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../../../App'

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

describe('OpenCode remote control app', () => {
  beforeEach(() => {
    stubLocalStorage()
    window.localStorage.clear()
  })

  it('renders the setup builder at its app route', () => {
    render(
      <MemoryRouter initialEntries={['/opencode-remote-control']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'OpenCode, from anywhere.' })
    ).toBeInTheDocument()
    expect(screen.getByText('TAILNET ONLY')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Two private loops. One local agent.' })
    ).toBeInTheDocument()
    expect(screen.getByText('CONTROL PLANE')).toBeInTheDocument()
    expect(screen.getByText('NOTIFICATION PLANE')).toBeInTheDocument()
    expect(screen.getByText('oc-remote topic --qr')).toBeInTheDocument()
  })

  it('updates generated commands and saves non-secret settings', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/opencode-remote-control']}>
        <App />
      </MemoryRouter>
    )

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
