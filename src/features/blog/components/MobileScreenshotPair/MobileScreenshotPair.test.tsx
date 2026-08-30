import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import MobileScreenshotPair from './MobileScreenshotPair'
import styles from './MobileScreenshotPair.module.css'

describe('MobileScreenshotPair', () => {
  it('renders two zoomable images in a one-row grid with a custom label', async () => {
    const user = userEvent.setup()
    render(<MobileScreenshotPair ariaLabel="Custom mobile comparison" />)

    const pair = screen.getByRole('region', { name: 'Custom mobile comparison' })
    expect(pair).toHaveClass(styles.grid)
    expect(pair).toHaveAttribute('data-testid', 'mobile-screenshot-pair')

    const zoomControls = screen.getAllByRole('button', { name: /Zoom image:/ })
    expect(zoomControls).toHaveLength(2)
    expect(screen.getAllByRole('img')).toHaveLength(2)

    await user.click(zoomControls[0])
    expect(screen.getByRole('dialog', { name: 'Image zoom viewer' })).toBeInTheDocument()
  })
})
