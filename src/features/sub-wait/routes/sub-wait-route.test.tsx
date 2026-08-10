import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import SubWaitRoute from './SubWaitRoute'

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
})

describe('SubWaitRoute', () => {
  it('renders the station directory on the home page', async () => {
    const user = userEvent.setup()
    renderAt('/sub-wait/')
    expect(
      screen.getByRole('heading', { name: 'How long until the train?' }),
    ).toBeInTheDocument()

    // Borough groups render their stations lazily on open.
    expect(
      screen.queryByRole('link', { name: /East Broadway/ }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByText('Manhattan'))
    expect(
      screen.getByRole('link', { name: /East Broadway/ }),
    ).toBeInTheDocument()
  })

  it('renders a station page with both direction sections', () => {
    renderAt('/sub-wait/station/F16')
    expect(
      screen.getByRole('heading', { name: 'East Broadway' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Uptown & Queens' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Brooklyn' })).toBeInTheDocument()
  })

  it('renders a single-direction deep link page', () => {
    renderAt('/sub-wait/station/F16/N')
    expect(
      screen.getByRole('heading', { name: 'Uptown & Queens' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Brooklyn' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Both directions' }),
    ).toBeInTheDocument()
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

    await user.click(
      screen.getByRole('button', { name: /Switch to (light|dark) mode/ }),
    )
    expect(page.dataset.theme).not.toBe(initialTheme)
    expect(window.localStorage.getItem('sub-wait-theme')).toBe(
      page.dataset.theme,
    )
  })
})
