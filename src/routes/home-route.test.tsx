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
    const cards = within(recentWork).getAllByRole('heading', { level: 3 }).map(heading => within(heading).getByRole('link'))

    expect(cards).toHaveLength(6)
    expect(cards.map((card) => card.getAttribute('href'))).toEqual([
      '/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca',
      '/blog/the-cost-of-waiting-on-agents',
      '/blog/building-hedwig-ai-tooling-hub',
      '/guides/custom-coding-agent-ide-with-openhands',
      '/blog/how-openhands-was-integrated',
      '/blog/building-house-party-photo-hunt',
    ])
    const articles = recentWork.querySelectorAll('article')
    expect(articles).toHaveLength(6)
    articles.forEach(card => {
      expect(card.children).toHaveLength(2)
      expect(card.firstElementChild?.tagName).toBe('H3')
      expect(card.querySelector('time')).not.toBeNull()
    })
  })
})
