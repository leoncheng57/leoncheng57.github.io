import { render, screen } from '@testing-library/react'
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
    expect(
      screen.getByRole('link', { name: /CI checks/ })
    ).toHaveAttribute('href', '/repo/ci')
    expect(
      screen.getByRole('link', { name: /Production deploys/ })
    ).toHaveAttribute('href', '/repo/production')
    expect(
      screen.getByRole('link', { name: /Pull request previews/ })
    ).toHaveAttribute('href', '/repo/previews')
    expect(
      screen.getByRole('link', { name: /Project planning/ })
    ).toHaveAttribute('href', '/repo/planning')

    // The detailed content lives on the subpages, not the hub.
    expect(
      screen.queryByLabelText('Production deployment flow')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Continuous integration commands')
    ).not.toBeInTheDocument()
  })

  it('uses the logo as the home link and renders Repo in the nav', () => {
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
    expect(screen.getByRole('link', { name: 'Repo' })).toHaveAttribute(
      'href',
      '/repo'
    )
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
