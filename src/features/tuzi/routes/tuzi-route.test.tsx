import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'
import { books } from '../data/books'

function renderTuzi(path = '/tuzi/'): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('Tuzi route', () => {
  it('renders the Elo comparison and complete static catalog', () => {
    renderTuzi()

    expect(
      screen.getByRole('heading', { name: 'Pick your next.' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/profiles and activity are public/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pachinko/i })).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'All books' })).toBeInTheDocument()
    expect(books.length).toBeGreaterThan(100)
    expect(screen.getAllByRole('listitem')).toHaveLength(books.length + 3)
  })

  it('collapses and expands the public-data warning', async () => {
    const user = userEvent.setup()
    renderTuzi()

    await user.click(screen.getByRole('button', { name: 'Collapse public data notice' }))
    expect(screen.queryByText(/profiles and activity are public/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand public data notice' }))
    expect(screen.getByText(/profiles and activity are public/i)).toBeInTheDocument()
  })

  it('advances the comparison after choosing a book', async () => {
    const user = userEvent.setup()
    renderTuzi()

    await user.click(screen.getByRole('button', { name: /pachinko/i }))

    expect(screen.getByText('Pachinko moves up your shelf.')).toBeInTheDocument()
    expect(screen.getByLabelText('1 of 20 comparisons complete')).toBeInTheDocument()
    expect(screen.getByText('1516')).toBeInTheDocument()
  })

  it('chooses a book by dragging toward it', () => {
    renderTuzi()
    const book = screen.getByRole('button', {
      name: /tomorrow, and tomorrow, and tomorrow/i,
    })

    fireEvent.pointerDown(book, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(book, { clientX: 190, clientY: 118, pointerId: 1 })
    fireEvent.pointerUp(book, { clientX: 190, clientY: 118, pointerId: 1 })

    expect(
      screen.getByText('Tomorrow, and Tomorrow, and Tomorrow moves up your shelf.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('1 of 20 comparisons complete')).toBeInTheDocument()
  })

  it('explains Elo ranking on its own page', () => {
    renderTuzi('/tuzi/how-ranking-works')

    expect(
      screen.getByRole('heading', { name: /elo turns every pick/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/two new books meet at 1500/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to ranking/i })).toHaveAttribute(
      'href',
      '/tuzi/',
    )
  })
})
