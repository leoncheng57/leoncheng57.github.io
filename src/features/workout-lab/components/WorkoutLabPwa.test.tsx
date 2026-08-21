import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import WorkoutLabPwa, { shouldShowIosInstallHint } from './WorkoutLabPwa'

const originalUserAgent = navigator.userAgent

function renderPwa() {
  return render(
    <MemoryRouter>
      <WorkoutLabPwa />
    </MemoryRouter>
  )
}

function useIosUserAgent(): void {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: 'Mozilla/5.0 (iPhone)',
  })
}

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
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: originalUserAgent,
    })
  })

  it('injects route-specific PWA metadata and removes it on unmount', () => {
    const { unmount } = renderPwa()

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
    expect(shouldShowIosInstallHint('Mozilla/5.0 (iPhone)', false)).toBe(true)
    expect(shouldShowIosInstallHint('Mozilla/5.0 (iPhone)', true)).toBe(false)
    expect(shouldShowIosInstallHint('Mozilla/5.0 (Android)', false)).toBe(false)
  })

  it('shows a notification dot by default', () => {
    useIosUserAgent()
    renderPwa()

    expect(
      screen.getByRole('button', { name: 'Install Workout Lab on your phone' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('install-reminder-dot')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  it('acknowledges the reminder, removes the dot, and persists the choice', () => {
    useIosUserAgent()
    renderPwa()

    fireEvent.click(
      screen.getByRole('button', { name: 'Install Workout Lab on your phone' })
    )

    expect(screen.queryByTestId('install-reminder-dot')).not.toBeInTheDocument()
    expect(
      window.localStorage.getItem('workout-lab:pwa-install-reminder-ack:v1')
    ).toBe('true')
  })

  it('restores an acknowledged reminder without the dot', () => {
    useIosUserAgent()
    window.localStorage.setItem('workout-lab:pwa-install-reminder-ack:v1', 'true')
    renderPwa()

    expect(
      screen.getByRole('button', { name: 'Install Workout Lab on your phone' })
    ).toBeInTheDocument()
    expect(screen.queryByTestId('install-reminder-dot')).not.toBeInTheDocument()
  })

  it('remains interactive when local storage is blocked', () => {
    useIosUserAgent()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('blocked')
        },
      },
    })
    renderPwa()

    fireEvent.click(
      screen.getByRole('button', { name: 'Install Workout Lab on your phone' })
    )

    expect(screen.queryByTestId('install-reminder-dot')).not.toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Install Workout Lab' })
    ).toBeInTheDocument()
  })

  it('opens accessible installation instructions and restores trigger focus', () => {
    useIosUserAgent()
    renderPwa()
    const trigger = screen.getByRole('button', {
      name: 'Install Workout Lab on your phone',
    })

    fireEvent.click(trigger)

    expect(
      screen.getByRole('dialog', { name: 'Install Workout Lab' })
    ).toHaveAttribute('aria-modal', 'true')
    expect(
      screen.getByRole('link', { name: 'See the full illustrated guide' })
    ).toHaveAttribute('href', '/workout-lab/guide')
    const close = screen.getByRole('button', { name: 'Close installation help' })
    expect(close).toHaveFocus()

    fireEvent.click(close)
    expect(trigger).toHaveFocus()
  })

  it('suppresses the install reminder in standalone mode', () => {
    useIosUserAgent()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true }),
    })
    renderPwa()

    expect(
      screen.queryByRole('button', { name: 'Install Workout Lab on your phone' })
    ).not.toBeInTheDocument()
  })
})
