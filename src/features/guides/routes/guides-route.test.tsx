import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

const GUIDE_TITLE = 'Running Parallel Coding Agents with a Manager and Workers'
const GUIDE_PATH = '/guides/manager-worker-parallel-agents'

describe('guides index route', () => {
  it('lists published guides as cards with chapter previews', () => {
    render(
      <MemoryRouter initialEntries={['/guides']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Guides' })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: GUIDE_TITLE })).toHaveAttribute('href', GUIDE_PATH)
    expect(screen.getByText(/7 chapters/)).toBeInTheDocument()
    expect(screen.getByText(/updated 2026-/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /read guide/ })).toHaveAttribute('href', GUIDE_PATH)

    // The card previews the first chapters without listing all of them.
    expect(screen.getByText('Plan the work and set up workers')).toBeInTheDocument()
    expect(screen.getByText(/\+4 more/)).toBeInTheDocument()
  })

  it('stays on the main site chrome, like the apps index', () => {
    render(
      <MemoryRouter initialEntries={['/guides']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: 'Repo pages' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('navigation', { name: 'Guides navigation' })).not.toBeInTheDocument()
  })
})

describe('guide site chrome', () => {
  it('replaces the main site navigation on a guide page', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    // The shared TopNav renders a "Repo pages" control; a guide must not use it.
    expect(screen.queryByRole('button', { name: 'Repo pages' })).not.toBeInTheDocument()

    const guidesNav = screen.getByRole('navigation', { name: 'Guides navigation' })
    expect(within(guidesNav).getByRole('link', { name: 'All guides' })).toHaveAttribute(
      'href',
      '/guides'
    )
    expect(within(guidesNav).getByRole('link', { name: 'Main site' })).toHaveAttribute('href', '/')
  })

  it('toggles between light and dark themes', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('button', { name: /Switch to (light|dark) theme/ })
    const initialLabel = toggle.getAttribute('aria-label')
    const themedRegion = document.querySelector('[data-theme]')
    const initialTheme = themedRegion?.getAttribute('data-theme')

    expect(initialTheme).toMatch(/^(light|dark)$/)

    await user.click(toggle)

    expect(
      screen.getByRole('button', { name: /Switch to (light|dark) theme/ }).getAttribute('aria-label')
    ).not.toBe(initialLabel)
    expect(document.querySelector('[data-theme]')?.getAttribute('data-theme')).not.toBe(initialTheme)
  })
})

describe('guide overview route', () => {
  it('renders the guide landing page as a hero with chapter cards', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: GUIDE_TITLE })).toBeInTheDocument()
    expect(screen.getByText(`~/guides/manager-worker-parallel-agents`)).toBeInTheDocument()
    expect(screen.getByText(/Last reviewed 2026-/)).toBeInTheDocument()
    expect(screen.getByText(/min read/)).toBeInTheDocument()

    // Hero CTAs
    expect(screen.getByRole('link', { name: /Start reading/ })).toHaveAttribute(
      'href',
      `${GUIDE_PATH}/plan-and-set-up`
    )
    expect(screen.getByRole('link', { name: 'Contents' })).toHaveAttribute(
      'href',
      '#guide-contents'
    )

    // Overview sections are rendered as numbered cards, not one prose column.
    expect(screen.getByRole('heading', { level: 2, name: 'What you get' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Concepts' })).toBeInTheDocument()

    const contents = screen.getByRole('navigation', { name: 'Guide contents' })
    expect(within(contents).getByRole('link', { name: /Plan the work and set up workers/ })).toHaveAttribute(
      'href',
      `${GUIDE_PATH}/plan-and-set-up`
    )
    expect(
      within(contents).getByRole('link', { name: /Case study: parallel remediation/ })
    ).toHaveAttribute('href', `${GUIDE_PATH}/case-study-parallel-remediation`)
  })

  it('renders the overview diagram from the guides asset path', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('img', { name: /One manager session coordinates/ })).toHaveAttribute(
      'src',
      '/guides/manager-worker-agents/orchestration-map.svg'
    )
  })

  it('renders a not found state for unknown guides', () => {
    render(
      <MemoryRouter initialEntries={['/guides/missing-guide']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Guide not found' })).toBeInTheDocument()
  })
})

describe('guide chapter route', () => {
  it('renders chapter content with sidebar navigation and a pager', () => {
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/configure-autonomy`]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Configure worker autonomy' })
    ).toBeInTheDocument()

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    const activeLink = within(sidebar).getByRole('link', { name: /Configure worker autonomy/ })
    expect(activeLink).toHaveAttribute('aria-current', 'page')

    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      `${GUIDE_PATH}/plan-and-set-up`
    )
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      `${GUIDE_PATH}/run-and-review`
    )
  })

  it('renders the case study chapter with its severity table', () => {
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/case-study-parallel-remediation`]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Case study: parallel remediation after a manager review',
      })
    ).toBeInTheDocument()

    const tables = screen.getAllByRole('table')
    expect(tables.length).toBeGreaterThan(0)
    expect(within(tables[0]).getAllByRole('row').length).toBeGreaterThan(1)
  })

  it('navigates between chapters from the sidebar', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/plan-and-set-up`]}>
        <App />
      </MemoryRouter>
    )

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    await user.click(within(sidebar).getByRole('link', { name: /Troubleshooting and capacity/ }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Troubleshooting and capacity' })
    ).toBeInTheDocument()
  })

  it('renders a not found state for unknown chapters', () => {
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/missing-chapter`]}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Chapter not found' })).toBeInTheDocument()
  })
})
