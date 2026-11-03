import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PathsToSuccessAnimation from './PathsToSuccessAnimation'

describe('PathsToSuccessAnimation', () => {
  it('renders every path label and the goal at rest', () => {
    render(<PathsToSuccessAnimation />)

    expect(screen.getByRole('region', { name: 'Paths to success animation' })).toBeInTheDocument()
    expect(screen.getByText('Hard work, wrong path')).toBeInTheDocument()
    expect(screen.getByText('Hard work, found the right path')).toBeInTheDocument()
    expect(screen.getByText('Steady work, right path')).toBeInTheDocument()
    expect(screen.getByText('Small work, right path')).toBeInTheDocument()
    expect(screen.getByText('Luck and chance')).toBeInTheDocument()
    expect(screen.getByText('Lasting success,')).toBeInTheDocument()
  })

  it('marks a path button pressed when it is played on its own', async () => {
    const user = userEvent.setup()
    render(<PathsToSuccessAnimation />)

    await user.click(screen.getByRole('button', { name: 'Luck' }))

    expect(screen.getByRole('button', { name: 'Luck' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Steady' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: /Replay all/ }))

    expect(screen.getByRole('button', { name: 'Luck' })).toHaveAttribute('aria-pressed', 'false')
  })
})
