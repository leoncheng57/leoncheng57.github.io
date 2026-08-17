import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Link } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RouteMetadata, {
  getRouteContentGroup,
  getRouteTitle,
} from './RouteMetadata'

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('getRouteTitle', () => {
  it.each([
    ['/', "Leon's Website"],
    ['/blog', "Blog | Leon's Website"],
    ['/blog/hello-blog', "Hello Blog | Leon's Website"],
    ['/blog/missing-post', "Post Not Found | Leon's Website"],
    ['/guides', "Guides | Leon's Website"],
    [
      '/guides/manager-worker-parallel-agents',
      "Running Parallel Coding Agents with a Manager and Workers | Guides | Leon's Website",
    ],
    ['/guides/missing-guide', "Guide Not Found | Leon's Website"],
    [
      '/guides/cmux-personal-config',
      "cmux personal config | Guides | Leon's Website",
    ],
    [
      '/guides/opencode-personal-config',
      "opencode personal config | Guides | Leon's Website",
    ],
    ['/apps', "Apps | Leon's Website"],
    ['/apps/whoops-hoops/privacy', 'Privacy Policy | Whoops Hoops'],
    ['/repo/alpha-projs', "Alpha Projects | Repo | Leon's Website"],
    [
      '/repo/alpha-projs/gmail-reader',
      "Gmail Reader | Alpha Projects | Repo | Leon's Website",
    ],
    ['/repo/ci', "CI Checks | Repo | Leon's Website"],
    [
      '/repo/design-components',
      "Design Components | Repo | Leon's Website",
    ],
    [
      '/repo/google-analytics',
      "Google Analytics | Repo | Leon's Website",
    ],
    ['/workout-lab/', 'Workout Lab'],
    ['/workout-lab/exercises', 'Exercises | Workout Lab'],
    ['/sub-wait/', 'Sub-Wait'],
    ['/sub-wait/map', 'Map | Sub-Wait'],
    ['/sub-wait/station/F16', 'East Broadway | Sub-Wait'],
    [
      '/sub-wait/station/F16/N',
      'East Broadway - Uptown & Queens | Sub-Wait',
    ],
    ['/sub-wait/station/unknown', 'Station Not Found | Sub-Wait'],
    ['/tuzi', 'Tuzi'],
    ['/tuzi/how-ranking-works', 'How Ranking Works | Tuzi'],
  ])('returns a meaningful title for %s', (pathname, expected) => {
    expect(getRouteTitle(pathname)).toBe(expected)
  })
})

describe('getRouteContentGroup', () => {
  it.each([
    ['/', 'home'],
    ['/blog', 'blog'],
    ['/blog/hello-blog', 'blog'],
    ['/guides', 'guides'],
    ['/guides/cmux-personal-config', 'guides'],
    ['/guides/opencode-personal-config', 'guides'],
    ['/apps', 'apps-index'],
    ['/apps/whoops-hoops/privacy', 'whoops-hoops'],
    ['/apps/whoops-hoops/support', 'whoops-hoops'],
    ['/repo', 'repo'],
    ['/repo/google-analytics', 'repo'],
    ['/development/previews', 'repo'],
    ['/sub-wait/', 'sub-wait'],
    ['/sub-wait/station/F16/N', 'sub-wait'],
    ['/workout-lab/exercises', 'workout-lab'],
    ['/tuzi/how-ranking-works', 'tuzi'],
    ['/georgies-board-game-nights', 'game-nights'],
    ['/game-nights', 'game-nights'],
    ['/unknown-path', 'other'],
  ])('groups %s as %s', (pathname, expected) => {
    expect(getRouteContentGroup(pathname)).toBe(expected)
  })

  it('does not group an unrelated path that merely shares a prefix', () => {
    expect(getRouteContentGroup('/sub-waiting')).toBe('other')
  })
})

describe('RouteMetadata', () => {
  it('sets titles, tracks initial and client-side pageviews, and restores the title', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('gtag', gtag)
    document.title = 'Original title'
    window.history.replaceState({}, '', '/blog')

    const view = render(
      <BrowserRouter>
        <RouteMetadata />
        <Link to="/sub-wait/station/F16/N">Open station</Link>
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(document.title).toBe("Blog | Leon's Website")
      expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
        content_group: 'blog',
        page_location: 'http://localhost:3000/blog',
        page_path: '/blog',
        page_title: "Blog | Leon's Website",
      })
    })

    await userEvent.click(screen.getByRole('link', { name: 'Open station' }))

    await waitFor(() => {
      expect(document.title).toBe(
        'East Broadway - Uptown & Queens | Sub-Wait',
      )
      expect(gtag).toHaveBeenLastCalledWith('event', 'page_view', {
        content_group: 'sub-wait',
        page_location: 'http://localhost:3000/sub-wait/station/F16/N',
        page_path: '/sub-wait/station/F16/N',
        page_title: 'East Broadway - Uptown & Queens | Sub-Wait',
      })
    })
    expect(gtag).toHaveBeenCalledTimes(2)

    view.unmount()
    expect(document.title).toBe('Original title')
  })

  it('does not fail when gtag is unavailable', async () => {
    document.title = 'Original title'
    window.history.replaceState({}, '', '/tuzi')

    render(
      <BrowserRouter>
        <RouteMetadata />
      </BrowserRouter>,
    )

    await waitFor(() => expect(document.title).toBe('Tuzi'))
  })
})
