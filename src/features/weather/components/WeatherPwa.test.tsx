import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WeatherPwa, { shouldShowInstallHint } from './WeatherPwa'

const originalNavigator = {
  maxTouchPoints: navigator.maxTouchPoints,
  platform: navigator.platform,
  standalone: (navigator as Navigator & { standalone?: boolean }).standalone,
  userAgent: navigator.userAgent,
}

function setNavigator(value: {
  maxTouchPoints?: number
  platform?: string
  standalone?: boolean
  userAgent?: string
}): void {
  for (const [key, propertyValue] of Object.entries(value)) {
    Object.defineProperty(navigator, key, {
      configurable: true,
      value: propertyValue,
    })
  }
}

function renderPwa() {
  return render(
    <MemoryRouter>
      <div className="page">
        <WeatherPwa />
      </div>
    </MemoryRouter>,
  )
}

describe('WeatherPwa', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false }),
    )
    setNavigator({
      maxTouchPoints: 0,
      platform: 'iPhone',
      standalone: false,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    })
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.unstubAllGlobals()
    setNavigator(originalNavigator)
    document.body.style.overflow = ''
  })

  it('shows install controls in any browser and suppresses standalone mode', () => {
    expect(shouldShowInstallHint(false)).toBe(true)
    expect(shouldShowInstallHint(true)).toBe(false)

    setNavigator({
      platform: 'MacIntel',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    })
    renderPwa()
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()
  })

  it('manages modal focus, scrolling, Escape, backdrop, close, and restoration', () => {
    renderPwa()
    const trigger = screen.getByRole('button', {
      name: 'Install',
    })

    fireEvent.click(trigger)
    const close = screen.getByRole('button', { name: 'Close installation help' })
    const guide = screen.getByRole('link', {
      name: 'See the full illustrated guide',
    })
    expect(close).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    expect(guide).toHaveAttribute('href', '/weather/install')

    guide.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(close).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(guide).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')

    fireEvent.click(trigger)
    fireEvent.mouseDown(screen.getByTestId('install-help-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Close installation help' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('renders no install UI in standalone mode', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true }),
    )
    renderPwa()

    expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument()
  })
})
