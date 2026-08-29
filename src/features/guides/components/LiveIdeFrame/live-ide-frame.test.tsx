import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import LiveIdeFrame, { LIVE_IDE_TITLE, LIVE_IDE_URL } from './LiveIdeFrame'

describe('LiveIdeFrame', () => {
  it('shows an accessible facade without mounting the iframe', () => {
    render(<LiveIdeFrame label="An independently explorable app with fake data" />)

    expect(
      screen.getByRole('region', { name: 'An independently explorable app with fake data' })
    ).toBeInTheDocument()
    expect(screen.getByText('Live app')).toBeInTheDocument()
    expect(screen.getByText('Iframe unloaded')).toBeInTheDocument()
    expect(screen.getByText('Ready when you are')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load live simulator' })).toBeInTheDocument()
    expect(screen.queryByTitle(LIVE_IDE_TITLE)).not.toBeInTheDocument()
  })

  it('always offers the exact live URL in a new tab', () => {
    render(<LiveIdeFrame />)

    expect(screen.getByRole('link', { name: 'Open in a new tab ↗' })).toHaveAttribute(
      'href',
      LIVE_IDE_URL
    )
    expect(screen.getByRole('link', { name: 'Open in a new tab ↗' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('mounts the unsandboxed lazy iframe after a click', async () => {
    const user = userEvent.setup()
    render(<LiveIdeFrame />)

    await user.click(screen.getByRole('button', { name: 'Load live simulator' }))

    const iframe = screen.getByTitle(LIVE_IDE_TITLE)
    expect(iframe).toHaveAttribute('src', LIVE_IDE_URL)
    expect(iframe).toHaveAttribute('loading', 'lazy')
    expect(iframe).not.toHaveAttribute('sandbox')
    expect(screen.getByText('Live simulator loaded')).toBeInTheDocument()
    expect(screen.queryByText('Iframe unloaded')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open in a new tab ↗' })).toBeInTheDocument()
  })

  it('copies the guide theme into the simulator storage before mounting', async () => {
    const user = userEvent.setup()
    render(
      <div data-theme="light">
        <LiveIdeFrame />
      </div>
    )

    await user.click(screen.getByRole('button', { name: 'Load live simulator' }))

    expect(window.localStorage.getItem('theme')).toBe('light')
  })
})
