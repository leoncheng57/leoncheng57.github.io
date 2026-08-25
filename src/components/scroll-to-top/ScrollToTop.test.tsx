import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ScrollToTop from './ScrollToTop'

function renderNavigation(): ReturnType<typeof vi.fn> {
  const scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)

  render(
    <MemoryRouter initialEntries={['/first']}>
      <ScrollToTop />
      <Link to="/second">Next page</Link>
      <Link to="/first#section">Page section</Link>
      <Link to="/second#anchor">Other page section</Link>
    </MemoryRouter>
  )

  return scrollTo
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ScrollToTop', () => {
  it('resets the window scroll position when the pathname changes', async () => {
    const scrollTo = renderNavigation()
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1))
    scrollTo.mockClear()

    fireEvent.click(screen.getByRole('link', { name: 'Next page' }))

    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: 'instant',
      })
    )
  })

  it('does not reset the window scroll position for hash-only navigation', async () => {
    const scrollTo = renderNavigation()
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1))
    scrollTo.mockClear()

    fireEvent.click(screen.getByRole('link', { name: 'Page section' }))

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('leaves the window scroll alone when navigating to an anchor on another page', async () => {
    const scrollTo = renderNavigation()
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1))
    scrollTo.mockClear()

    fireEvent.click(screen.getByRole('link', { name: 'Other page section' }))

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls the anchor target into view when arriving with a hash', async () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    const scrollIntoView = vi.spyOn(
      window.HTMLElement.prototype,
      'scrollIntoView'
    )

    render(
      <MemoryRouter initialEntries={['/first#section']}>
        <ScrollToTop />
        <section id="section">Anchor target</section>
      </MemoryRouter>
    )

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
