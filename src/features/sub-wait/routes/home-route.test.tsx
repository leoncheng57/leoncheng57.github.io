import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SubWaitRoute from './SubWaitRoute'

type GeolocationSuccess = (_position: {
  coords: { latitude: number; longitude: number }
}) => void

function stubLocalStorage(initial: Record<string, string> = {}) {
  const values = new Map<string, string>(Object.entries(initial))
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/sub-wait/']}>
      <Routes>
        <Route path="/sub-wait/*" element={<SubWaitRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  stubLocalStorage()
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      arrayBuffer: async () => new ArrayBuffer(0),
    })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Sub-Wait home', () => {
  it('shows the logo hero with search and nearby only', () => {
    renderHome()

    expect(screen.getByRole('img', { name: 'Sub-Wait logo' })).toHaveAttribute(
      'src',
      '/sub-wait/icon.svg',
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sub-Wait' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Nearby stations' }),
    ).toBeInTheDocument()

    // The borough directory and favorites moved off the homepage.
    expect(screen.queryByText('All stations')).not.toBeInTheDocument()
    expect(screen.queryByText('Favorites')).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Browse all stations/ }),
    ).toHaveAttribute('href', '/sub-wait/stations')
  })

  it('finds stations through search', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.type(screen.getByRole('searchbox'), 'east broad')
    const results = screen.getAllByRole('link', { name: /East Broadway/ })
    expect(results.length).toBeGreaterThan(0)

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'zzzzz')
    expect(screen.getByText(/No stations match/)).toBeInTheDocument()
  })

  it('lists nearby stations after the user shares their location', async () => {
    const user = userEvent.setup()
    const getCurrentPosition = vi.fn((success: GeolocationSuccess) => {
      success({ coords: { latitude: 40.713715, longitude: -73.990173 } })
    })
    vi.stubGlobal('navigator', {
      ...window.navigator,
      geolocation: { getCurrentPosition },
    })
    renderHome()

    await user.click(screen.getByRole('button', { name: 'Use my location' }))

    const nearby = screen.getByRole('region', { name: 'Nearby stations' })
    expect(nearby).toHaveTextContent('East Broadway')
    expect(nearby).toHaveTextContent(/min walk/)
    expect(getCurrentPosition).toHaveBeenCalledOnce()
  })

  it('explains when location permission is denied', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('navigator', {
      ...window.navigator,
      geolocation: {
        getCurrentPosition: vi.fn(
          (_success: GeolocationSuccess, error: (_e: unknown) => void) => {
            error({ code: 1, PERMISSION_DENIED: 1 })
          },
        ),
      },
    })
    renderHome()

    await user.click(screen.getByRole('button', { name: 'Use my location' }))
    expect(
      screen.getByText(/Location permission was denied/),
    ).toBeInTheDocument()
  })
})

describe('Sub-Wait stations directory', () => {
  it('lists boroughs and lazily reveals stations', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/sub-wait/stations']}>
        <Routes>
          <Route path="/sub-wait/*" element={<SubWaitRoute />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'All stations' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /East Broadway/ }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByText('Manhattan'))
    expect(
      screen.getByRole('link', { name: /East Broadway/ }),
    ).toBeInTheDocument()
  })
})
