import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderPage(): void {
  render(
    <MemoryRouter initialEntries={['/guides/opencode-personal-config']}>
      <App />
    </MemoryRouter>
  )
}

describe('opencode personal config route', () => {
  it('documents the repo layout, MCP servers, and skills', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'opencode personal config' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Repo layout' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'MCP servers' })).toBeInTheDocument()
    expect(screen.getByText('code-flowchart')).toBeInTheDocument()
    expect(screen.getByText('repo-learning-guide')).toBeInTheDocument()
  })

  it('shows the model usage snapshot with message and token shares', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Model usage' })).toBeInTheDocument()
    expect(screen.getByText('claude-opus-4-6')).toBeInTheDocument()
    expect(screen.getByText('claude-fable-5')).toBeInTheDocument()
    expect(screen.getByText('36 others')).toBeInTheDocument()
    expect(screen.getByText('33.8%')).toBeInTheDocument()
    expect(screen.getByText('28.6%')).toBeInTheDocument()
    expect(screen.getByText(/110,622\s*messages logged locally/i)).toBeInTheDocument()
  })

  it('documents the runtime version and notification plugins', () => {
    renderPage()

    expect(screen.getByText('opencode 1.18.18')).toBeInTheDocument()
    expect(
      screen.getByText(/plugins: ntfy-notify · cmux-question-notify · cmux-session/)
    ).toBeInTheDocument()
  })

  it('documents installation and secret handling', () => {
    renderPage()

    expect(screen.getAllByText('./install.sh').length).toBeGreaterThan(0)
    expect(screen.getByText(/Secrets never enter the repo/i)).toBeInTheDocument()
    expect(
      screen.getByText(/no credentials or private hostnames are committed/i)
    ).toBeInTheDocument()
  })
})
