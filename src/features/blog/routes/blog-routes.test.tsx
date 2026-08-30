import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function LocationProbe() {
  const { pathname, search, hash } = useLocation()
  return <output data-testid="location">{`${pathname}${search}${hash}`}</output>
}

describe('blog routes', () => {
  it('renders the shared top navbar on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Repo pages' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'LC Logo' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'LC Logo' })).toHaveLength(1)
    expect(screen.queryByRole('link', { name: 'Read the blog' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: /The Cost of Waiting on Agents/i,
      })
    ).toHaveAttribute('href', '/blog/the-cost-of-waiting-on-agents')
    expect(
      screen.getByRole('link', {
        name: /Building Hedwig: From One AI Workflow to an Internal Platform/i,
      })
    ).toHaveAttribute('href', '/blog/building-hedwig-ai-tooling-hub')
    expect(
      screen.getByRole('link', {
        name: /Building House Party Photo Hunt/i,
      })
    ).toHaveAttribute('href', '/blog/building-house-party-photo-hunt')
  })

  it('renders the blog index route', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Blog' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Repo pages' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hello Blog' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'AI Coding Agent Desktop App Comparison (April 2026)' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Building Hedwig: From One AI Workflow to an Internal Platform',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Early Learnings While Building My Own Desktop Coding Agent (DCA)',
      })
    ).toHaveAttribute(
      'href',
      '/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca'
    )
    expect(screen.getByText('meta')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back home' })).toBeInTheDocument()
  })

  it('filters the blog index by multiple tags', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filter tags' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'collaboration' }))

    expect(
      screen.getByRole('link', { name: 'The Ticket Is the Interface: A Better Way to Work With AI' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'My cmux Setup for Parallel AI Coding' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'side-project' }))

    expect(
      screen.getByRole('link', { name: 'The Ticket Is the Interface: A Better Way to Work With AI' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Building Whoops Hoops: From Side Project to the App Store' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.getByRole('link', { name: 'Hello Blog' })).toBeInTheDocument()
  })

  it('adds a blog card tag to the active filter when clicked', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'collaboration' }))

    expect(screen.getByRole('button', { name: 'Filter tags' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('checkbox', { name: 'collaboration' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Remove collaboration filter' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'The Ticket Is the Interface: A Better Way to Work With AI' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'My cmux Setup for Parallel AI Coding' })).not.toBeInTheDocument()
  })

  it('closes the tag filter when clicking outside it', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filter tags' }))
    expect(screen.getByRole('region', { name: 'Filter posts by tag' })).toBeInTheDocument()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('region', { name: 'Filter posts by tag' })).not.toBeInTheDocument()
  })

  it('renders the blog post route with metadata', () => {
    render(
      <MemoryRouter initialEntries={['/blog/hello-blog']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Hello Blog' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Repo pages' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByText(/estimated reading time/i)).toBeInTheDocument()
    expect(screen.getByText('meta')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrease font size' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset font size' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase font size' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Why this exists' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Link to section Why this exists' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to blog' })).toBeInTheDocument()
  })

  it('opens and closes the image zoom dialog', () => {
    render(
      <MemoryRouter initialEntries={['/blog/hello-blog']}>
        <App />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Zoom image: A collage of product design and styling work' }))

    expect(screen.getByRole('dialog', { name: 'Image zoom viewer' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close image zoom' }))

    expect(screen.queryByRole('dialog', { name: 'Image zoom viewer' })).not.toBeInTheDocument()
  })

  it('renders a not found state for unknown blog slugs', () => {
    render(
      <MemoryRouter initialEntries={['/blog/missing-post']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to blog' })).toBeInTheDocument()
  })

  it('renders the AI coding agent post by direct slug', () => {
    render(
      <MemoryRouter initialEntries={['/blog/ai-coding-agent-desktop-app-comparison-april-2026']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'AI Coding Agent Desktop App Comparison (April 2026)' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Why I am calling these Desktop Coding Agents' })
    ).toBeInTheDocument()
  })

  it('renders the DCA learnings article at its canonical slug', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca',
        ]}
      >
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        name: 'Early Learnings While Building My Own Desktop Coding Agent (DCA)',
      })
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Post not found' })).not.toBeInTheDocument()
  })

  it('redirects the old DCA article slug while preserving query and hash', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/blog/practical-dca-workflows?from=legacy#sticky-code-review',
        ]}
      >
        <App />
        <LocationProbe />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca?from=legacy#sticky-code-review'
      )
    })
    expect(
      screen.getByRole('heading', {
        name: 'Early Learnings While Building My Own Desktop Coding Agent (DCA)',
      })
    ).toBeInTheDocument()
  })

  it('renders the Hedwig article navigation and interactive figures', () => {
    render(
      <MemoryRouter initialEntries={['/blog/building-hedwig-ai-tooling-hub']}>
        <App />
      </MemoryRouter>
    )

    const tableOfContents = screen.getByRole('navigation', { name: 'Table of contents' })
    expect(tableOfContents).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'What Hedwig became', hidden: true })
    ).toHaveAttribute('href', '#what-hedwig-became')
    expect(
      screen.getByRole('link', { name: 'A Skills Marketplace packages behavior', hidden: true })
    ).toHaveAttribute('href', '#a-skills-marketplace-packages-behavior')
    expect(
      screen.getByRole('region', { name: /interactive control-panel tour of eight AI tools/i })
    ).toBeInTheDocument()
    expect(tableOfContents).toHaveTextContent('Important features to showcase')
    expect(
      screen.getByRole('link', { name: 'Feature tour', hidden: true })
    ).toHaveAttribute('href', '#feature-tour')
    expect(tableOfContents).toHaveTextContent('Historical Timeline')
    expect(screen.getAllByRole('button', { name: /Playgrounds/i })).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: /Cmd\+K/i })).not.toHaveLength(0)
    expect(
      screen.getByRole('region', { name: /compact Playgrounds and Skills simulation/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: /compact Cmd\/Ctrl\+K discovery simulation/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: /compact MCP tools-library simulation/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Hedwig historical timeline' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Historical Timeline' })).toBeInTheDocument()
    expect(screen.queryByText(/Data team helper/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Data team helper/i })).not.toBeInTheDocument()
  })
})
