import { describe, expect, it } from 'vitest'
import { STATIONS } from '../data/stations'
import { distanceMeters, nearestStations, walkMinutes } from './distance'

describe('distance utilities', () => {
  it('computes zero distance for identical points', () => {
    expect(distanceMeters(40.7, -74.0, 40.7, -74.0)).toBe(0)
  })

  it('computes a plausible cross-town distance', () => {
    // East Broadway (F16) to Delancey St-Essex St (F15) is roughly 560m.
    const meters = distanceMeters(40.713715, -73.990173, 40.718611, -73.988114)
    expect(meters).toBeGreaterThan(400)
    expect(meters).toBeLessThan(700)
  })

  it('estimates walking minutes at a casual pace', () => {
    expect(walkMinutes(80)).toBe(1)
    expect(walkMinutes(400)).toBe(5)
    expect(walkMinutes(10)).toBe(1)
  })

  it('returns the closest stations sorted by distance', () => {
    // Standing at East Broadway.
    const nearby = nearestStations(STATIONS, 40.713715, -73.990173, 3)
    expect(nearby).toHaveLength(3)
    expect(nearby[0].station.id).toBe('F16')
    expect(nearby[0].meters).toBeLessThan(50)
    expect(nearby[1].meters).toBeGreaterThanOrEqual(nearby[0].meters)
    expect(nearby[2].meters).toBeGreaterThanOrEqual(nearby[1].meters)
  })
})
