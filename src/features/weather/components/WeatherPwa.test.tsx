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
    expect(
      screen.getByRole('button', { name: 'Expand install instructions' }),
    ).toBeInTheDocument()
  })

  it('starts collapsed, expands on demand, and persists either state', () => {
    const first = renderPwa()

    expect(
      screen.getByRole('button', { name: 'Expand install instructions' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Install on phone')).toBeInTheDocument()
    expect(screen.getByText('Add NYC Weather to your home screen')).toBeInTheDocument()
    expect(screen.queryByText('Get a full-screen forecast')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand install instructions' }),
    )

    expect(window.localStorage.getItem('nyc-weather-install-hint-collapsed')).toBe(
      'false',
    )
    expect(
      screen.getByText('Get a full-screen forecast from your home screen, no app store.'),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse install instructions' }),
    )
    expect(window.localStorage.getItem('nyc-weather-install-hint-collapsed')).toBe(
      'true',
    )
    first.unmount()

    renderPwa()
    expect(
      screen.getByRole('button', { name: 'Expand install instructions' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Get a full-screen forecast')).not.toBeInTheDocument()
  })

  it('offers Help and an internal More details link from the expanded hint', () => {
    renderPwa()
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand install instructions' }),
    )

    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'More details' })).toHaveAttribute(
      'href',
      '/weather/install',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(screen.getByText('Tap Share in Safari')).toBeInTheDocument()
  })

  it('manages modal focus, scrolling, Escape, backdrop, close, and restoration', () => {
    renderPwa()
    const trigger = screen.getByRole('button', {
      name: 'Help',
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

    expect(screen.queryByLabelText('Install NYC Weather')).not.toBeInTheDocument()
  })
})
