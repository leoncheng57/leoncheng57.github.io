import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SubWaitPwa, { shouldShowInstallHint } from './SubWaitPwa'

const originalUserAgent = navigator.userAgent

describe('SubWaitPwa', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    })
  })

  afterEach(() => {
    window.localStorage.clear()
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: originalUserAgent,
    })
  })

  it('injects route-specific PWA metadata and removes it on unmount', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/sub-wait/']}>
        <SubWaitPwa />
      </MemoryRouter>,
    )

    expect(
      document.head.querySelector('link[data-sub-wait="manifest"]'),
    ).toHaveAttribute('href', '/sub-wait/manifest.webmanifest')
    expect(
      document.head.querySelector('meta[data-sub-wait="theme-color"]'),
    ).toHaveAttribute('content', '#111111')
    expect(
      document.head.querySelector('link[data-sub-wait="apple-icon"]'),
    ).toHaveAttribute('href', '/sub-wait/icon-v2-192.png')

    unmount()
    expect(
      document.head.querySelector('link[data-sub-wait="manifest"]'),
    ).toBeNull()
  })

  it.each([
    '/sub-wait/station/F16',
    '/sub-wait/station/F16/N',
  ])('uses the station manifest and title on %s', (route) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <SubWaitPwa />
      </MemoryRouter>,
    )

    expect(
      document.head.querySelector('link[data-sub-wait="manifest"]'),
    ).toHaveAttribute('href', '/sub-wait/manifests/station-F16.webmanifest')
    expect(
      document.head.querySelector('meta[data-sub-wait="apple-title"]'),
    ).toHaveAttribute('content', 'East Broadway')
  })

  it('collapses to a persistent icon and can be reopened', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    })

    render(
      <MemoryRouter initialEntries={['/sub-wait/']}>
        <SubWaitPwa />
      </MemoryRouter>,
    )
    expect(screen.getByText('Add Sub-Wait to your phone')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open installation guide/ })).toHaveAttribute(
      'href',
      '/sub-wait/install',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse install instructions' }),
    )
    expect(screen.queryByText('Add Sub-Wait to your phone')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open install instructions' }),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('sub-wait-install-hint-collapsed')).toBe(
      'true',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Open install instructions' }),
    )
    expect(screen.getByText('Add Sub-Wait to your phone')).toBeInTheDocument()
    expect(window.localStorage.getItem('sub-wait-install-hint-collapsed')).toBe(
      'false',
    )
  })

  it('uses the station name in the install reminder', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Linux; Android 14)',
    })

    render(
      <MemoryRouter initialEntries={['/sub-wait/station/F16/S']}>
        <SubWaitPwa />
      </MemoryRouter>,
    )

    expect(screen.getByText('Add East Broadway to your phone')).toBeInTheDocument()
  })

  it('shows on Android but not on desktop browsers', () => {
    expect(shouldShowInstallHint('Mozilla/5.0 (Linux; Android 14)', false)).toBe(
      true,
    )
    expect(shouldShowInstallHint('Mozilla/5.0 (Macintosh)', false)).toBe(false)
  })

  it('does not show in standalone mode', () => {
    expect(
      shouldShowInstallHint(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        true,
      ),
    ).toBe(false)
  })
})
