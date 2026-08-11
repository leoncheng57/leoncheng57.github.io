import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderGameNights(): void {
  render(
    <MemoryRouter initialEntries={['/georgies-board-game-nights']}>
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

  it('links to the Georgie&apos;s Cafe site, menu, and events pages', () => {
    renderGameNights()

    expect(screen.getByRole('link', { name: "Georgie's Cafe" })).toHaveAttribute(
      'href',
      'https://www.georgies.cafe/'
    )
    expect(
      screen.getByRole('link', { name: /grab a snack or drink/i })
    ).toHaveAttribute('href', 'https://www.georgies.cafe/menu')
    expect(
      screen.getByRole('link', { name: /book the space/i })
    ).toHaveAttribute('href', 'https://www.georgies.cafe/events')
    expect(screen.getByText(/open 9 AM-8 PM every day/i)).toBeInTheDocument()
  })

  it('renders arrow glyphs instead of raw HTML entities', () => {
    renderGameNights()

    expect(document.body.textContent).not.toMatch(/&nearr;|&darr;/i)
    expect(screen.getAllByText('↗').length).toBeGreaterThan(0)
  })

  it('explains how to join the private group chat', () => {
    renderGameNights()

    expect(
      screen.getByRole('heading', { name: 'Show up, then join the chat.' })
    ).toBeInTheDocument()
    expect(screen.getByText(/ask a host to add you/i)).toBeInTheDocument()
  })

  it('links back to LeonCheng.dev from the footer', () => {
    renderGameNights()

    expect(
      screen.getByRole('link', { name: '← LeonCheng.dev' })
    ).toHaveAttribute('href', 'https://leoncheng.dev/')
  })

  it('redirects the old /game-nights URL to the new route', () => {
    render(
      <MemoryRouter initialEntries={['/game-nights']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: /No pressure\./ })
    ).toBeInTheDocument()
  })

  it('describes listed games as examples, not inventory', () => {
    renderGameNights()

    expect(screen.getByText('Unstable Unicorns')).toBeInTheDocument()
    expect(screen.getByText('The Mind')).toBeInTheDocument()
    expect(screen.getByText('Sushi Go')).toBeInTheDocument()
    expect(screen.getByText('Slapjack')).toBeInTheDocument()
    expect(screen.getByText('Fire Storm')).toBeInTheDocument()
    expect(screen.getByText('Sequence')).toBeInTheDocument()
    expect(screen.getByText(/not a guaranteed inventory/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/the selection changes every week/i)
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Cranium')).not.toBeInTheDocument()
    expect(screen.queryByText('Anomia')).not.toBeInTheDocument()
  })
})
