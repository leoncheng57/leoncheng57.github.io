import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AutomaticFoodLoggerPwa from './AutomaticFoodLoggerPwa'

function renderPwa() {
  return render(
    <MemoryRouter>
      <AutomaticFoodLoggerPwa />
    </MemoryRouter>,
  )
}

describe('AutomaticFoodLoggerPwa', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.style.overflow = ''
  })

  it('adds the manifest and Apple meta tags while mounted', () => {
    const { unmount } = renderPwa()

    expect(document.head.querySelector('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/automatic-food-logger/manifest.webmanifest',
    )
    expect(document.head.querySelector('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
      'content',
      'Food Logger',
    )
    expect(document.head.querySelector('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      '/automatic-food-logger/icon-192.png',
    )

    unmount()
    expect(document.head.querySelector('link[rel="manifest"]')).toBeNull()
  })

  it('opens install help that links to the setup guide', () => {
    renderPwa()

    fireEvent.click(screen.getByRole('button', { name: 'Install' }))
    expect(screen.getByRole('link', { name: 'See the full illustrated guide' })).toHaveAttribute(
      'href',
      '/automatic-food-logger/setup',
    )
  })

  it('hides the install button inside the installed app', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    renderPwa()

    expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument()
  })
})
