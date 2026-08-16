import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderCookToday(): void {
  render(
    <MemoryRouter initialEntries={['/cook-today']}>
      <App />
    </MemoryRouter>
  )
}

describe('Cook Today route', () => {
  it('renders the placeholder page', () => {
    renderCookToday()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cook Today' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Still taking shape' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/fill out a very quick checkbox form/i)
    ).toBeInTheDocument()
  })

  it('links back to the apps index', () => {
    renderCookToday()

    expect(screen.getByRole('link', { name: 'Back to apps' })).toHaveAttribute(
      'href',
      '/apps'
    )
  })
})
