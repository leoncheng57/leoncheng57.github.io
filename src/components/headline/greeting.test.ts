import { describe, expect, it } from 'vitest'
import { getGreeting } from './greeting'

describe('getGreeting', () => {
  it('returns Good Evening just before the morning boundary', () => {
    expect(getGreeting(4)).toEqual({ label: 'Good Evening', emoji: '🌙' })
  })

  it('returns Good Morning from 05:00', () => {
    expect(getGreeting(5)).toEqual({ label: 'Good Morning', emoji: '☀️' })
    expect(getGreeting(11)).toEqual({ label: 'Good Morning', emoji: '☀️' })
  })

  it('returns Good Afternoon from noon', () => {
    expect(getGreeting(12)).toEqual({ label: 'Good Afternoon', emoji: '☁️' })
    expect(getGreeting(17)).toEqual({ label: 'Good Afternoon', emoji: '☁️' })
  })

  it('returns Good Evening from 18:00 through the night', () => {
    expect(getGreeting(18)).toEqual({ label: 'Good Evening', emoji: '🌙' })
    expect(getGreeting(23)).toEqual({ label: 'Good Evening', emoji: '🌙' })
    expect(getGreeting(0)).toEqual({ label: 'Good Evening', emoji: '🌙' })
  })
})
