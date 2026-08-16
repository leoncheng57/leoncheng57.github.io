import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../App'

const sampleItems = [
  {
    id: 1,
    number: 84,
    title: 'Design: Change the website theme',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/issues/84',
    labels: [{ name: 'design' }, { name: 'prio:high' }],
    comments: 3,
    updated_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    number: 91,
    title: 'A pull request shown on the board',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/pull/91',
    pull_request: {},
    labels: [{ name: 'prio:low' }],
    comments: 1,
    updated_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 3,
    number: 95,
    title: 'An issue without a priority label',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/issues/95',
    labels: [],
    comments: 0,
    updated_at: '2026-07-20T10:00:00Z',
  },
]

function mockIssuesFetch(response: Partial<Response>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleItems,
      ...response,
    })
  )
}

function renderPlanning(): void {
  render(
    <MemoryRouter initialEntries={['/repo/planning']}>
      <App />
    </MemoryRouter>
  )
}

describe('repo planning route', () => {
  beforeEach(() => {
    mockIssuesFetch({})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists open issues and pull requests from GitHub', async () => {
    renderPlanning()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Project planning' })
    ).toBeInTheDocument()

    const issueLink = await screen.findByRole('link', {
      name: /#84 Design: Change the website theme/,
    })
    expect(issueLink).toHaveAttribute(
      'href',
      'https://github.com/leoncheng57/leoncheng57.github.io/issues/84'
    )
    expect(screen.getByText('design')).toBeInTheDocument()

    const prLink = screen.getByRole('link', {
      name: /#91 A pull request shown on the board/,
    })
    expect(prLink).toHaveAttribute(
      'href',
      'https://github.com/leoncheng57/leoncheng57.github.io/pull/91'
    )
    expect(screen.getByText('PR')).toBeInTheDocument()
  })

  it('groups items by priority label', async () => {
    renderPlanning()

    const high = await screen.findByRole('list', { name: 'High priority' })
    expect(
      within(high).getByText(/Design: Change the website theme/)
    ).toBeInTheDocument()

    const low = screen.getByRole('list', { name: 'Low priority' })
    expect(
      within(low).getByText(/A pull request shown on the board/)
    ).toBeInTheDocument()

    const unprioritized = screen.getByRole('list', { name: 'Unprioritized' })
    expect(
      within(unprioritized).getByText(/An issue without a priority label/)
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('list', { name: 'Medium priority' })
    ).not.toBeInTheDocument()

    // Priority labels are shown via group headings, not as pills.
    expect(screen.queryByText('prio:high')).not.toBeInTheDocument()
  })

  it('shows comment counts and last activity dates', async () => {
    renderPlanning()

    expect(
      await screen.findByText('3 comments · last activity Aug 1, 2026')
    ).toBeInTheDocument()
    expect(
      screen.getByText('1 comment · last activity Aug 12, 2026')
    ).toBeInTheDocument()
    expect(
      screen.getByText('0 comments · last activity Jul 20, 2026')
    ).toBeInTheDocument()
  })

  it('falls back to the GitHub issue tracker link when the API fails', async () => {
    mockIssuesFetch({ ok: false, status: 403 })

    renderPlanning()

    expect(
      await screen.findByRole('link', { name: 'issue tracker on GitHub' })
    ).toHaveAttribute(
      'href',
      'https://github.com/leoncheng57/leoncheng57.github.io/issues'
    )
  })

  it('links back home', async () => {
    renderPlanning()

    expect(
      screen.getByRole('link', { name: 'Back home' })
    ).toHaveAttribute('href', '/')

    await screen.findByLabelText('Open GitHub issues')
  })
})
