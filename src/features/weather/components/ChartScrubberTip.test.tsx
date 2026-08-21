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
  ] as const)('starts expanded with %s instructions', (period, copy) => {
    render(<ChartScrubberTip period={period} />)

    expect(
      screen.getByRole('complementary', { name: 'How to read charts' }),
    ).toHaveTextContent(
      `${copy} You can also focus the chart and use the arrow keys.`,
    )
    expect(
      screen.getByRole('button', { name: 'Collapse chart instructions' }),
    ).toBeInTheDocument()
  })

  it('persists collapse and reopen choices', async () => {
    const user = userEvent.setup()
    render(<ChartScrubberTip period="hour" />)

    await user.click(
      screen.getByRole('button', { name: 'Collapse chart instructions' }),
    )
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true')

    await user.click(screen.getByRole('button', { name: 'How to read charts' }))
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('false')
    expect(
      screen.getByRole('button', { name: 'Collapse chart instructions' }),
    ).toBeInTheDocument()
  })

  it('starts collapsed when the stored preference is true', () => {
    window.localStorage.setItem(STORAGE_KEY, 'true')

    render(<ChartScrubberTip period="day" />)

    expect(
      screen.getByRole('button', { name: 'How to read charts' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('complementary', { name: 'How to read charts' }),
    ).not.toBeInTheDocument()
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
    await user.click(
      screen.getByRole('button', { name: 'Collapse chart instructions' }),
    )
    expect(
      screen.getByRole('button', { name: 'How to read charts' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'How to read charts' }))
    expect(
      screen.getByRole('button', { name: 'Collapse chart instructions' }),
    ).toBeInTheDocument()

    getItem.mockRestore()
    setItem.mockRestore()
  })
})
