import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PALETTES } from '../palettes'
import {
  addDays,
  formatDayLong,
  formatHourLabel,
  nycNowHour,
  nycToday,
} from '../utils/format'
import styles from '../weather.module.css'
import WeatherRoute from './WeatherRoute'

const TODAY = nycToday()

function buildDates(): string[] {
  const dates: string[] = []
  for (let offset = -7; offset <= 6; offset += 1) {
    dates.push(addDays(TODAY, offset))
  }
  return dates
}

/**
 * The UTC instant at which New York is at the given local hour on `date`,
 * so clock-sensitive assertions do not depend on the machine's zone or on
 * whether daylight saving is in effect.
 */
function utcInstantForNycHour(date: string, hour: number): Date {
  const target = `${date}T${String(hour).padStart(2, '0')}:00`
  for (let offset = 0; offset < 48; offset += 1) {
    const candidate = new Date(`${date}T00:00:00Z`)
    candidate.setUTCHours(offset)
    if (nycNowHour(candidate) === target) return candidate
  }
  throw new Error(`No UTC instant maps to ${target} in New York`)
}

function buildForecastResponse(hourlyDates: string[] = buildDates()) {
  const dates = buildDates()
  const hourlyTime: string[] = []
  hourlyDates.forEach((date) => {
    for (let hour = 0; hour < 24; hour += 1) {
      hourlyTime.push(`${date}T${String(hour).padStart(2, '0')}:00`)
    }
  })
  return {
    current: { temperature_2m: 72.4, weather_code: 2, is_day: 1 },
    daily: {
      time: dates,
      weather_code: dates.map(() => 2),
      temperature_2m_max: dates.map((_, index) => 80 + index),
      temperature_2m_min: dates.map((_, index) => 60 + index),
      precipitation_probability_max: dates.map(() => 35),
      precipitation_sum: dates.map(() => 0.1),
    },
    hourly: {
      time: hourlyTime,
      temperature_2m: hourlyTime.map(() => 70),
      // 2 PM through 5 PM rains every day; everything else stays dry.
      precipitation_probability: hourlyTime.map((time) => {
        const hour = Number(time.slice(11, 13))
        return hour >= 14 && hour <= 17 ? 80 : 10
      }),
      precipitation: hourlyTime.map(() => 0),
    },
  }
}

function buildAirQualityResponse(hourlyDates?: string[]) {
  const forecast = buildForecastResponse(hourlyDates)
  return {
    current: { us_aqi: 42 },
    hourly: {
      time: forecast.hourly.time,
      us_aqi: forecast.hourly.time.map(() => 45),
    },
  }
}

const EMPTY_ALERTS = { features: [] }

const HEAT_ALERT = {
  features: [
    {
      id: 'urn:oid:heat-1',
      properties: {
        event: 'Heat Advisory',
        headline: 'Heat Advisory until Thursday 8 PM',
        severity: 'Moderate',
        ends: '2026-08-21T00:00:00-04:00',
        description: 'Heat index values up to 100 expected.',
        instruction: 'Drink plenty of fluids.',
      },
    },
  ],
}

function mockFetch(
  alertsBody: unknown = EMPTY_ALERTS,
  hourlyDates?: string[],
): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      let body: unknown
      // Check air quality first: its hostname contains 'api.open-meteo.com'.
      if (url.includes('air-quality-api.open-meteo.com')) {
        body = buildAirQualityResponse(hourlyDates)
      } else if (url.includes('api.open-meteo.com')) {
        body = buildForecastResponse(hourlyDates)
      } else if (url.includes('api.weather.gov')) {
        body = alertsBody
      } else {
        throw new Error(`Unexpected fetch: ${url}`)
      }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/weather/*" element={<WeatherRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** Pins the clock to a New York wall-clock hour without faking timers. */
function freezeNycHour(date: string, hour: number): void {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(utcInstantForNycHour(date, hour))
}

