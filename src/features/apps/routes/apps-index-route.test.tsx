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
    expect(cards).toHaveLength(2)

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
  })
})
