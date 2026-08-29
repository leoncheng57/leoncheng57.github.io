import { describe, expect, it } from 'vitest'
import {
  addDays,
  aqiCategory,
  formatDayLong,
  formatDayOfMonth,
  formatHourLabel,
  formatWeekday,
  isValidIsoDate,
  nycToday,
  weatherCodeInfo,
} from './format'

describe('nycToday', () => {
  it('returns the New York calendar date for a UTC instant', () => {
    // 2026-08-20T03:00Z is still 11 PM on Aug 19 in New York (UTC-4).
    expect(nycToday(new Date('2026-08-20T03:00:00Z'))).toBe('2026-08-19')
    expect(nycToday(new Date('2026-08-20T12:00:00Z'))).toBe('2026-08-20')
  })
})

describe('isValidIsoDate', () => {
  it('accepts YYYY-MM-DD and rejects everything else', () => {
    expect(isValidIsoDate('2026-08-20')).toBe(true)
    expect(isValidIsoDate('2026-8-20')).toBe(false)
    expect(isValidIsoDate('not-a-date')).toBe(false)
    expect(isValidIsoDate('2026-13-99')).toBe(false)
  })
})

describe('date formatting', () => {
  it('formats labels without timezone drift', () => {
    expect(formatDayLong('2026-08-20')).toBe('Thu, Aug 20')
    expect(formatWeekday('2026-08-20')).toBe('Thu')
    expect(formatDayOfMonth('2026-08-05')).toBe('5')
  })

  it('formats hour labels in 12-hour time', () => {
    expect(formatHourLabel('2026-08-20T00:00')).toBe('12 AM')
    expect(formatHourLabel('2026-08-20T09:00')).toBe('9 AM')
    expect(formatHourLabel('2026-08-20T12:00')).toBe('12 PM')
    expect(formatHourLabel('2026-08-20T15:00')).toBe('3 PM')
  })
})

describe('addDays', () => {
  it('adds and subtracts calendar days across month boundaries', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addDays('2026-08-01', -1)).toBe('2026-07-31')
  })
})

describe('aqiCategory', () => {
  it('maps AQI values onto EPA categories', () => {
    expect(aqiCategory(0).label).toBe('Good')
    expect(aqiCategory(50).label).toBe('Good')
    expect(aqiCategory(51).label).toBe('Moderate')
    expect(aqiCategory(101).label).toBe('Unhealthy for Sensitive Groups')
    expect(aqiCategory(151).label).toBe('Unhealthy')
    expect(aqiCategory(201).label).toBe('Very Unhealthy')
    expect(aqiCategory(301).label).toBe('Hazardous')
  })
})

describe('weatherCodeInfo', () => {
  it('maps WMO codes to labels', () => {
    expect(weatherCodeInfo(0).label).toBe('Clear')
    expect(weatherCodeInfo(2).label).toBe('Partly cloudy')
    expect(weatherCodeInfo(63).label).toBe('Rain')
    expect(weatherCodeInfo(75).label).toBe('Snow')
    expect(weatherCodeInfo(95).label).toBe('Thunderstorm')
    expect(weatherCodeInfo(null).label).toBe('Unknown')
  })
})
