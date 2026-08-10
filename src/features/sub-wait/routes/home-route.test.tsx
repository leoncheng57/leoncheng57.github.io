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

  it('shows favorited stations in the favorites section', () => {
    stubLocalStorage({ 'sub-wait-favorites': JSON.stringify(['F16']) })
    renderHome()

    const favorites = screen.getByRole('region', { name: 'Favorite stations' })
    expect(favorites).toHaveTextContent('East Broadway')
  })

  it('hides the favorites section when nothing is favorited', () => {
    renderHome()
    expect(
      screen.queryByRole('region', { name: 'Favorite stations' }),
    ).not.toBeInTheDocument()
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
