import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../../App'

function renderAt(path: string): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

function unlock(password: string): void {
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
}

describe('hosting route', () => {
  afterEach(() => {
    window.sessionStorage.clear()
  })

  it('hides the hosting guide behind the password gate', () => {
    renderAt('/georgies-board-game-nights/hosting')

    expect(screen.getByRole('heading', { name: 'Hosts only' })).toBeInTheDocument()
    expect(screen.getByText(/want to become a host\? let a current host know!/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Our tenets/ })).not.toBeInTheDocument()
  })

  it('shows an error for a wrong password', () => {
    renderAt('/georgies-board-game-nights/hosting')

    unlock('nope')

    expect(screen.getByRole('alert')).toHaveTextContent(/not it/i)
    expect(screen.queryByRole('heading', { name: /Our tenets/ })).not.toBeInTheDocument()
  })

  it('unlocks with the password and leads with the tenets', () => {
    renderAt('/georgies-board-game-nights/hosting')

    unlock(' Community ')

    const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
    expect(sectionHeadings[0]).toHaveTextContent('Our tenets')
    expect(screen.getByRole('heading', { name: 'Build community' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Keep it light' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Play board games' })).toBeInTheDocument()
    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('During')).toBeInTheDocument()
    expect(screen.getByText('Closing')).toBeInTheDocument()
    expect(screen.getByText('Invite folks to the WhatsApp chat')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeInTheDocument()
  })

  it('stays unlocked for the rest of the session', () => {
    const { unmount } = renderAt('/georgies-board-game-nights/hosting')
    unlock('community')
    unmount()

    renderAt('/georgies-board-game-nights/hosting')

    expect(screen.getByRole('heading', { name: /Our tenets/ })).toBeInTheDocument()
  })

  it('is linked from the main page header', () => {
    renderAt('/georgies-board-game-nights')

    const nav = screen.getByRole('navigation', { name: 'Game night navigation' })
    expect(nav.querySelector('a[href="/georgies-board-game-nights/hosting"]')).toHaveTextContent(
      'Hosting'
    )
  })
})
