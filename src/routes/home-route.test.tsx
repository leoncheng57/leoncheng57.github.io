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
      '/blog/practical-dca-workflows',
      '/blog/the-cost-of-waiting-on-agents',
      '/blog/building-hedwig-ai-tooling-hub',
      '/guides/custom-coding-agent-ide-with-openhands',
      '/blog/how-openhands-was-integrated',
      '/blog/building-house-party-photo-hunt',
    ])
    expect(within(recentWork).queryAllByText('Project')).toHaveLength(0)
    expect(within(recentWork).queryAllByText('App')).toHaveLength(0)
    expect(within(recentWork).getAllByText('Blog')).toHaveLength(5)
    expect(within(recentWork).getAllByText('Guide')).toHaveLength(1)
    expect(within(recentWork).queryAllByText('Alpha')).toHaveLength(0)
    expect(within(recentWork).queryAllByText('Beta')).toHaveLength(0)
  })
})
