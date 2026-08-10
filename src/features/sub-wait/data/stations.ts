import type { Direction, Station } from '../types'
import rawStations from './stations.json'

export const STATIONS: Station[] = rawStations as Station[]

const stationsById = new Map(STATIONS.map((station) => [station.id, station]))

export function getStation(id: string): Station | undefined {
  return stationsById.get(id)
}

export function directionLabel(
  station: Station,
  direction: Direction,
): string | null {
  return direction === 'N' ? station.northLabel : station.southLabel
}

/** Boroughs in display order for the station directory. */
export const BOROUGHS = [
  'Manhattan',
  'Brooklyn',
  'Queens',
  'The Bronx',
  'Staten Island',
]

export function stationsByBorough(borough: string): Station[] {
  return STATIONS.filter((station) => station.borough === borough).sort(
    (a, b) => a.name.localeCompare(b.name),
  )
}