describe('weather hourly home route', () => {
  it('lands on an inclusive window of the past 12 and next 24 hours', async () => {
    mockFetch()
    renderAt('/weather/')

    expect(
      await screen.findByRole('heading', {
        name: 'Past 12 hours and next 24 hours',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/72°F/)).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Hourly temperature for the past 12 hours and next 24 hours',
      }),
    ).toBeInTheDocument()
    // The 14-day charts now live on their own page.
    expect(screen.queryByText('Air Quality (US AQI)')).not.toBeInTheDocument()
    // The scrubber rests on the current hour without any interaction.
    expect(screen.getAllByTestId('chart-scrubber')).toHaveLength(2)

    // 12 past hours + now + 24 future hours, with "now" in the middle.
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
    sliders.forEach((slider) => {
      expect(slider).toHaveAttribute('aria-valuemax', '36')
      expect(slider).toHaveAttribute('aria-valuenow', '12')
    })
  })

  it('marks the current hour mid-window once the scrubber moves off it', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')

    await screen.findByRole('heading', {
      name: 'Past 12 hours and next 24 hours',
    })
    // At rest the scrubber sits on the marker, which stays hidden so the two
    // lines do not stack on the same pixel.
    expect(screen.queryByText('Now')).not.toBeInTheDocument()

    const slider = screen.getByRole('slider', {
      name: 'Scrub through hours on the temperature chart',
    })
    slider.focus()
    await user.keyboard('{ArrowRight}')

    expect(screen.getAllByText('Now').length).toBe(2)
    expect(slider).toHaveAttribute('aria-valuenow', '13')
  })

  it('anchors the window to the current NYC hour, not the device hour', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')

    await screen.findByRole('heading', {
      name: 'Past 12 hours and next 24 hours',
    })
    const slider = screen.getByRole('slider', {
      name: 'Scrub through hours on the temperature chart',
    })
    slider.focus()
    // Index 12 is the current NYC hour, and both charts share the readout.
    await user.keyboard('{ArrowRight}{ArrowLeft}')

    const nowLabel = formatHourLabel(nycNowHour())
    expect(
      screen.getAllByText(new RegExp(`${nowLabel} · 70°`)).length,
    ).toBeGreaterThan(0)
  })

  it('steps back into real history and clamps at both ends', async () => {
    freezeNycHour(TODAY, 18)
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')

    await screen.findByRole('heading', {
      name: 'Past 12 hours and next 24 hours',
    })
    const slider = screen.getByRole('slider', {
      name: 'Scrub through hours on the temperature chart',
    })
    slider.focus()

    // ArrowLeft from "now" is no longer a no-op: it enters the past.
    await user.keyboard('{ArrowLeft}')
    expect(slider).toHaveAttribute('aria-valuenow', '11')
    expect(screen.getAllByText(/5 PM · 70°/).length).toBeGreaterThan(0)

    // Twelve more presses reach the oldest hour and then stop there.
    await user.keyboard('{ArrowLeft}'.repeat(12))
    expect(slider).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getAllByText(/6 AM · 70°/).length).toBeGreaterThan(0)

    // The far end clamps at index 36, the last of the 24 forecast hours.
    await user.keyboard('{ArrowRight}'.repeat(40))
    expect(slider).toHaveAttribute('aria-valuenow', '36')
  })

  it('spaces axis ticks on the clock and names the day at midnight', async () => {
    freezeNycHour(TODAY, 18)
    mockFetch()
    renderAt('/weather/')

    await screen.findByRole('heading', {
      name: 'Past 12 hours and next 24 hours',
    })
    const tomorrowWeekday = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
    }).format(new Date(`${addDays(TODAY, 1)}T12:00:00Z`))

    // The window spans two dates, so the midnight tick carries its weekday to
    // keep repeated hour labels apart. Both charts share the axis.
    expect(screen.getAllByText(`${tomorrowWeekday} 12 AM`)).toHaveLength(2)
    // Ticks land every six hours of clock time rather than on every fourth
    // array index, which would crowd 37 points into the same plot width.
    expect(screen.getAllByText('12 PM')).toHaveLength(4)
    expect(screen.queryByText('5 PM')).not.toBeInTheDocument()
  })

  it('summarises only rain that has not already ended', async () => {
    // The fixture rains 2 PM–5 PM every day. At 6 PM that block is history,
    // so the tip must point at tomorrow rather than at this afternoon.
    freezeNycHour(TODAY, 18)
    mockFetch()
    renderAt('/weather/')

    await screen.findByRole('heading', {
      name: 'Past 12 hours and next 24 hours',
    })
    expect(screen.getByText(/Rain likely 2 PM–5 PM/)).toBeInTheDocument()

    // The window still holds this afternoon's rain, it is just not announced.
    const slider = screen.getByRole('slider', {
      name: 'Scrub through hours on the precipitation chart',
    })
    expect(slider).toHaveAttribute('aria-valuemax', '36')
  })

  it('falls back to the newest hours when the cached data predates now', async () => {
    // Every hourly point is at least a day old, as with a long-stale cache.
    mockFetch(EMPTY_ALERTS, [addDays(TODAY, -3), addDays(TODAY, -2)])
    renderAt('/weather/')

    expect(
      await screen.findByRole('heading', {
        name: 'Past 12 hours and next 24 hours',
      }),
    ).toBeInTheDocument()
    // Only the intersection renders: the last 12 available hours.
    const slider = screen.getByRole('slider', {
      name: 'Scrub through hours on the temperature chart',
    })
    expect(slider).toHaveAttribute('aria-valuemax', '11')
    // No current hour means no "Now" marker, and the scrubber rests on the
    // nearest available point instead.
    expect(slider).toHaveAttribute('aria-valuenow', '11')
    expect(screen.queryByText('Now')).not.toBeInTheDocument()
    // Rain that ended days ago is never announced.
    expect(screen.queryByText(/Rain likely/)).not.toBeInTheDocument()
  })

  it('renders the available intersection when history is truncated', async () => {
    freezeNycHour(TODAY, 6)
    // History starts at midnight today, six hours before now.
    mockFetch(EMPTY_ALERTS, [TODAY, addDays(TODAY, 1)])
    renderAt('/weather/')

    await screen.findByRole('heading', {
      name: 'Past 12 hours and next 24 hours',
    })
    const slider = screen.getByRole('slider', {
      name: 'Scrub through hours on the temperature chart',
    })
    // 6 past hours + now + the 24 hours that remain in the fixture.
    expect(slider).toHaveAttribute('aria-valuemax', '30')
    expect(slider).toHaveAttribute('aria-valuenow', '6')
  })
})

