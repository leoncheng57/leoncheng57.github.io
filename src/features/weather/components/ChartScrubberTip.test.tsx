import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChartScrubberTip from './ChartScrubberTip'

const STORAGE_KEY = 'nyc-weather-chart-tip-collapsed-v1'

describe('ChartScrubberTip', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it.each([
    ['hour', 'Drag the vertical line across a chart to inspect each hour.'],
    ['day', 'Drag the vertical line across a chart to inspect each day.'],
  ] as const)('opens %s instructions from the compact control', async (period, copy) => {
    const user = userEvent.setup()
    render(<ChartScrubberTip period={period} />)

    const trigger = screen.getByRole('button', { name: 'Chart drag' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(
      screen.getByRole('complementary', { name: 'How to read charts' }),
    ).toHaveTextContent(
      `${copy} You can also focus the chart and use the arrow keys.`,
    )
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('persists collapse and reopen choices', async () => {
    const user = userEvent.setup()
    render(<ChartScrubberTip period="hour" />)
    const trigger = screen.getByRole('button', { name: 'Chart drag' })

    await user.click(trigger)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('false')
    expect(screen.getByRole('complementary')).toBeInTheDocument()

    await user.click(trigger)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true')
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })

  it('starts expanded when the stored preference is false', () => {
    window.localStorage.setItem(STORAGE_KEY, 'false')

    render(<ChartScrubberTip period="day" />)

    expect(
      screen.getByRole('button', { name: 'Chart drag' }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('still toggles in-session when localStorage is blocked', async () => {
    const user = userEvent.setup()
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked')
      })
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked')
      })

    render(<ChartScrubberTip period="hour" />)
    const trigger = screen.getByRole('button', { name: 'Chart drag' })
    await user.click(trigger)
    expect(screen.getByRole('complementary')).toBeInTheDocument()

    await user.click(trigger)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()

    getItem.mockRestore()
    setItem.mockRestore()
  })
})
