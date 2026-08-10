import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import WorkoutLabPwa, { shouldShowIosInstallHint } from './WorkoutLabPwa'

const originalUserAgent = navigator.userAgent

describe('WorkoutLabPwa', () => {
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
    const { unmount } = render(<WorkoutLabPwa />)

    expect(
      document.head.querySelector('link[rel="manifest"]')
    ).toHaveAttribute('href', '/workout-lab/manifest.webmanifest')
    expect(document.head.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#4d7c0f'
    )
    expect(
      document.head.querySelector('link[rel="apple-touch-icon"]')
    ).toHaveAttribute('href', '/workout-lab/icon-192.png')

    unmount()
    expect(document.head.querySelector('[data-workout-lab]')).toBeNull()
  })

  it('only recommends manual installation on non-standalone iOS', () => {
    expect(shouldShowIosInstallHint('Mozilla/5.0 (iPhone)', false, false)).toBe(
      true
    )
    expect(shouldShowIosInstallHint('Mozilla/5.0 (iPhone)', true, false)).toBe(
      false
    )
    expect(shouldShowIosInstallHint('Mozilla/5.0 (Android)', false, false)).toBe(
      false
    )
    expect(shouldShowIosInstallHint('Mozilla/5.0 (iPad)', false, true)).toBe(
      false
    )
  })

  it('dismisses and remembers the iOS installation hint', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (iPhone)',
    })

    render(<WorkoutLabPwa />)
    expect(screen.getByLabelText('Install Workout Lab')).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss install instructions' })
    )

    expect(screen.queryByLabelText('Install Workout Lab')).not.toBeInTheDocument()
    expect(
      window.localStorage.getItem('workout-lab-install-hint-dismissed')
    ).toBe('true')
  })
})