describe('weather weekly route', () => {
  it('renders the three 14-day charts', async () => {
    mockFetch()
    renderAt('/weather/weekly')

    expect(
      await screen.findByRole('heading', { name: 'Weekly' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Temperature (°F)')).toBeInTheDocument()
    expect(screen.getByText('Precipitation (%)')).toBeInTheDocument()
    expect(screen.getByText('Air Quality (US AQI)')).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Daily high and low temperature, past 7 days and next 7 days',
      }),
    ).toBeInTheDocument()
  })

  it('navigates to the hourly page when a day is tapped', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/weekly')

    await screen.findByRole('heading', { name: 'Weekly' })
    const tapTargets = screen.getAllByRole('button', {
      name: `View hourly details for ${formatDayLong(TODAY)}`,
    })
    await user.click(tapTargets[0])

    expect(
      await screen.findByRole('heading', {
        name: `Today, ${formatDayLong(TODAY)}`,
      }),
    ).toBeInTheDocument()
  })
})

describe('weather day route', () => {
  it('shows hourly charts and a rain window summary', async () => {
    mockFetch()
    const date = addDays(TODAY, 2)
    renderAt(`/weather/day/${date}`)

    expect(
      await screen.findByRole('heading', { name: formatDayLong(date) }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: `Hourly temperature for ${formatDayLong(date)}`,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Rain likely 2 PM–5 PM/)).toBeInTheDocument()
  })

  it('keeps the every-fourth-hour axis of a single-day window', async () => {
    mockFetch()
    const date = addDays(TODAY, 2)
    renderAt(`/weather/day/${date}`)

    await screen.findByRole('heading', { name: formatDayLong(date) })
    // A calendar day does not opt into the multi-day axis, so ticks stay on
    // indices 0, 4, 8 … and midnight is a plain hour label.
    expect(screen.getAllByText('4 AM')).toHaveLength(2)
    expect(screen.getAllByText('12 AM')).toHaveLength(2)
  })

  it('pages to the next day', async () => {
    mockFetch()
    const user = userEvent.setup()
    const date = addDays(TODAY, 2)
    renderAt(`/weather/day/${date}`)

    await screen.findByRole('heading', { name: formatDayLong(date) })
    await user.click(screen.getByRole('button', { name: 'Next day' }))

    expect(
      await screen.findByRole('heading', {
        name: formatDayLong(addDays(date, 1)),
      }),
    ).toBeInTheDocument()
  })
})

