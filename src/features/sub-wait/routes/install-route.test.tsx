import { render, screen, within } from '@testing-library/react'
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

describe('InstallRoute', () => {
  it('shows iPhone and Android steps with six original illustrations', () => {
    render(
      <MemoryRouter initialEntries={['/sub-wait/install']}>
        <Routes>
          <Route path="/sub-wait/*" element={<SubWaitRoute />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Install Sub-Wait' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'iPhone' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Android' })).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(6)
    expect(screen.getByText('Still seeing an old icon?')).toBeInTheDocument()
  })

  it('links to the guide from the app footer', () => {
    render(
      <MemoryRouter initialEntries={['/sub-wait/']}>
        <Routes>
          <Route path="/sub-wait/*" element={<SubWaitRoute />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(
      within(screen.getByRole('contentinfo')).getByRole('link', {
        name: 'Install',
      }),
    ).toHaveAttribute(
      'href',
      '/sub-wait/install',
    )
    expect(
      within(screen.getByRole('navigation', { name: 'Sub-Wait' })).getByRole(
        'link',
        { name: 'Install' },
      ),
    ).toHaveAttribute('href', '/sub-wait/install')
  })

  it('explains station installs and compatibility limitations', () => {
    render(
      <MemoryRouter initialEntries={['/sub-wait/install']}>
        <Routes>
          <Route path="/sub-wait/*" element={<SubWaitRoute />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Install a station app' }),
    ).toBeInTheDocument()
    const notes = screen.getByRole('heading', { name: 'Compatibility notes' })
      .parentElement
    expect(notes).toHaveTextContent('iOS/iPadOS 16.4+')
    expect(notes).toHaveTextContent('recent Chromium')
    expect(notes).toHaveTextContent('merge or replace installations')
    expect(notes).toHaveTextContent('start_url is technically a browser hint')
    expect(notes).toHaveTextContent('Long station names may be truncated')
    expect(notes).toHaveTextContent('Same-name stations')
    expect(notes).toHaveTextContent('Installing from the homepage creates the general Sub-Wait app')
  })
})
