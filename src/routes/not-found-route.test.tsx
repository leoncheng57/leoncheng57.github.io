import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('NotFoundRoute', () => {
  it('renders the 404 page for an unknown path', () => {
    render(
      <MemoryRouter initialEntries={['/this-page-does-not-exist']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Page not found' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('does not render the 404 page for a known path', () => {
    render(
      <MemoryRouter initialEntries={['/apps']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.queryByRole('heading', { level: 1, name: 'Page not found' })
    ).not.toBeInTheDocument()
  })
})