describe('weather alerts route', () => {
  it('shows the empty state when there are no alerts', async () => {
    mockFetch()
    renderAt('/weather/alerts')

    expect(
      await screen.findByText('No active alerts for NYC'),
    ).toBeInTheDocument()
  })

  it('renders alert cards and expands details', async () => {
    mockFetch(HEAT_ALERT)
    const user = userEvent.setup()
    renderAt('/weather/alerts')

    expect(await screen.findByText(/HEAT ADVISORY/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Read more/ }))
    expect(
      screen.getByText('Heat index values up to 100 expected.'),
    ).toBeInTheDocument()
  })
})

describe('offline behavior', () => {
  it('shows an error panel with retry when there is no cached data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    renderAt('/weather/')

    expect(
      await screen.findByText('Could not load weather data.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('shows stale cached charts with an offline banner', async () => {
    mockFetch()
    const { unmount } = renderAt('/weather/')
    await screen.findByText(/72°F/)
    unmount()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    renderAt('/weather/')

    expect(await screen.findByText(/Offline — showing data from/)).toBeInTheDocument()
    expect(screen.getByText(/72°F/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})

describe('chart scrubber', () => {
  it('shows the scrubber resting on today before any interaction', async () => {
    mockFetch()
    renderAt('/weather/weekly')

    await screen.findByRole('heading', { name: 'Weekly' })
    // Visible on all three charts without dragging.
    expect(screen.getAllByTestId('chart-scrubber')).toHaveLength(3)
    // Today is index 7; fixture temps are 80 + index / 60 + index.
    expect(
      screen.getByText(`${formatDayLong(TODAY)} · H 87° L 67°`),
    ).toBeInTheDocument()
    // The separate "Today" marker is suppressed so the two lines do not stack.
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
  })

  it('restores the Today marker once the scrubber moves away from it', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/weekly')

    await screen.findByRole('heading', { name: 'Weekly' })
    const slider = screen.getByRole('slider', {
      name: 'Scrub through days on the temperature chart',
    })
    slider.focus()
    await user.keyboard('{ArrowRight}')

    expect(screen.getAllByText('Today').length).toBeGreaterThan(0)
  })

  it('moves the scrubber with arrow keys and shows a readout on all charts', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/weekly')

    await screen.findByRole('heading', { name: 'Weekly' })

    const slider = screen.getByRole('slider', {
      name: 'Scrub through days on the temperature chart',
    })
    slider.focus()
    await user.keyboard('{ArrowRight}')

    // Today is index 7 in the 14-day window; ArrowRight moves to tomorrow.
    const tomorrow = addDays(TODAY, 1)
    // Fixture: temperature_2m_max = 80 + index, temperature_2m_min = 60 + index.
    expect(
      screen.getByText(`${formatDayLong(tomorrow)} · H 88° L 68°`),
    ).toBeInTheDocument()
    // The shared scrub index highlights every chart on the page.
    expect(screen.getAllByTestId('chart-scrubber')).toHaveLength(3)
    // Fixture: precipitation_sum = 0.1", surfaced alongside the chance.
    expect(
      screen.getByText(`${formatDayLong(tomorrow)} · 35% rain · 0.10"`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`${formatDayLong(tomorrow)} · AQI 45`),
    ).toBeInTheDocument()
  })

  it('labels rain amounts on the precipitation chart', async () => {
    mockFetch()
    renderAt('/weather/weekly')

    await screen.findByRole('heading', { name: 'Weekly' })
    // Right-hand amount axis top (bars max) plus the labelled wettest day.
    expect(screen.getAllByText('1.50"').length).toBeGreaterThan(0)
    expect(screen.getAllByText('0.10"').length).toBeGreaterThan(0)
    expect(
      screen.getByText(/show rain amount \(inches, right axis\)/),
    ).toBeInTheDocument()
  })

  it('scrubs through hours on the day page', async () => {
    mockFetch()
    const user = userEvent.setup()
    const date = addDays(TODAY, 2)
    renderAt(`/weather/day/${date}`)

    await screen.findByRole('heading', { name: formatDayLong(date) })
    const slider = screen.getByRole('slider', {
      name: 'Scrub through hours on the temperature chart',
    })
    slider.focus()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByText('1 AM · 70°')).toBeInTheDocument()
    expect(screen.getByText('1 AM · 10% rain')).toBeInTheDocument()
  })
})

describe('colorway picker', () => {
  async function openPicker(user: ReturnType<typeof userEvent.setup>) {
    const trigger = screen.getByRole('button', { name: /^Colorway: / })
    await user.click(trigger)
    return { trigger, listbox: screen.getByRole('listbox', { name: 'Colorway' }) }
  }

  it('names the trigger after the current palette without showing the name', async () => {
    mockFetch()
    renderAt('/weather/')

    await screen.findByText(/72°F/)
    const trigger = screen.getByRole('button', {
      name: 'Colorway: Classic Navy',
    })

    // The palette name is only ever inside the visually hidden wrapper; the
    // trigger itself renders swatches.
    expect(screen.getByText('Colorway: Classic Navy')).toHaveClass(
      styles.paletteSrName,
    )
    expect(
      trigger.querySelectorAll(`.${styles.paletteSwatch}`).length,
    ).toBeGreaterThanOrEqual(4)
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens a listbox of every registered palette, named but not labelled on screen', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')

    await screen.findByText(/72°F/)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    const { trigger, listbox } = await openPicker(user)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', listbox.id)

    const options = within(listbox).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual(
      PALETTES.map((palette) => palette.label),
    )
    options.forEach((option, index) => {
      const palette = PALETTES[index]
      expect(within(option).getByText(palette.label)).toHaveClass(
        styles.paletteSrName,
      )
      expect(option.querySelectorAll(`.${styles.paletteSwatch}`)).toHaveLength(
        palette.swatches.length,
      )
    })
  })

  it('marks the current palette selected and flags it non-chromatically', async () => {
    mockFetch()
    const user = userEvent.setup()
    window.localStorage.setItem('nyc-weather-palette', 'forest')
    renderAt('/weather/')

    await screen.findByText(/72°F/)
    await openPicker(user)

    const selected = screen.getByRole('option', { selected: true })
    expect(selected).toHaveTextContent('Forest Green')
    expect(selected).toHaveClass(styles.paletteOptionSelected)
    // A check glyph, not just a colour difference.
    expect(selected.querySelector(`.${styles.paletteCheck} svg`)).not.toBeNull()
    expect(screen.getAllByRole('option', { selected: false })).toHaveLength(
      PALETTES.length - 1,
    )
  })

  it('switches palettes by click, persists the choice and returns focus', async () => {
    mockFetch()
    const user = userEvent.setup()
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    const page = container.querySelector('[data-palette]')
    expect(page).toHaveAttribute('data-palette', 'classic')

    const { trigger } = await openPicker(user)
    await user.click(screen.getByRole('option', { name: 'Sunset Coral' }))

    expect(page).toHaveAttribute('data-palette', 'sunset')
    expect(window.localStorage.getItem('nyc-weather-palette')).toBe('sunset')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAccessibleName('Colorway: Sunset Coral')
  })

  it('applies a new NYC colorway and persists it', async () => {
    mockFetch()
    const user = userEvent.setup()
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    await openPicker(user)
    await user.click(screen.getByRole('option', { name: 'Taxi After Midnight' }))

    expect(container.querySelector('[data-palette]')).toHaveAttribute(
      'data-palette',
      'taxi-midnight',
    )
    expect(window.localStorage.getItem('nyc-weather-palette')).toBe(
      'taxi-midnight',
    )
  })

  it('opens with the keyboard and selects with Enter after arrowing', async () => {
    mockFetch()
    const user = userEvent.setup()
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    screen.getByRole('button', { name: /^Colorway: / }).focus()
    await user.keyboard('{Enter}')

    // Opening lands on the current selection.
    expect(screen.getByRole('option', { name: PALETTES[0].label })).toHaveFocus()

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: PALETTES[2].label })).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: PALETTES[1].label })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(container.querySelector('[data-palette]')).toHaveAttribute(
      'data-palette',
      PALETTES[1].id,
    )
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('jumps to the first and last palette with Home and End', async () => {
    mockFetch()
    const user = userEvent.setup()
    const { container } = renderAt('/weather/')
    const last = PALETTES[PALETTES.length - 1]

    await screen.findByText(/72°F/)
    await openPicker(user)

    await user.keyboard('{End}')
    expect(screen.getByRole('option', { name: last.label })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('option', { name: PALETTES[0].label })).toHaveFocus()

    await user.keyboard('{End} ')
    expect(container.querySelector('[data-palette]')).toHaveAttribute(
      'data-palette',
      last.id,
    )
  })

  it('wraps arrow navigation at both ends', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')
    const last = PALETTES[PALETTES.length - 1]

    await screen.findByText(/72°F/)
    await openPicker(user)

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: last.label })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: PALETTES[0].label })).toHaveFocus()
  })

  it('closes on Escape without changing the palette and restores focus', async () => {
    mockFetch()
    const user = userEvent.setup()
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    const { trigger } = await openPicker(user)

    await user.keyboard('{ArrowDown}{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('[data-palette]')).toHaveAttribute(
      'data-palette',
      'classic',
    )
  })

  it('does not trap Tab inside the popup', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')

    await screen.findByText(/72°F/)
    const { trigger } = await openPicker(user)

    await user.tab()

    // Focus escapes the picker entirely rather than cycling inside it.
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).not.toHaveFocus()
    expect(document.activeElement).not.toBe(document.body)
    expect(
      trigger.closest(`.${styles.palettePicker}`)?.contains(document.activeElement),
    ).toBe(false)
  })

  it('dismisses on click-away', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')

    await screen.findByText(/72°F/)
    await openPicker(user)

    await user.click(screen.getByText('Colorway'))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes again when the trigger is clicked a second time', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderAt('/weather/')

    await screen.findByText(/72°F/)
    const { trigger } = await openPicker(user)

    await user.click(trigger)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('restores a stored palette on load', async () => {
    mockFetch()
    window.localStorage.setItem('nyc-weather-palette', 'forest')
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    expect(container.querySelector('[data-palette]')).toHaveAttribute(
      'data-palette',
      'forest',
    )
    expect(
      screen.getByRole('button', { name: 'Colorway: Forest Green' }),
    ).toBeInTheDocument()
  })

  it('restores a stored NYC colorway on load', async () => {
    mockFetch()
    window.localStorage.setItem('nyc-weather-palette', 'coney-island-neon')
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    expect(container.querySelector('[data-palette]')).toHaveAttribute(
      'data-palette',
      'coney-island-neon',
    )
  })

  it('keeps the selected palette and the open popup when light/dark toggles', async () => {
    mockFetch()
    const user = userEvent.setup()
    window.localStorage.setItem('nyc-weather-palette', 'harbor-fog')
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    const page = container.querySelector('[data-palette]')
    expect(page).toHaveAttribute('data-theme', 'light')
    expect(page).toHaveAttribute('data-palette', 'harbor-fog')

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(page).toHaveAttribute('data-theme', 'dark')
    expect(page).toHaveAttribute('data-palette', 'harbor-fog')

    // The picker still works, and still reports the same palette, in dark mode.
    await openPicker(user)
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(
      'Harbor Fog',
    )
    await user.keyboard('{Escape}')

    await user.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    )
    expect(page).toHaveAttribute('data-theme', 'light')
    expect(page).toHaveAttribute('data-palette', 'harbor-fog')
    expect(window.localStorage.getItem('nyc-weather-palette')).toBe('harbor-fog')
  })

  it('falls back to classic when the stored palette id is not valid', async () => {
    mockFetch()
    window.localStorage.setItem('nyc-weather-palette', 'midtown-mystery')
    const { container } = renderAt('/weather/')

    await screen.findByText(/72°F/)
    expect(container.querySelector('[data-palette]')).toHaveAttribute(
      'data-palette',
      'classic',
    )
  })
})
