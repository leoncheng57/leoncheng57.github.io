import { describe, expect, it } from 'vitest'
import { airQualityUrl, forecastUrl, parseWeather } from './openMeteo'

describe('forecastUrl', () => {
  it('requests 7 past and 7 forecast days in NYC time with imperial units', () => {
    const url = new URL(forecastUrl())
    expect(url.hostname).toBe('api.open-meteo.com')
    expect(url.searchParams.get('past_days')).toBe('7')
    expect(url.searchParams.get('forecast_days')).toBe('7')
    expect(url.searchParams.get('timezone')).toBe('America/New_York')
    expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit')
    expect(url.searchParams.get('precipitation_unit')).toBe('inch')
    expect(url.searchParams.get('daily')).toContain('temperature_2m_max')
    expect(url.searchParams.get('daily')).toContain(
      'precipitation_probability_max',
    )
    expect(url.searchParams.get('hourly')).toContain('temperature_2m')
    expect(url.searchParams.get('current')).toContain('weather_code')
  })
})

describe('airQualityUrl', () => {
  it('requests hourly and current US AQI over the same window', () => {
    const url = new URL(airQualityUrl())
    expect(url.hostname).toBe('air-quality-api.open-meteo.com')
    expect(url.searchParams.get('hourly')).toBe('us_aqi')
    expect(url.searchParams.get('current')).toBe('us_aqi')
    expect(url.searchParams.get('past_days')).toBe('7')
    expect(url.searchParams.get('forecast_days')).toBe('7')
  })
})

describe('parseWeather', () => {
  const forecast = {
    current: { temperature_2m: 72.4, weather_code: 2, is_day: 1 },
    daily: {
      time: ['2026-08-19', '2026-08-20'],
      weather_code: [61, 2],
      temperature_2m_max: [81.1, 84.3],
      temperature_2m_min: [66.0, 68.2],
      precipitation_probability_max: [80, 20],
      precipitation_sum: [0.42, 0],
    },
    hourly: {
      time: ['2026-08-19T00:00', '2026-08-19T01:00', '2026-08-20T00:00'],
      temperature_2m: [70.1, 69.5, 71.0],
      precipitation_probability: [60, 75, 10],
      precipitation: [0.1, 0.2, 0],
    },
  }
  const airQuality = {
    current: { us_aqi: 42 },
    hourly: {
      time: ['2026-08-19T00:00', '2026-08-19T01:00', '2026-08-20T00:00'],
      us_aqi: [38, 55, 41],
    },
  }

  it('normalizes daily points and takes the max hourly AQI per day', () => {
    const data = parseWeather(forecast, airQuality, 1_000)

    expect(data.fetchedAt).toBe(1_000)
    expect(data.daily).toHaveLength(2)
    expect(data.daily[0]).toEqual({
      date: '2026-08-19',
      tempMax: 81.1,
      tempMin: 66.0,
      precipProbMax: 80,
      precipSum: 0.42,
      weatherCode: 61,
      aqiMax: 55,
    })
    expect(data.daily[1].aqiMax).toBe(41)
  })

  it('joins hourly AQI onto hourly weather by timestamp', () => {
    const data = parseWeather(forecast, airQuality, 0)

    expect(data.hourly).toHaveLength(3)
    expect(data.hourly[1]).toEqual({
      time: '2026-08-19T01:00',
      temp: 69.5,
      precipProb: 75,
      precipitation: 0.2,
      usAqi: 55,
    })
  })

  it('keeps current conditions including AQI', () => {
    const data = parseWeather(forecast, airQuality, 0)

    expect(data.current).toEqual({
      temp: 72.4,
      weatherCode: 2,
      isDay: true,
      usAqi: 42,
    })
  })

  it('tolerates missing AQI data and null holes', () => {
    const data = parseWeather(
      {
        ...forecast,
        daily: { ...forecast.daily, temperature_2m_max: [null, 84.3] },
      },
      {},
      0,
    )

    expect(data.daily[0].tempMax).toBeNull()
    expect(data.daily[0].aqiMax).toBeNull()
    expect(data.hourly[0].usAqi).toBeNull()
    expect(data.current.usAqi).toBeNull()
  })
})
