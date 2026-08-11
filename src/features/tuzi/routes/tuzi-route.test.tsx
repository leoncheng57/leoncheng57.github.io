import { fireEvent, render, screen } from '@testing-library/react'
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

    expect(
      screen.getByRole('heading', { name: 'Pick your next.' }),
    ).toBeInTheDocument()
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

  it('chooses a book by dragging toward it', () => {
    renderTuzi()
    const comparison = screen.getByRole('group', {
      name: /swipe left for pachinko or right for tomorrow/i,
    })

    fireEvent.pointerDown(comparison, { clientX: 100, pointerId: 1 })
    fireEvent.pointerMove(comparison, { clientX: 190, pointerId: 1 })
    fireEvent.pointerUp(comparison, { clientX: 190, pointerId: 1 })

    expect(
      screen.getByText('Tomorrow, and Tomorrow, and Tomorrow moves up your shelf.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('13 of 20 books ranked')).toBeInTheDocument()
  })
})
