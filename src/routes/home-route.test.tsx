import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('home route recent work', () => {
  it('shows the six newest items across guides, apps, and blogs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    const recentWork = screen.getByRole('region', { name: 'Recent work' })
    const cards = within(recentWork).getAllByRole('link')

    expect(cards).toHaveLength(6)
    expect(cards.map((card) => card.getAttribute('href'))).toEqual([
      '/guides/manager-worker-parallel-agents',
      '/guides/agent-dashboard',
      '/tuzi/',
      '/georgies-board-game-nights',
      '/sub-wait',
      '/workout-lab',
    ])
    expect(within(recentWork).getAllByText('Project')).toHaveLength(1)
    expect(within(recentWork).getAllByText('App')).toHaveLength(3)
    expect(within(recentWork).queryByText('Blog')).not.toBeInTheDocument()
    expect(within(recentWork).getAllByText('Guide')).toHaveLength(2)
    expect(within(recentWork).getAllByText('Alpha')).toHaveLength(1)
    expect(within(recentWork).getAllByText('Beta')).toHaveLength(2)
  })
})
