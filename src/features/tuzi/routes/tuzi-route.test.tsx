import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderTuzi(): void {
  render(
    <MemoryRouter initialEntries={['/tuzi/']}>
      <App />
    </MemoryRouter>
  )
}

describe('Tuzi route', () => {
  it('renders the ranking draft and public-data warning', () => {
    renderTuzi()

    expect(screen.getByRole('heading', { name: /pick one/i })).toBeInTheDocument()
    expect(screen.getByText(/profiles and activity are public/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pachinko/i })).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('advances the comparison after choosing a book', async () => {
    const user = userEvent.setup()
    renderTuzi()

    await user.click(screen.getByRole('button', { name: /pachinko/i }))

    expect(screen.getByText('Pachinko moves up your shelf.')).toBeInTheDocument()
    expect(screen.getByLabelText('13 of 20 books ranked')).toBeInTheDocument()
  })
})
