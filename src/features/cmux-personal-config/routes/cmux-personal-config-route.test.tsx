import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderPage(): void {
  render(
    <MemoryRouter initialEntries={['/guides/cmux-personal-config']}>
      <App />
    </MemoryRouter>
  )
}

describe('cmux personal config route', () => {
  it('documents the window layout and notification routing', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'cmux personal config' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Window layout' })).toBeInTheDocument()
    expect(screen.getByText('Agent terminal')).toBeInTheDocument()
    expect(screen.getByText('Turn complete')).toBeInTheDocument()
    expect(screen.getByText('OFF')).toBeInTheDocument()
    expect(screen.getAllByText(/Input for agent needed/i).length).toBeGreaterThan(0)
  })

  it('documents the ntfy phone-push fan-out and runtime versions', () => {
    renderPage()

    expect(screen.getByText('ntfy-notify plugin')).toBeInTheDocument()
    expect(screen.getByText('phone push')).toBeInTheDocument()
    expect(screen.getByText('Push')).toBeInTheDocument()
    expect(screen.getByText('cmux 0.64.22 (102) · stock build')).toBeInTheDocument()
    expect(screen.getByText('opencode 1.18.18')).toBeInTheDocument()
  })

  it('documents installation and privacy boundaries', () => {
    renderPage()

    expect(screen.getByText('./install.sh')).toBeInTheDocument()
    expect(screen.getByText(/excludes credentials, private service URLs/i)).toBeInTheDocument()
    expect(screen.getByText(/never reads prompt contents aloud/i)).toBeInTheDocument()
  })
})
