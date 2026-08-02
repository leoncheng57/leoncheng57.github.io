import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('apps index route', () => {
  it('promotes House Party Photo Hunt at its public URL', () => {
    render(
      <MemoryRouter initialEntries={['/apps']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: 'House Party Photo Hunt' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Play' })).toHaveAttribute(
      'href',
      'https://leoncheng.dev/vibe-photo-voting-house-game/'
    )
    expect(screen.getByText(/vote on your favorites/i)).toBeInTheDocument()
  })
})
