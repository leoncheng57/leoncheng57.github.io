import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
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
})

describe('ArchitectureRoute', () => {
  it('documents the internal system architecture', () => {
    render(
      <MemoryRouter initialEntries={['/sub-wait/architecture']}>
        <Routes>
          <Route path="/sub-wait/*" element={<SubWaitRoute />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'How Sub-Wait works' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Architecture diagram/ }),
    ).toBeInTheDocument()

    for (const section of [
      /A quick GTFS primer/,
      /Static station data/,
      /Live arrivals from the GTFS-Realtime feeds/,
      /Polling lifecycle/,
      /Routing and deep links/,
      /Nearby and search/,
      /PWA and caching strategy/,
      /Theming/,
      /Licensing and IP notes/,
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: section }),
      ).toBeInTheDocument()
    }
  })

  it('is reachable from the masthead and footer', () => {
    render(
      <MemoryRouter initialEntries={['/sub-wait/']}>
        <Routes>
          <Route path="/sub-wait/*" element={<SubWaitRoute />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Architecture' }),
    ).toHaveAttribute('href', '/sub-wait/architecture')
    expect(
      screen.getByRole('link', { name: 'How it works' }),
    ).toHaveAttribute('href', '/sub-wait/architecture')
  })
})
