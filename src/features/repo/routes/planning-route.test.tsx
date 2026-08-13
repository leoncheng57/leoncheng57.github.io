import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../App'

const sampleIssues = [
  {
    id: 1,
    number: 84,
    title: 'Design: Change the website theme',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/issues/84',
    labels: [{ name: 'design' }],
  },
  {
    id: 2,
    number: 91,
    title: 'A pull request that must be filtered out',
    html_url: 'https://github.com/leoncheng57/leoncheng57.github.io/pull/91',
    pull_request: {},
    labels: [],
  },
]

function mockIssuesFetch(response: Partial<Response>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleIssues,
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

  it('lists open issues from GitHub and filters out pull requests', async () => {
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
    expect(
      screen.queryByText('A pull request that must be filtered out')
    ).not.toBeInTheDocument()
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
