import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SubWaitRoute from './SubWaitRoute'

const { transit_realtime: rt } = GtfsRealtimeBindings

function buildFeedBuffer(nowEpochSeconds: number): ArrayBuffer {
  const message = rt.FeedMessage.create({
    header: { gtfsRealtimeVersion: '2.0', timestamp: nowEpochSeconds },
    entity: [
      {
        id: '1',
        tripUpdate: {
          trip: { tripId: 'trip-f-south', routeId: 'F' },
          stopTimeUpdate: [
            { stopId: 'F16S', arrival: { time: nowEpochSeconds + 120 } },
            { stopId: 'D43S', arrival: { time: nowEpochSeconds + 2400 } },
          ],
        },
      },
      {
        id: '2',
        tripUpdate: {
          trip: { tripId: 'trip-f-north', routeId: 'F' },
          stopTimeUpdate: [
            { stopId: 'F16N', arrival: { time: nowEpochSeconds + 480 } },
            { stopId: 'F01N', arrival: { time: nowEpochSeconds + 3600 } },
          ],
        },
      },
    ],
  })
  const bytes = rt.FeedMessage.encode(message).finish()
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/sub-wait/*" element={<SubWaitRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  // jsdom in this setup does not provide localStorage; stub it like the
  // other feature tests do.
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

  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      arrayBuffer: async () => buildFeedBuffer(Date.now() / 1000),
    })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SubWaitRoute', () => {
  it('sets the page title and reports the initial route to GA4', () => {
    const gtag = vi.fn()
    vi.stubGlobal('gtag', gtag)

    renderAt('/sub-wait/')

    expect(document.title).toBe("Sub-Wait | Leon's Website")
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_location: window.location.href,
      page_title: "Sub-Wait | Leon's Website",
      page_path: '/sub-wait/',
    })
  })

  it('updates the title and reports client-side route changes', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('gtag', gtag)
    const user = userEvent.setup()

    renderAt('/sub-wait/')
    await user.click(screen.getByRole('link', { name: 'Stations' }))

    expect(document.title).toBe('Stations | Sub-Wait')
    expect(gtag).toHaveBeenLastCalledWith('event', 'page_view', {
      page_location: window.location.href,
      page_title: 'Stations | Sub-Wait',
      page_path: '/sub-wait/stations',
    })
  })

  it('renders the logo hero on the home page', () => {
    renderAt('/sub-wait/')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sub-Wait' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Sub-Wait logo' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('renders a station page with live arrivals in both directions', async () => {
    renderAt('/sub-wait/station/F16')
    expect(
      screen.getByRole('heading', { name: 'East Broadway' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Uptown & Queens' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Brooklyn' })).toBeInTheDocument()

    expect(
      await screen.findByText('Coney Island-Stillwell Av'),
    ).toBeInTheDocument()
    expect(screen.getByText('Jamaica-179 St')).toBeInTheDocument()
    expect(screen.getByText('2m')).toBeInTheDocument()
    expect(screen.getByText('8m')).toBeInTheDocument()
    // Updated stamp shows relative elapsed time, not wall-clock time.
    expect(screen.getByText(/Live · updated \d+s ago/)).toBeInTheDocument()
    // No favoriting functionality.
    expect(
      screen.queryByRole('button', { name: /favorites/i }),
    ).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
      expect.anything(),
    )
  })

  it('renders only one direction on a deep link page', async () => {
    renderAt('/sub-wait/station/F16/N')
    expect(
      screen.getByRole('heading', { name: 'Uptown & Queens' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Brooklyn' }),
    ).not.toBeInTheDocument()

    expect(await screen.findByText('Jamaica-179 St')).toBeInTheDocument()
    expect(
      screen.queryByText('Coney Island-Stillwell Av'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Both directions' }),
    ).toBeInTheDocument()
  })

  it('shows an error state with retry when the feed request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 500,
        arrayBuffer: async () => new ArrayBuffer(0),
      })),
    )
    renderAt('/sub-wait/station/F16')
    expect(
      (await screen.findAllByText(/Could not reach the MTA feed/)).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: 'Try again' }).length,
    ).toBeGreaterThan(0)
  })

  it('shows a not-found message for unknown stations', () => {
    renderAt('/sub-wait/station/ZZZ')
    expect(
      screen.getByRole('heading', { name: 'Station not found' }),
    ).toBeInTheDocument()
  })

  it('toggles between light and dark themes and persists the choice', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/sub-wait/')
    const page = container.firstElementChild as HTMLElement
    const initialTheme = page.dataset.theme
    expect(initialTheme === 'light' || initialTheme === 'dark').toBe(true)

    const toggle = screen.getByRole('button', {
      name: /Switch to (light|dark) mode/,
    })
    expect(toggle).toHaveTextContent('')

    await user.click(toggle)
    expect(page.dataset.theme).not.toBe(initialTheme)
    expect(window.localStorage.getItem('sub-wait-theme')).toBe(
      page.dataset.theme,
    )
  })
})

describe('formatElapsed', () => {
  it('formats seconds then minutes', async () => {
    const { formatElapsed } = await import('./StationRoute')
    expect(formatElapsed(0)).toBe('0s ago')
    expect(formatElapsed(12_000)).toBe('12s ago')
    expect(formatElapsed(59_400)).toBe('59s ago')
    expect(formatElapsed(60_000)).toBe('1m ago')
    expect(formatElapsed(150_000)).toBe('2m ago')
  })
})
