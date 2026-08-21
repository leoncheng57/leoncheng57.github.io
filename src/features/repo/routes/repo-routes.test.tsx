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
      within(repoPages).getByText('Design Components').closest('a')
    ).toHaveAttribute('href', '/repo/design-components')
    expect(
      within(repoPages).getByText('Animations').closest('a')
    ).toHaveAttribute('href', '/repo/animations')
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
  it('documents the motion system at /repo/animations', () => {
    render(
      <MemoryRouter initialEntries={['/repo/animations']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Animations' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The stack' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Live specimen: the session storyboard' })
    ).toBeInTheDocument()
    // The real blog component is rendered as the specimen, not a copy.
    expect(
      screen.getByRole('img', { name: 'A session, from idea to merged MR' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recipes' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Path traveler (SMIL)' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reduced motion' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Embedding in articles' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Verifying motion' })).toBeInTheDocument()
  })

  it('showcases the visual system at /repo/design-components', () => {
    render(
      <MemoryRouter initialEntries={['/repo/design-components']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Design Components' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Color palette' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cards' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Terminal card' })
    ).toBeInTheDocument()

    // Chapters bar & scrollspy specimen: the live guide TOC with a simulated
    // scrolled-to chapter controlled by the numbered buttons.
    expect(
      screen.getByRole('heading', { name: 'Chapters bar & scrollspy' })
    ).toBeInTheDocument()
    const simulateRow = screen.getByRole('group', {
      name: 'Simulate the scrolled-to chapter',
    })
    expect(within(simulateRow).getAllByRole('button').length).toBeGreaterThan(2)
    const specimenNav = screen.getByRole('navigation', { name: 'Guide chapters' })
    expect(
      within(specimenNav).getByRole('button', { name: /Chapters/ })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /read guide/ })).toHaveAttribute(
      'href',
      '/guides/custom-coding-agent-ide-with-openhands'
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Still taking shape' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Loading bars' })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(4)
  })

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
    expect(screen.getByText(/site sends an explicit/)).toBeInTheDocument()
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
      screen.getByRole('heading', { level: 3, name: 'Tuzi' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Alpha')).toHaveLength(3)
    expect(screen.getAllByText('local-only')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Tuzi' })).toHaveAttribute(
      'href',
      '/tuzi/'
    )
    expect(screen.getByRole('link', { name: 'Start ranking' })).toHaveAttribute(
      'href',
      '/tuzi/'
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'GA Traffic Dashboard' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'GA Traffic Dashboard' })
    ).toHaveAttribute('href', '/repo/alpha-projs/ga-traffic-dashboard')
    const readMoreLinks = screen.getAllByRole('link', { name: 'Read more' })
    expect(readMoreLinks).toHaveLength(2)
    expect(readMoreLinks[0]).toHaveAttribute(
      'href',
      '/repo/alpha-projs/ga-traffic-dashboard'
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Gmail Reader' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Gmail Reader' })
    ).toHaveAttribute('href', '/repo/alpha-projs/gmail-reader')
    expect(readMoreLinks[1]).toHaveAttribute(
      'href',
      '/repo/alpha-projs/gmail-reader'
    )
    expect(
      screen.getByRole('link', { name: 'Back home' })
    ).toHaveAttribute('href', '/')
  })

  it('renders the GA traffic dashboard page at /repo/alpha-projs/ga-traffic-dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/repo/alpha-projs/ga-traffic-dashboard']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'GA Traffic Dashboard' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to alpha projs' })
    ).toHaveAttribute('href', '/repo/alpha-projs')
    expect(
      screen.getByRole('link', { name: 'Source code on GitHub' })
    ).toHaveAttribute(
      'href',
      'https://github.com/leoncheng57/leoncheng57.github.io/tree/main/alpha-projs/ga-traffic-dashboard'
    )
    expect(
      screen.getByRole('link', { name: 'GA4: Pages and screens' })
    ).toHaveAttribute('href', expect.stringContaining('analytics.google.com'))
    expect(
      screen.getByRole('link', { name: 'GA4: per-app rows, year to date' })
    ).toHaveAttribute('href', expect.stringContaining('analytics.google.com'))
    expect(screen.getAllByText('(private-access-only)')).toHaveLength(3)
    expect(
      screen.getByAltText(/Full dashboard page rendered with demo data/)
    ).toHaveAttribute('src', '/alpha-projs/ga-dashboard-demo.png')
    expect(
      screen.getByAltText(/Static deployment notice/)
    ).toHaveAttribute('src', '/alpha-projs/ga-dashboard-static-notice.png')
  })

  it('renders the Gmail Reader page at /repo/alpha-projs/gmail-reader', () => {
    render(
      <MemoryRouter initialEntries={['/repo/alpha-projs/gmail-reader']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Gmail Reader' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to alpha projs' })
    ).toHaveAttribute('href', '/repo/alpha-projs')
    expect(
      screen.getByRole('heading', { name: 'How it works' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Run it yourself' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Local setup commands')).toHaveTextContent(
      'git clone git@github.com:leoncheng57/gmail-reader.git'
    )
    expect(
      screen.getByRole('link', { name: 'gmail-reader on GitHub' })
    ).toHaveAttribute('href', 'https://github.com/leoncheng57/gmail-reader')
    expect(
      screen.getByRole('link', { name: 'README: setup and daily use' })
    ).toHaveAttribute(
      'href',
      'https://github.com/leoncheng57/gmail-reader#readme'
    )
    expect(screen.getAllByText('(private-access-only)')).toHaveLength(4)
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
