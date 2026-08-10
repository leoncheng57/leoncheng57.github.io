import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderGameNights(): void {
  render(
    <MemoryRouter initialEntries={['/game-nights']}>
      <App />
    </MemoryRouter>
  )
}

describe('game nights route', () => {
  it('shows the visit details newcomers need', () => {
    renderGameNights()

    expect(screen.getByText('Almost every Friday')).toBeInTheDocument()
    expect(screen.getByText('8:00-11:00 PM')).toBeInTheDocument()
    expect(screen.getByText('VITAL Lower East Side')).toBeInTheDocument()
    expect(screen.getByText('Free to attend')).toBeInTheDocument()
    expect(screen.getByText('No experience needed')).toBeInTheDocument()
  })

  it('explains how to join the private group chat', () => {
    renderGameNights()

    expect(
      screen.getByRole('heading', { name: 'Show up, then join the chat.' })
    ).toBeInTheDocument()
    expect(screen.getByText(/ask a host to add you/i)).toBeInTheDocument()
  })

  it('describes listed games as changing examples', () => {
    renderGameNights()

    expect(screen.getByText('Unstable Unicorns')).toBeInTheDocument()
    expect(screen.getByText('The Crew')).toBeInTheDocument()
    expect(screen.getByText(/not a guaranteed inventory/i)).toBeInTheDocument()
  })
})
