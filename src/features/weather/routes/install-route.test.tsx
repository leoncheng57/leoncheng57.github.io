import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import InstallRoute from './InstallRoute'

describe('Weather InstallRoute', () => {
  it('provides complete text and weather illustrations for both platforms', () => {
    render(
      <MemoryRouter>
        <InstallRoute />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Install NYC Weather' }),
    ).toBeInTheDocument()
    const iphone = screen.getByRole('heading', { name: 'iPhone or iPad' })
      .parentElement!
    const android = screen.getByRole('heading', { name: 'Android' }).parentElement!

    expect(within(iphone).getByText('Tap Share in Safari')).toBeInTheDocument()
    expect(within(iphone).getByText('Choose Add to Home Screen')).toBeInTheDocument()
    expect(within(iphone).getByText('Confirm with Add')).toBeInTheDocument()
    expect(within(android).getByText('Open the Chrome menu')).toBeInTheDocument()
    expect(within(android).getByText('Choose Install app')).toBeInTheDocument()
    expect(within(android).getByText('Confirm installation')).toBeInTheDocument()

    const illustrations = screen.getAllByRole('img')
    expect(illustrations).toHaveLength(6)
    illustrations.forEach((image) => {
      expect(image).toHaveAttribute('src', expect.stringContaining('/weather/install/'))
      expect(image).toHaveAccessibleName()
    })
  })

  it('keeps every installation step useful if illustrations fail', () => {
    render(
      <MemoryRouter>
        <InstallRoute />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Open NYC Weather in Safari/)).toBeInTheDocument()
    expect(screen.getByText(/Scroll the share sheet if needed/)).toBeInTheDocument()
    expect(screen.getByText(/Keep the NYC Weather name and tap Add/)).toBeInTheDocument()
    expect(screen.getByText(/Open NYC Weather in Chrome/)).toBeInTheDocument()
    expect(screen.getByText(/Some Android versions call this Add to Home screen/)).toBeInTheDocument()
    expect(screen.getByText(/Tap Install. NYC Weather will open/)).toBeInTheDocument()
    expect(screen.getByText(/If an image does not load/)).toBeInTheDocument()
  })
})
