import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('guides index route', () => {
  it('lists published guides with their metadata and primary navigation', () => {
    render(
      <MemoryRouter initialEntries={['/guides']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Guides' })).toBeInTheDocument()

    const guideLink = screen.getByRole('link', {
      name: 'Running Parallel Coding Agents with a Manager and Workers',
    })
    expect(guideLink).toHaveAttribute('href', '/guides/manager-worker-parallel-agents')
    expect(screen.getByText(/Last reviewed:/)).toBeInTheDocument()
    expect(screen.getByText(/min read/)).toBeInTheDocument()

    expect(screen.queryByRole('heading', { level: 2, name: 'Still taking shape' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Guides' })).toHaveAttribute('href', '/guides')
    expect(screen.getByRole('button', { name: 'Repo pages' })).toHaveAttribute('title', 'Repo pages')
  })

  it('opens a guide from the index', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/guides']}>
        <App />
      </MemoryRouter>
    )

    await user.click(
      screen.getByRole('link', {
        name: 'Running Parallel Coding Agents with a Manager and Workers',
      })
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Running Parallel Coding Agents with a Manager and Workers',
      })
    ).toBeInTheDocument()
  })
})

describe('guide detail route', () => {
  it('renders the guide content, metadata, and back link', () => {
    render(
      <MemoryRouter initialEntries={['/guides/manager-worker-parallel-agents']}>
        <App />
      </MemoryRouter>
    )

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Running Parallel Coding Agents with a Manager and Workers',
    })
    expect(heading).toBeInTheDocument()

    expect(screen.getByText(/Last reviewed:/)).toBeInTheDocument()
    expect(screen.getByText(/Estimated reading time:/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to guides' })).toHaveAttribute('href', '/guides')

    expect(screen.getByRole('heading', { level: 2, name: 'Procedure' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Step 4: Choose an autonomy level per worker' })
    ).toBeInTheDocument()

    const autonomyDiagram = screen.getByRole('img', { name: /Four configurable worker autonomy levels/ })
    expect(autonomyDiagram).toHaveAttribute(
      'src',
      '/guides/manager-worker-agents/autonomy-spectrum.svg'
    )
  })

  it('supports changing the reading font size', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/guides/manager-worker-parallel-agents']}>
        <App />
      </MemoryRouter>
    )

    const article = screen.getByRole('main')
    expect(article).toHaveStyle({ '--blog-font-size': '1.05rem' })

    await user.click(screen.getByRole('button', { name: 'Increase font size' }))
    expect(article.getAttribute('style')).toContain('--blog-font-size')

    await user.click(screen.getByRole('button', { name: 'Reset font size' }))
    expect(article).toHaveStyle({ '--blog-font-size': '1.05rem' })
  })

  it('renders a not found state for unknown guide slugs', () => {
    render(
      <MemoryRouter initialEntries={['/guides/missing-guide']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Guide not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to guides' })).toBeInTheDocument()
  })

  it('keeps guide tables scoped to the article body', () => {
    render(
      <MemoryRouter initialEntries={['/guides/manager-worker-parallel-agents']}>
        <App />
      </MemoryRouter>
    )

    const tables = screen.getAllByRole('table')
    expect(tables.length).toBeGreaterThan(0)
    expect(within(tables[0]).getAllByRole('row').length).toBeGreaterThan(1)
  })
})
