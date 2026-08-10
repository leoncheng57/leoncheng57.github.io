import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderAppsIndex(): HTMLElement {
  const { container } = render(
    <MemoryRouter initialEntries={['/apps']}>
      <App />
    </MemoryRouter>
  )

  return container
}

describe('apps index route', () => {
  it('renders an icon for every app card', () => {
    const container = renderAppsIndex()

    const cards = container.querySelectorAll('article')
    expect(cards).toHaveLength(5)

    cards.forEach((card) => {
      const icon = card.querySelector('img')
      expect(icon).not.toBeNull()
      expect(icon).toHaveAttribute('width', '64')
      expect(icon).toHaveAttribute('height', '64')
    })
  })

  it('points each icon at its own app artwork', () => {
    const container = renderAppsIndex()

    const iconSources = Array.from(
      container.querySelectorAll('article img')
    ).map((icon) => icon.getAttribute('src'))

    expect(iconSources).toEqual([
      '/app-icons/house-party-photo-hunt.svg',
      '/app-icons/whoops-hoops.png',
      '/app-icons/sub-wait.svg',
      '/app-icons/game-nights.svg',
      '/app-icons/workout-lab.svg',
    ])
  })

  it('marks the icons as decorative because each card already names the app', () => {
    const container = renderAppsIndex()

    Array.from(container.querySelectorAll('article img')).forEach((icon) => {
      expect(icon).toHaveAttribute('alt', '')
    })

    expect(
      screen.getByRole('heading', { level: 2, name: 'House Party Photo Hunt' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Whoops Hoops' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: "Georgie's Game Nights" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Workout Lab BETA' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sub-Wait BETA' })
    ).toBeInTheDocument()
  })

  it('links to the Game Nights page', () => {
    renderAppsIndex()

    expect(
      screen.getByRole('link', { name: "Georgie's Game Nights" })
    ).toHaveAttribute('href', '/georgies-board-game-nights')
  })

  it('links to Workout Lab', () => {
    renderAppsIndex()

    expect(screen.getByRole('link', { name: 'Workout Lab' })).toHaveAttribute(
      'href',
      '/workout-lab'
    )
    expect(screen.getAllByText('BETA').length).toBeGreaterThan(0)
  })

  it('links to Sub-Wait', () => {
    renderAppsIndex()

    expect(screen.getByRole('link', { name: 'Sub-Wait' })).toHaveAttribute(
      'href',
      '/sub-wait'
    )
  })
})
