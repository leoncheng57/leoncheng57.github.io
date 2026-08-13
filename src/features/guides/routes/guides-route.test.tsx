import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('guides route', () => {
  it('renders the styled placeholder page and primary navigation', () => {
    render(
      <MemoryRouter initialEntries={['/guides']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Guides' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Still taking shape' })
    ).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Guides' })).toHaveAttribute(
      'href',
      '/guides'
    )

    expect(
      screen.getByRole('button', { name: 'Repo pages' })
    ).toHaveAttribute('title', 'Repo pages')
  })
})
