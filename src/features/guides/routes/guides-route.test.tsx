import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

const GUIDE_TITLE = 'Running Parallel Coding Agents with a Manager and Workers'
const GUIDE_PATH = '/guides/manager-worker-parallel-agents'
const OPENHANDS_GUIDE_TITLE = 'Building a Custom Coding-Agent IDE with OpenHands'
const OPENHANDS_GUIDE_PATH = '/guides/custom-coding-agent-ide-with-openhands'

const CHAPTER_TITLES = [
  'Overview',
  'Run simulator',
  'Plan the work and set up workers',
  'Configure worker autonomy',
  'Launch, review, and land the work',
  'Workers versus subagents',
  'Watch the run: a status protocol and a live board',
  'Reference: contract template and checklists',
]

describe('legacy guides index', () => {
  it('preserves the retired agent-dashboard redirect', () => {
    render(<MemoryRouter initialEntries={['/guides/agent-dashboard']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: GUIDE_TITLE })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Watch the run: a status protocol and a live board/ })).toBeInTheDocument()
  })

  it('redirects to the combined blog while retaining guide destinations', () => {
    render(<MemoryRouter initialEntries={['/guides']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: GUIDE_TITLE })).toHaveAttribute('href', GUIDE_PATH)
    expect(screen.getByRole('link', { name: OPENHANDS_GUIDE_TITLE })).toHaveAttribute('href', OPENHANDS_GUIDE_PATH)
    expect(screen.getByRole('link', { name: 'cmux personal config' })).toHaveAttribute('href', '/guides/cmux-personal-config')
    expect(screen.getByRole('link', { name: 'opencode personal config' })).toHaveAttribute('href', '/guides/opencode-personal-config')
    expect(screen.getByRole('link', { name: 'OpenCode Remote Control' })).toHaveAttribute('href', '/guides/opencode-remote-control')
    expect(screen.getByRole('link', { name: 'Agent Skills' })).toHaveAttribute('href', 'https://leoncheng.dev/agent-skills/')
    expect(screen.queryByRole('link', { name: 'Guides' })).not.toBeInTheDocument()
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

    // Legacy chapter URLs redirect to the one-pager, which shares the masthead.
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

describe('guide one-pager', () => {
  it('renders the custom OpenHands IDE guide as a seven-chapter one-pager', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[OPENHANDS_GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: OPENHANDS_GUIDE_TITLE })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: /narrated scripted preview of the custom OpenHands IDE/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: /independently explorable live app UI/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load live simulator' })).toBeInTheDocument()
    expect(screen.queryByTitle('Customizable DCA — live interactive demo')).not.toBeInTheDocument()
    // Both screen recordings are embedded from markdown via the component
    // registry, and both are redacted at encode time.
    expect(
      screen.getByLabelText('A screen recording of the custom OpenHands IDE running in a desktop browser.')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('A screen recording of the custom OpenHands IDE running in a mobile browser.')
    ).toBeInTheDocument()
    // The walkthrough must be unmistakably a mock-up rather than a recording.
    expect(screen.getByText('Simulation')).toBeInTheDocument()
    // The tools chapter is a card grid embedded through the same registry.
    expect(
      screen.getByRole('list', { name: /tools built on top of the agent server/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'How it was built, layer by layer' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Why not just use Claude Code or OpenCode?',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Downsides and lessons',
      })
    ).toBeInTheDocument()

    const chapters = screen.getByRole('navigation', { name: 'Guide chapters' })
    await user.click(within(chapters).getByRole('button', { name: /Chapters/ }))
    expect(within(chapters).getAllByRole('link')).toHaveLength(7)

    // The comparison leads: readers decide whether to build this at all before
    // reading how it was built. Chapter slugs are prefix-independent, so the
    // anchors are stable even though the file numbering changed.
    expect(
      within(chapters)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    ).toEqual([
      '#vs-claude-code-and-opencode',
      '#why-build-a-control-plane',
      '#how-it-was-built',
      '#the-tools-i-built',
      '#manager-runs-and-dogfooding',
      '#supervising-from-a-phone',
      '#downsides-and-lessons',
    ])

    // "Start reading" follows the reorder automatically.
    expect(screen.getByRole('link', { name: /Start reading/ })).toHaveAttribute(
      'href',
      '#vs-claude-code-and-opencode'
    )
  })

  it('renders the hero with exactly two CTAs: start reading and the simulator', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: GUIDE_TITLE })).toBeInTheDocument()
    expect(screen.getByText(`~/guides/manager-worker-parallel-agents`)).toBeInTheDocument()
    expect(screen.getByText(/Last reviewed 2026-/)).toBeInTheDocument()
    expect(screen.getByText(/min read/)).toBeInTheDocument()

    // Start reading scrolls to the first chapter anchor on the same page.
    expect(screen.getByRole('link', { name: /Start reading/ })).toHaveAttribute(
      'href',
      '#overview'
    )
    // The simulator CTA carries the waving hand and anchors to its chapter.
    expect(screen.getByRole('link', { name: /Open the simulator/ })).toHaveAttribute(
      'href',
      '#simulator'
    )

    // The Contents button and chapter-card contents section are gone.
    expect(screen.queryByRole('link', { name: 'Contents' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Guide contents' })
    ).not.toBeInTheDocument()
  })

  it('renders the overview intro and every chapter on a single page', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByText(/A procedure for running several coding agents at once/)
    ).toBeInTheDocument()

    for (const title of CHAPTER_TITLES) {
      expect(screen.getByRole('heading', { level: 2, name: new RegExp(title.slice(0, 24)) })).toBeInTheDocument()
    }

    // Each chapter section is anchored by its legacy slug for deep links.
    expect(document.getElementById('plan-and-set-up')).toBeInTheDocument()
    expect(document.getElementById('watch-the-run')).toBeInTheDocument()
    expect(document.getElementById('reference')).toBeInTheDocument()
  })

  it('renders the manager/worker ascii diagram and chapter diagrams together', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getAllByText((content) => content.includes('manager') && content.includes('worker'), {
        selector: 'pre code',
      }).length
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(
        (content) =>
          content.includes('wave 1') && content.includes('wave 2') && content.includes('wave 3'),
        { selector: 'pre code' }
      )
    ).toBeInTheDocument()
  })

  it('renders the status example as a file while preserving real terminal blocks', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    const statusExample = document.querySelector('code[data-kind="file"]')!
    expect(statusExample).toHaveTextContent('"task": "agent-dashboard"')
    expect(statusExample).toHaveAttribute('data-kind', 'file')
    expect(statusExample).toHaveAttribute('data-filename', '.agent-status.json')
    expect(within(statusExample).getByText('.agent-status.json')).toBeInTheDocument()

    const cliInvocation = screen.getByText((content) => content.includes('cli.mjs --once'), {
      selector: 'code',
    })
    const boardOutput = screen.getByText((content) => content.includes('CHILD') && content.includes('PHASE'), {
      selector: 'code',
    })
    expect(cliInvocation).not.toHaveAttribute('data-kind')
    expect(boardOutput).not.toHaveAttribute('data-kind')
  })

  it('renders the phase lifecycle SVG with meaningful alternative text', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('img', {
        name: /six normal phases connect from assigned through working.*blocked side state/i,
      })
    ).toHaveAttribute(
      'src',
      '/guides/manager-worker-parallel-agents/phase-lifecycle.svg'
    )
  })

  it('renders chapter tables inside the one-pager body', () => {
    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    const tables = screen.getAllByRole('table')
    expect(tables.length).toBeGreaterThan(0)
    expect(within(tables[0]).getAllByRole('row').length).toBeGreaterThan(1)
  })

  it('exposes a collapsible chapter list of in-page anchors', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
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
    ).toHaveAttribute('href', '#configure-autonomy')
    expect(within(sidebar).getByText('Start Here')).toBeInTheDocument()
    expect(within(sidebar).getByText('The Procedure')).toBeInTheDocument()
    expect(within(sidebar).getByText('Beyond the Basics')).toBeInTheDocument()
    expect(within(sidebar).getByText('Watcher Tool')).toBeInTheDocument()

    // Choosing a chapter collapses the list again (mobile behavior).
    await user.click(within(sidebar).getByRole('link', { name: /Configure worker autonomy/ }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks beta chapters with a pill in the section header and a sidebar marker', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[GUIDE_PATH]}>
        <App />
      </MemoryRouter>
    )

    const heading = screen.getByRole('heading', { level: 2, name: /Watch the run/ })
    expect(within(heading).getByText('Beta')).toBeInTheDocument()

    const stableHeading = screen.getByRole('heading', {
      level: 2,
      name: /Configure worker autonomy/,
    })
    expect(within(stableHeading).queryByText('Beta')).not.toBeInTheDocument()

    const sidebar = screen.getByRole('navigation', { name: 'Guide chapters' })
    await user.click(within(sidebar).getByRole('button', { name: /Chapters/ }))
    const betaLink = within(sidebar).getByRole('link', { name: /Watch the run/ })
    expect(within(betaLink).getByText('beta')).toBeInTheDocument()
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

describe('legacy guide chapter urls', () => {
  it('redirects chapter urls to the one-pager anchor', () => {
    render(
      <MemoryRouter initialEntries={[`${GUIDE_PATH}/configure-autonomy`]}>
        <App />
      </MemoryRouter>
    )

    // Lands on the one-pager with the chapter present as an anchored section.
    expect(screen.getByRole('heading', { level: 1, name: GUIDE_TITLE })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Configure worker autonomy' })
    ).toBeInTheDocument()
    expect(document.getElementById('configure-autonomy')).toBeInTheDocument()
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
