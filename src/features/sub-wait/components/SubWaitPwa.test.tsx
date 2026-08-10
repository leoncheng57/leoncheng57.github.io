import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SubWaitPwa, { shouldShowIosInstallHint } from './SubWaitPwa'

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
    const { unmount } = render(<SubWaitPwa />)

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

  it('shows the iOS install hint on iPhones and dismisses persistently', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    })

    render(<SubWaitPwa />)
    expect(
      screen.getByText('Put Sub-Wait on your home screen'),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss install instructions' }),
    )
    expect(
      screen.queryByText('Put Sub-Wait on your home screen'),
    ).not.toBeInTheDocument()
    expect(
      window.localStorage.getItem('sub-wait-install-hint-dismissed'),
    ).toBe('true')
  })

  it('does not show the hint outside iOS Safari', () => {
    render(<SubWaitPwa />)
    expect(
      screen.queryByText('Put Sub-Wait on your home screen'),
    ).not.toBeInTheDocument()
  })

  describe('shouldShowIosInstallHint', () => {
    it('requires an iOS device, browser mode, and no prior dismissal', () => {
      const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
      expect(shouldShowIosInstallHint(iphone, false, false)).toBe(true)
      expect(shouldShowIosInstallHint(iphone, true, false)).toBe(false)
      expect(shouldShowIosInstallHint(iphone, false, true)).toBe(false)
      expect(shouldShowIosInstallHint('Mozilla/5.0 (Macintosh)', false, false)).toBe(
        false,
      )
    })
  })
})
