import { describe, expect, it } from 'vitest'
import { getGreeting } from './greeting'

describe('getGreeting', () => {
  it('returns good evening just before the morning boundary', () => {
    expect(getGreeting(4)).toEqual({ label: 'good evening', emoji: '🌙' })
  })

  it('returns good morning from 05:00', () => {
    expect(getGreeting(5)).toEqual({ label: 'good morning', emoji: '🌅' })
    expect(getGreeting(11)).toEqual({ label: 'good morning', emoji: '🌅' })
  })

  it('returns good afternoon from noon', () => {
    expect(getGreeting(12)).toEqual({ label: 'good afternoon', emoji: '☀️' })
    expect(getGreeting(17)).toEqual({ label: 'good afternoon', emoji: '☀️' })
  })

  it('returns good evening from 18:00 through the night', () => {
    expect(getGreeting(18)).toEqual({ label: 'good evening', emoji: '🌙' })
    expect(getGreeting(23)).toEqual({ label: 'good evening', emoji: '🌙' })
    expect(getGreeting(0)).toEqual({ label: 'good evening', emoji: '🌙' })
  })
})
