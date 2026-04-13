import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('blog routes', () => {
  it('renders the blog index route', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hello Blog' })).toBeInTheDocument()
  })

  it('renders the blog post route with metadata', () => {
    render(
      <MemoryRouter initialEntries={['/blog/hello-blog']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Hello Blog' })).toBeInTheDocument()
    expect(screen.getByText(/estimated reading time/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrease font size' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset font size' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase font size' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Why this exists' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Link to section Why this exists' })).toBeInTheDocument()
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
})
