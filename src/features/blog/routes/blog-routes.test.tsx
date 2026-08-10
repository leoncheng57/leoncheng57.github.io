import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('blog routes', () => {
  it('renders the shared top navbar on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Repo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'LC Logo' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'LC Logo' })).toHaveLength(1)
    expect(screen.queryByRole('link', { name: 'Read the blog' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: /Worktrees, Remote Coding Agents, and Choosing the Right Kind of Isolation/i,
      })
    ).toHaveAttribute('href', '/blog/worktrees-vs-remote-coding-agents')
    expect(
      screen.getByRole('link', { name: /My cmux Setup for Parallel AI Coding/i })
    ).toHaveAttribute('href', '/blog/my-cmux-setup-for-parallel-ai-coding')
  })

  it('renders the blog index route', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Repo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hello Blog' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'AI Coding Agent Desktop App Comparison (April 2026)' })
    ).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: 'Repo' })).toBeInTheDocument()
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
})
