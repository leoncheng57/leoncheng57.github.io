import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays, formatDayLong, nycToday } from '../utils/format'
import WeatherRoute from './WeatherRoute'

const TODAY = nycToday()

function buildDates(): string[] {
  const dates: string[] = []
  for (let offset = -7; offset <= 6; offset += 1) {
    dates.push(addDays(TODAY, offset))
  }
  return dates
}

function buildForecastResponse() {
  const dates = buildDates()
  const hourlyTime: string[] = []
  dates.forEach((date) => {
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

function buildAirQualityResponse() {
  const forecast = buildForecastResponse()
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

function mockFetch(alertsBody: unknown = EMPTY_ALERTS): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      let body: unknown
      // Check air quality first: its hostname contains 'api.open-meteo.com'.
      if (url.includes('air-quality-api.open-meteo.com')) {
        body = buildAirQualityResponse()
      } else if (url.includes('api.open-meteo.com')) {
        body = buildForecastResponse()
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
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('weather home route', () => {
  it('renders current conditions and the three charts', async () => {
    mockFetch()
    renderAt('/weather/')

    expect(await screen.findByText(/72°F/)).toBeInTheDocument()
    expect(screen.getByText(/AQI 42/)).toBeInTheDocument()
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
    renderAt('/weather/')

    await screen.findByText(/72°F/)
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

describe('weather week route', () => {
  it('lists the next 7 days and the past 7 days', async () => {
    mockFetch()
    renderAt('/weather/week')

    const upcoming = await screen.findByRole('region', { name: 'Next 7 days' })
    expect(within(upcoming).getByText('Today')).toBeInTheDocument()
    expect(within(upcoming).getAllByRole('link')).toHaveLength(7)

    const past = screen.getByRole('region', { name: 'Past 7 days' })
    expect(within(past).getAllByRole('link')).toHaveLength(7)
    expect(
      within(past).getByText(formatDayLong(addDays(TODAY, -7))),
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
