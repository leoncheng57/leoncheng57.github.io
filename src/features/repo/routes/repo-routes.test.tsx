import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('repo navigation', () => {
  it('uses a non-navigating wrench button and lists the Repo pages', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'LC Logo' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Development' })
    ).not.toBeInTheDocument()
    const primaryNav = screen.getByRole('navigation', { name: 'Primary' })
    const repoButton = within(primaryNav).getByRole('button', {
      name: 'Repo pages',
    })
    expect(within(primaryNav).queryByRole('link', { name: 'Repo' })).not.toBeInTheDocument()

    const repoPages = within(primaryNav).getByLabelText('Repo page links')
    expect(within(repoPages).getByText('CI checks').closest('a')).toHaveAttribute(
      'href',
      '/repo/ci'
    )
    expect(
      within(repoPages).getByText('Production deploys').closest('a')
    ).toHaveAttribute('href', '/repo/production')
    expect(
      within(repoPages).getByText('Pull request previews').closest('a')
    ).toHaveAttribute('href', '/repo/previews')
    expect(
      within(repoPages).getByText('Project planning').closest('a')
    ).toHaveAttribute('href', '/repo/planning')
    expect(
      within(repoPages).getByText('Google Analytics').closest('a')
    ).toHaveAttribute('href', '/repo/google-analytics')
    expect(
      within(repoPages).getByText('Alpha Projs').closest('a')
    ).toHaveAttribute('href', '/repo/alpha-projs')

    fireEvent.click(repoButton)
    expect(screen.getByText("Hi, I'm Leon")).toBeInTheDocument()
  })

  it.each(['/repo', '/development'])('redirects the old %s hub URL home', (path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText("Hi, I'm Leon")).toBeInTheDocument()
  })
})

describe('repo subpages', () => {
  it('documents Google Analytics at /repo/google-analytics', () => {
    render(
      <MemoryRouter initialEntries={['/repo/google-analytics']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Google Analytics' })
    ).toBeInTheDocument()
    expect(screen.getByText('G-5MLNJQ7789')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open Google Analytics' })
    ).toHaveAttribute('href', 'https://analytics.google.com/analytics/web/')
    expect(
      screen.getByRole('link', { name: 'Back home' })
    ).toHaveAttribute('href', '/')
  })

  it('renders Alpha Projs at /repo/alpha-projs', () => {
    render(
      <MemoryRouter initialEntries={['/repo/alpha-projs']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Alpha Projs' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Still taking shape' })
    ).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back home' })
    ).toHaveAttribute('href', '/')
  })

  it('documents CI checks at /repo/ci', () => {
    render(
      <MemoryRouter initialEntries={['/repo/ci']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'CI checks' })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Continuous integration commands')
    ).toHaveTextContent('npm run test:run')
    expect(
      screen.getByRole('link', { name: 'Back home' })
    ).toHaveAttribute('href', '/')
  })

  it('documents production deploys at /repo/production', () => {
    render(
      <MemoryRouter initialEntries={['/repo/production']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Production deploys' })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Production deployment flow')
    ).toHaveTextContent('leoncheng.dev')
    expect(
      screen.getByRole('heading', { name: 'One branch, serialized writes' })
    ).toBeInTheDocument()
  })
})
