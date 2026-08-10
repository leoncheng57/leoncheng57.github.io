import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STATIONS } from '../data/stations'
import { buildProjection } from '../utils/mapProjection'
import SubWaitRoute from './SubWaitRoute'

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
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      arrayBuffer: async () => new ArrayBuffer(0),
    })),
  )
})

function renderMap() {
  return render(
    <MemoryRouter initialEntries={['/sub-wait/map']}>
      <Routes>
        <Route path="/sub-wait/*" element={<SubWaitRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MapRoute', () => {
  it('plots every station', () => {
    const { container } = renderMap()
    expect(
      screen.getByRole('heading', { name: 'System map' }),
    ).toBeInTheDocument()
    expect(container.querySelectorAll('circle')).toHaveLength(STATIONS.length)
  })

  it('navigates to a station page when a station is tapped', () => {
    const { container } = renderMap()
    const eastBroadway = container.querySelector(
      'circle[data-station-id="F16"]',
    )
    expect(eastBroadway).not.toBeNull()
    fireEvent.click(eastBroadway as Element)
    expect(
      screen.getByRole('heading', { name: 'East Broadway' }),
    ).toBeInTheDocument()
  })

  it('zooms with the controls and resets', () => {
    const { container } = renderMap()
    const svg = container.querySelector('svg[role="presentation"]') as SVGElement
    const initialTransform = svg.style.transform

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(svg.style.transform).not.toBe(initialTransform)

    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }))
    expect(svg.style.transform).toBe(
      'translate(0px, 0px) scale(1)',
    )
  })
})

describe('map projection', () => {
  it('projects all stations inside the canvas', () => {
    const projection = buildProjection(STATIONS, 900, 30)
    for (const station of STATIONS) {
      const { x, y } = projection.project(station.lat, station.lon)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(projection.width)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(projection.height)
    }
  })

  it('keeps north above south', () => {
    const projection = buildProjection(STATIONS, 900, 30)
    // Van Cortlandt Park (Bronx, far north) vs Coney Island (Brooklyn, south).
    const bronx = projection.project(40.889248, -73.898583)
    const coney = projection.project(40.577422, -73.981233)
    expect(bronx.y).toBeLessThan(coney.y)
  })
})
