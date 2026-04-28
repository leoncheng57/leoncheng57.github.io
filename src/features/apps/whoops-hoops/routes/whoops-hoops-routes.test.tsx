import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../../App'

describe('whoops hoops legal routes', () => {
  it('renders the privacy policy page', () => {
    render(
      <MemoryRouter initialEntries={['/apps/whoops-hoops/privacy']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /Whoops Hoops.*Privacy Policy/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Information we collect/i }))
      .toBeInTheDocument()
    expect(screen.getByText(/Firebase Analytics/i)).toBeInTheDocument()
    expect(screen.getByText(/IDFA/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Whoops Hoops support page' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'leon.cheng.work@gmail.com' })
    ).toHaveAttribute('href', 'mailto:leon.cheng.work@gmail.com')
  })

  it('renders the support page', () => {
    render(
      <MemoryRouter initialEntries={['/apps/whoops-hoops/support']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /Whoops Hoops.*Support/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Contact/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /How to play/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Frequently asked questions/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /github\.com/i })
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'leon.cheng.work@gmail.com' })[0]
    ).toHaveAttribute('href', 'mailto:leon.cheng.work@gmail.com')
    expect(
      screen.getByRole('link', { name: 'Whoops Hoops Privacy Policy' })
    ).toBeInTheDocument()
  })

  it('does not render the site top nav on whoops hoops legal pages', () => {
    render(
      <MemoryRouter initialEntries={['/apps/whoops-hoops/privacy']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Blogs' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'LC Logo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Back home' })).not.toBeInTheDocument()
  })
})
