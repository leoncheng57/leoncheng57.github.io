import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { getBlogFeed } from '../features/blog/feed'

describe('home sections', () => {
  it('separates the latest blogs and guides from apps with dates on every card', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    const blogs = screen.getByRole('region', { name: 'Blogs' })
    const apps = screen.getByRole('region', { name: 'Apps' })
    const blogLinks = within(blogs).getAllByRole('heading', { level: 3 }).map(h => within(h).getByRole('link'))
    expect(blogLinks.map(link => link.getAttribute('href'))).toEqual(getBlogFeed().slice(0, 6).map(post => post.href))
    expect(within(apps).getByRole('link', { name: 'NYC Weather' })).toHaveAttribute('href', '/weather')
    expect(within(apps).getByRole('link', { name: 'NYC Weather - Chromium Extension' })).toHaveAttribute('href', '/apps/nyc-weather-extension')
    expect(within(blogs).queryByRole('link', { name: 'Sub-Wait' })).not.toBeInTheDocument()
    expect(within(apps).getByRole('link', { name: 'T-minus - Chromium Extension' })).toHaveAttribute('href', '/apps/t-minus-extension')
    expect(apps.querySelectorAll('article')).toHaveLength(8)
    for (const region of [blogs, apps]) {
      const dates = Array.from(region.querySelectorAll('article time')).map(time => time.getAttribute('datetime'))
      expect(dates).toEqual([...dates].sort().reverse())
      region.querySelectorAll('article').forEach(card => {
        expect(card.querySelector('h3')).not.toBeNull()
        if (region === apps) expect(card.querySelector('img')).toHaveAttribute('alt', '')
        expect(card.querySelector('time')).not.toBeNull()
      })
    }
  })
})
