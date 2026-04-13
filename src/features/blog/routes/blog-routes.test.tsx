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

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'LC Logo' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'LC Logo' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Read the blog' })).toBeInTheDocument()
  })

  it('renders the blog index route', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hello Blog' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'AI Coding Agent Desktop App Comparison (April 2026)' })
    ).toBeInTheDocument()
    expect(screen.getByText('meta')).toBeInTheDocument()
    expect(screen.getByText('intro')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back home' })).toBeInTheDocument()
  })

  it('renders the blog post route with metadata', () => {
    render(
      <MemoryRouter initialEntries={['/blog/hello-blog']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Hello Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blogs' })).toBeInTheDocument()
    expect(screen.getByText(/estimated reading time/i)).toBeInTheDocument()
    expect(screen.getByText('meta')).toBeInTheDocument()
    expect(screen.getByText('intro')).toBeInTheDocument()
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
