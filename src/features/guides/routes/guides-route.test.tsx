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
    expect(screen.getByText(/6 chapters/)).toBeInTheDocument()
    expect(screen.getAllByText(/updated 2026-/).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /read guide/ })[0]).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/guides\//)
    )

    // The card previews the first chapters without listing all of them.
    expect(screen.getByText('Plan the work and set up workers')).toBeInTheDocument()
    expect(screen.getByText(/\+3 more/)).toBeInTheDocument()
  })

  it('redirects the retired agent-dashboard guide to the watch-the-run chapter', () => {
    render(
      <MemoryRouter initialEntries={['/guides/agent-dashboard']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Watch the run: a status protocol and a live board/,
      })
    ).toBeInTheDocument()
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

  it('marks the guides section as beta', () => {
    render(
      <MemoryRouter initialEntries={['/guides']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('BETA')).toBeInTheDocument()
  })
})

describe('guide site chrome', () => {
  it('replaces the main site navigation with just the theme pill', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    // The shared TopNav renders a "Repo pages" control; a guide must not use it.
    expect(screen.queryByRole('button', { name: 'Repo pages' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'All guides' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Main site' })).not.toBeInTheDocument()

    const pill = screen.getByRole('group', { name: 'Color theme' })
    expect(within(pill).getByRole('button', { name: 'Light' })).toBeInTheDocument()
    expect(within(pill).getByRole('button', { name: 'Dark' })).toBeInTheDocument()
  })

  it('marks every guide page as beta in the masthead', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('BETA')).toBeInTheDocument()
    unmount()

    // Chapter pages share the masthead, so the badge follows them.
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/configure-autonomy`]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('BETA')).toBeInTheDocument()
  })

  it('switches between light and dark themes via the pill', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    const pill = screen.getByRole('group', { name: 'Color theme' })
    const lightOption = within(pill).getByRole('button', { name: 'Light' })
    const darkOption = within(pill).getByRole('button', { name: 'Dark' })
    const themedRegion = document.querySelector('[data-theme]')

    expect(themedRegion?.getAttribute('data-theme')).toMatch(/^(light|dark)$/)

    await user.click(darkOption)
    expect(darkOption).toHaveAttribute('aria-pressed', 'true')
    expect(lightOption).toHaveAttribute('aria-pressed', 'false')
    expect(document.querySelector('[data-theme]')).toHaveAttribute('data-theme', 'dark')

    await user.click(lightOption)
    expect(lightOption).toHaveAttribute('aria-pressed', 'true')
    expect(darkOption).toHaveAttribute('aria-pressed', 'false')
    expect(document.querySelector('[data-theme]')).toHaveAttribute('data-theme', 'light')
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

    // The landing page is intro + diagram + contents; detail lives in chapters.
    expect(
      screen.getByText(/A procedure for running several coding agents at once/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'What you get' })).not.toBeInTheDocument()

    const contents = screen.getByRole('navigation', { name: 'Guide contents' })
    expect(within(contents).getByRole('link', { name: /Plan the work and set up workers/ })).toHaveAttribute(
      'href',
      `${GUIDE_PATH}/plan-and-set-up`
    )
    expect(
      within(contents).getByRole('link', { name: /Reference: contract template/ })
    ).toHaveAttribute('href', `${GUIDE_PATH}/reference`)

    // Chapters 1-3 are grouped separately from the rest.
    expect(within(contents).getByText('The Procedure')).toBeInTheDocument()
    expect(within(contents).getByText('Beyond the Basics')).toBeInTheDocument()
    expect(within(contents).getByText('Watcher Tool')).toBeInTheDocument()
    expect(within(contents).getByText('Reference')).toBeInTheDocument()
  })

  it('renders the manager/worker ascii diagram on the overview', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText((content) => content.includes('manager') && content.includes('worker'), {
      selector: 'pre code',
    })).toBeInTheDocument()
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
  it('renders chapter content with sidebar navigation and a pager', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/configure-autonomy`]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Configure worker autonomy' })
    ).toBeInTheDocument()

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    // The chapter list starts collapsed (mobile-first), so expand it.
    await user.click(within(sidebar).getByRole('button', { name: /Chapters/ }))
    const activeLink = within(sidebar).getByRole('link', { name: /Configure worker autonomy/ })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(within(sidebar).getByText('The Procedure')).toBeInTheDocument()
    expect(within(sidebar).getByText('Beyond the Basics')).toBeInTheDocument()
    expect(within(sidebar).getByText('Watcher Tool')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      `${GUIDE_PATH}/plan-and-set-up`
    )
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      `${GUIDE_PATH}/run-and-review`
    )
  })

  it('renders chapter tables inside the article body', () => {
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/configure-autonomy`]}>
        <App />
      </MemoryRouter>
    )

    const tables = screen.getAllByRole('table')
    expect(tables.length).toBeGreaterThan(0)
    expect(within(tables[0]).getAllByRole('row').length).toBeGreaterThan(1)
  })

  it('renders the three-wave split diagram in the first chapter', () => {
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/plan-and-set-up`]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByText(
        (content) =>
          content.includes('wave 1') && content.includes('wave 2') && content.includes('wave 3'),
        { selector: 'pre code' }
      )
    ).toBeInTheDocument()
  })

  it('navigates between chapters from the sidebar', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/plan-and-set-up`]}>
        <App />
      </MemoryRouter>
    )

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    await user.click(within(sidebar).getByRole('button', { name: /Chapters/ }))
    await user.click(within(sidebar).getByRole('link', { name: /Workers versus subagents/ }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Workers versus subagents' })
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

  it('exposes a collapsible chapter list behind a toggle button', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/configure-autonomy`]}>
        <App />
      </MemoryRouter>
    )

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    const toggle = within(sidebar).getByRole('button', { name: /Chapters/ })

    // Collapsed by default; the button controls the chapter list container.
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const listId = toggle.getAttribute('aria-controls')
    expect(listId).toBeTruthy()
    expect(document.getElementById(listId!)).toBeInTheDocument()
    expect(
      within(sidebar).queryByRole('link', { name: /Configure worker autonomy/ })
    ).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(sidebar).getByRole('link', { name: /Configure worker autonomy/ })
    ).toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(
      within(sidebar).queryByRole('link', { name: /Configure worker autonomy/ })
    ).not.toBeInTheDocument()
  })

  it('closes the chapter list again after navigating to another chapter', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/plan-and-set-up`]}>
        <App />
      </MemoryRouter>
    )

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    const toggle = within(sidebar).getByRole('button', { name: /Chapters/ })

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(within(sidebar).getByRole('link', { name: /Configure worker autonomy/ }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Configure worker autonomy' })
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('navigation', { name: 'Guide chapters' })).getByRole('button', {
        name: /Chapters/,
      })
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks beta chapters with a pill in the header and a sidebar marker', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/watch-the-run`]}>
        <App />
      </MemoryRouter>
    )

    const heading = screen.getByRole('heading', { level: 1, name: /Watch the run/ })
    expect(within(heading).getByText('Beta')).toBeInTheDocument()

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    await user.click(within(sidebar).getByRole('button', { name: /Chapters/ }))
    const betaLink = within(sidebar).getByRole('link', { name: /Watch the run/ })
    expect(within(betaLink).getByText('beta')).toBeInTheDocument()
  })

  it('does not mark stable chapters as beta', () => {
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/configure-autonomy`]}>
        <App />
      </MemoryRouter>
    )

    const heading = screen.getByRole('heading', { level: 1, name: 'Configure worker autonomy' })
    expect(within(heading).queryByText('Beta')).not.toBeInTheDocument()
  })
})
