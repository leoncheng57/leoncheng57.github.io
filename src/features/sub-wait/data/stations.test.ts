import { describe, expect, it } from 'vitest'
import {
  BOROUGHS,
  STATIONS,
  directionLabel,
  getStation,
  stationsByBorough,
} from './stations'

describe('stations data', () => {
  it('contains the full subway system', () => {
    expect(STATIONS.length).toBeGreaterThan(450)
  })

  it('has unique GTFS stop IDs', () => {
    const ids = new Set(STATIONS.map((station) => station.id))
    expect(ids.size).toBe(STATIONS.length)
  })

  it('has complete core fields on every station', () => {
    for (const station of STATIONS) {
      expect(station.id).toMatch(/^[A-Z0-9]{3,4}$/)
      expect(station.name.length).toBeGreaterThan(0)
      expect(BOROUGHS).toContain(station.borough)
      expect(station.routes.length).toBeGreaterThan(0)
    }
  })

  it('has coordinates within the NYC area', () => {
    for (const station of STATIONS) {
      expect(station.lat).toBeGreaterThan(40.4)
      expect(station.lat).toBeLessThan(41.0)
      expect(station.lon).toBeGreaterThan(-74.3)
      expect(station.lon).toBeLessThan(-73.6)
    }
  })

  it('has at least one direction label on every station', () => {
    // Terminals can miss one label, but never both.
    for (const station of STATIONS) {
      expect(
        station.northLabel !== null || station.southLabel !== null,
        `${station.id} ${station.name} has no direction labels`,
      ).toBe(true)
    }
  })

  it('looks up East Broadway with its direction labels', () => {
    const station = getStation('F16')
    expect(station?.name).toBe('East Broadway')
    expect(station && directionLabel(station, 'N')).toBe('Uptown & Queens')
    expect(station && directionLabel(station, 'S')).toBe('Brooklyn')
  })

  it('groups stations by borough sorted by name', () => {
    const manhattan = stationsByBorough('Manhattan')
    expect(manhattan.length).toBeGreaterThan(100)
    const names = manhattan.map((station) => station.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
})
