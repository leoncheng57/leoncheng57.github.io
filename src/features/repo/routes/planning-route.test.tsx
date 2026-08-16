import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../App'
import {
  formatRelativeDays,
  pickLabelTextColor,
  toDescriptionPreview,
} from '../components/OpenIssues'

const FROZEN_NOW = new Date('2026-08-16T12:00:00Z')

const longBody = `## Goal\n\n${'A very long description sentence. '.repeat(20)}`

const sampleItems = [
  {
    id: 1,
    number: 84,
    title: 'Design: Change the website theme',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/issues/84',
    body: '- add a **dark** theme\n- see [mockups](https://example.com)',
    labels: [
      { name: 'app:platform', color: 'aaaaaa' },
      { name: 'prio:high', color: 'b60205' },
    ],
    comments: 3,
    created_at: '2026-08-04T10:00:00Z',
    updated_at: '2026-08-13T10:00:00Z',
  },
  {
    id: 2,
    number: 91,
    title: 'A pull request shown on the board',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/pull/91',
    pull_request: {},
    body: longBody,
    labels: [{ name: 'prio:low', color: '0e8a16' }],
    comments: 1,
    created_at: '2026-08-16T09:00:00Z',
    updated_at: '2026-08-16T10:00:00Z',
  },
  {
    id: 3,
    number: 95,
    title: 'An issue without a priority label',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/issues/95',
    body: null,
    labels: [],
    comments: 0,
    created_at: '2026-07-20T10:00:00Z',
    updated_at: '2026-07-27T10:00:00Z',
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
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(FROZEN_NOW)
    mockIssuesFetch({})
  })

  afterEach(() => {
    vi.useRealTimers()
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

    const prLink = screen.getByRole('link', {
      name: /#91 A pull request shown on the board/,
    })
    expect(prLink).toHaveAttribute(
      'href',
      'https://github.com/leoncheng57/leoncheng57.github.io/pull/91'
    )
    expect(within(prLink).getByRole('img', { name: 'Pull request' })).toBeInTheDocument()
    expect(within(issueLink).getByRole('img', { name: 'Issue' })).toBeInTheDocument()
  })

  it('renders bold issue titles', async () => {
    renderPlanning()

    const title = await screen.findByText('Design: Change the website theme')
    expect(title.tagName).toBe('STRONG')
  })

  it('always renders all four priority groups', async () => {
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

    // Medium is empty but its heading still renders with an empty state.
    expect(
      screen.getByRole('heading', { level: 3, name: /Medium priority/ })
    ).toBeInTheDocument()
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()

    // Priority labels drive grouping instead of showing as pills.
    expect(screen.queryByText('prio:high')).not.toBeInTheDocument()
  })

  it('shows comment counts and relative day counts for opened/active', async () => {
    renderPlanning()

    expect(
      await screen.findByText('3 comments · opened 12d ago')
    ).toBeInTheDocument()
    expect(screen.getByText('active 3d ago')).toBeInTheDocument()

    expect(screen.getByText('1 comment · opened today')).toBeInTheDocument()
    expect(screen.getByText('active today')).toBeInTheDocument()

    expect(screen.getByText('0 comments · opened 27d ago')).toBeInTheDocument()
    expect(screen.getByText('active 20d ago')).toBeInTheDocument()
  })

  it('shows a cleaned, truncated description preview', async () => {
    renderPlanning()

    // Markdown list markers, bold markers, and link targets are stripped.
    expect(
      await screen.findByText('add a dark theme see mockups')
    ).toBeInTheDocument()

    // Long bodies are truncated with an ellipsis.
    const truncated = screen.getByText(/^Goal A very long description/)
    expect(truncated.textContent?.endsWith('…')).toBe(true)
    expect(truncated.textContent?.length).toBeLessThanOrEqual(241)
  })

  it('applies GitHub label colors to label pills', async () => {
    renderPlanning()

    const pill = await screen.findByText('app:platform')
    expect(pill).toHaveStyle({ backgroundColor: '#aaaaaa' })
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

describe('planning helpers', () => {
  it('formatRelativeDays counts whole days and clamps to today', () => {
    const now = Date.parse('2026-08-16T12:00:00Z')
    expect(formatRelativeDays('2026-08-16T09:00:00Z', now)).toBe('today')
    expect(formatRelativeDays('2026-08-15T11:00:00Z', now)).toBe('1d ago')
    expect(formatRelativeDays('2026-08-04T10:00:00Z', now)).toBe('12d ago')
    expect(formatRelativeDays('2026-08-17T13:00:00Z', now)).toBe('today')
    expect(formatRelativeDays('not a date', now)).toBe('')
  })

  it('pickLabelTextColor chooses readable text for light and dark labels', () => {
    expect(pickLabelTextColor('fbca04')).toBe('#1c2733')
    expect(pickLabelTextColor('b60205')).toBe('#ffffff')
    expect(pickLabelTextColor('nonsense')).toBe('inherit')
  })

  it('toDescriptionPreview strips markdown noise', () => {
    expect(toDescriptionPreview('# Title\n\n`code` and <b>html</b>')).toBe(
      'Title code and html'
    )
    expect(toDescriptionPreview('![img](x.png) text')).toBe('text')
    expect(toDescriptionPreview(null)).toBe('')
  })
})
