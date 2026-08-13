import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('guides route', () => {
  it('renders the placeholder page and primary navigation', () => {
    render(
      <MemoryRouter initialEntries={['/guides']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Guides' })
    ).toBeInTheDocument()
    expect(screen.getByText('TBD')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Guides' })).toHaveAttribute(
      'href',
      '/guides'
    )

    const repoLink = screen.getByRole('link', { name: 'Repo' })
    expect(repoLink).toHaveAttribute('href', '/repo')
    expect(repoLink).toHaveAttribute('title', 'Repo')
  })
})
