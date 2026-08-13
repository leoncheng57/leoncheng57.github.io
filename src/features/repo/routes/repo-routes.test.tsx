import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('repo hub route', () => {
  it('mostly lists the subpages', () => {
    render(
      <MemoryRouter initialEntries={['/repo']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Repo' })
    ).toBeInTheDocument()

    const subpageNav = screen.getByRole('navigation', { name: 'Repo pages' })
    expect(subpageNav).toBeInTheDocument()
    expect(within(subpageNav).getByRole('link', { name: /CI checks/ })).toHaveAttribute(
      'href',
      '/repo/ci'
    )
    expect(
      within(subpageNav).getByRole('link', { name: /Production deploys/ })
    ).toHaveAttribute('href', '/repo/production')
    expect(
      within(subpageNav).getByRole('link', { name: /Pull request previews/ })
    ).toHaveAttribute('href', '/repo/previews')
    expect(
      within(subpageNav).getByRole('link', { name: /Project planning/ })
    ).toHaveAttribute('href', '/repo/planning')
    expect(
      within(subpageNav).getByRole('link', { name: /Google Analytics/ })
    ).toHaveAttribute('href', '/repo/google-analytics')
    expect(
      within(subpageNav).getByRole('link', { name: /Alpha Projs/ })
    ).toHaveAttribute('href', '/repo/alpha-projs')

    // The detailed content lives on the subpages, not the hub.
    expect(
      screen.queryByLabelText('Production deployment flow')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Continuous integration commands')
    ).not.toBeInTheDocument()
  })

  it('uses a wrench link for Repo and lists its pages in the primary nav', () => {
    render(
      <MemoryRouter initialEntries={['/repo']}>
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
    expect(within(primaryNav).getByRole('link', { name: 'Repo' })).toHaveAttribute(
      'href',
      '/repo'
    )

    const repoPages = within(primaryNav).getByLabelText('Repo pages')
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
  })

  it('redirects the old /development URLs to /repo', () => {
    render(
      <MemoryRouter initialEntries={['/development']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Repo' })
    ).toBeInTheDocument()
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
      screen.getByRole('link', { name: 'Back to Repo' })
    ).toHaveAttribute('href', '/repo')
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
      screen.getByRole('link', { name: 'Back to Repo' })
    ).toHaveAttribute('href', '/repo')
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
      screen.getByRole('link', { name: 'Back to Repo' })
    ).toHaveAttribute('href', '/repo')
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
