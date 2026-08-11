import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import InstallHelpModal from './InstallHelpModal'

const originalUserAgent = navigator.userAgent

function setUserAgent(userAgent: string): void {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  })
}

function renderModal(onClose = vi.fn(), returnFocusTo: HTMLElement | null = null) {
  return render(
    <MemoryRouter>
      <InstallHelpModal onClose={onClose} returnFocusTo={returnFocusTo} />
    </MemoryRouter>,
  )
}

describe('InstallHelpModal', () => {
  afterEach(() => {
    setUserAgent(originalUserAgent)
    document.body.style.overflow = ''
  })

  it('shows only iPhone installation steps for Apple phones and tablets', () => {
    setUserAgent('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')
    renderModal()

    expect(screen.getByRole('heading', { name: 'iPhone or iPad' })).toBeInTheDocument()
    expect(screen.getByText('Tap Share in Safari')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Android' })).not.toBeInTheDocument()
  })

  it('shows only Android installation steps for Android devices', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 14)')
    renderModal()

    expect(screen.getByRole('heading', { name: 'Android' })).toBeInTheDocument()
    expect(screen.getByText('Open the Chrome menu')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'iPhone or iPad' })).not.toBeInTheDocument()
  })

  it('shows both platform instructions when detection is inconclusive', () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)')
    renderModal()

    expect(screen.getByRole('heading', { name: 'iPhone or iPad' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Android' })).toBeInTheDocument()
  })

  it('closes from its button, Escape, and backdrop', () => {
    const onClose = vi.fn()
    renderModal(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close installation help' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!)

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('locks scrolling, traps focus, and restores focus on unmount', () => {
    const returnButton = document.createElement('button')
    document.body.appendChild(returnButton)
    const { unmount } = renderModal(vi.fn(), returnButton)
    const closeButton = screen.getByRole('button', { name: 'Close installation help' })
    const guideLink = screen.getByRole('link', {
      name: 'Need help? See full guide ->',
    })

    expect(document.body.style.overflow).toBe('hidden')
    expect(closeButton).toHaveFocus()

    guideLink.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(guideLink).toHaveFocus()

    unmount()
    expect(document.body.style.overflow).toBe('')
    expect(returnButton).toHaveFocus()
    returnButton.remove()
  })

  it('links to the complete installation guide', () => {
    renderModal()

    expect(
      screen.getByRole('link', { name: 'Need help? See full guide ->' }),
    ).toHaveAttribute('href', '/sub-wait/install')
  })
})
