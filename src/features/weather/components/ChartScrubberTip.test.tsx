import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import ChartScrubberTip from './ChartScrubberTip'

describe('ChartScrubberTip', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it.each([
    ['hour', 'Drag the vertical line across a chart to inspect each hour.'],
    ['day', 'Drag the vertical line across a chart to inspect each day.'],
  ] as const)('opens %s instructions in a modal', async (period, copy) => {
    const user = userEvent.setup()
    render(<ChartScrubberTip period={period} />)

    const trigger = screen.getByRole('button', { name: 'Chart drag' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'How to read charts' })
    expect(dialog).toHaveTextContent(
      `${copy} You can also focus the chart and use the arrow keys.`,
    )
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(
      screen.getByRole('button', { name: 'Close chart instructions' }),
    ).toHaveFocus()
  })

  it('closes with Got it, Escape, backdrop, and Close while restoring focus', async () => {
    const user = userEvent.setup()
    render(<ChartScrubberTip period="hour" />)
    const trigger = screen.getByRole('button', { name: 'Chart drag' })

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Got it' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    fireEvent.mouseDown(screen.getByTestId('chart-tip-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(
      screen.getByRole('button', { name: 'Close chart instructions' }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('traps Tab between the modal controls', async () => {
    const user = userEvent.setup()
    render(<ChartScrubberTip period="hour" />)
    await user.click(screen.getByRole('button', { name: 'Chart drag' }))

    const close = screen.getByRole('button', { name: 'Close chart instructions' })
    const done = screen.getByRole('button', { name: 'Got it' })
    done.focus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(done).toHaveFocus()
  })
})
