import { describe, expect, it } from 'vitest'
import { relativeDayLabel } from './RelativeDate'

describe('relative calendar dates', () => {
  const today = new Date(2026, 8, 17, 0, 1)
  it('formats today, singular and plural days', () => {
    expect(relativeDayLabel('2026-09-17', today)).toBe('Today')
    expect(relativeDayLabel('2026-09-16', today)).toBe('1 day ago')
    expect(relativeDayLabel('2026-08-30', today)).toBe('18 days ago')
  })
  it('counts calendar days across daylight saving changes', () => {
    expect(relativeDayLabel('2026-03-07', new Date(2026, 2, 9, 0, 1))).toBe('2 days ago')
  })
  it('handles future dates without negative days ago', () => {
    expect(relativeDayLabel('2026-09-18', today)).toBe('In 1 day')
  })
})
