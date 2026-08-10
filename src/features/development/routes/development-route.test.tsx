import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('development route', () => {
  it('documents production and preview deployments', () => {
    render(
      <MemoryRouter initialEntries={['/development']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Development' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Production' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Pull request previews' })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Production deployment flow')
    ).toHaveTextContent('leoncheng.dev')
    expect(
      screen.getByLabelText('Pull request preview flow')
    ).toHaveTextContent('previews/pr-N')
  })

  it('uses the logo as the home link and does not render redundant Home text', () => {
    render(
      <MemoryRouter initialEntries={['/development']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'LC Logo' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Development' })
    ).toHaveAttribute('href', '/development')
  })
})
