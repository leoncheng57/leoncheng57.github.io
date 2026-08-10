import type { Station } from '../types'

const EARTH_RADIUS_METERS = 6_371_000
/** Casual walking pace used for rough walk-time estimates. */
const WALK_METERS_PER_MINUTE = 80

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Great-circle distance in meters between two coordinates. */
export function distanceMeters(
  latA: number,
  lonA: number,
  latB: number,
  lonB: number,
): number {
  const dLat = toRadians(latB - latA)
  const dLon = toRadians(lonB - lonA)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a))
}

export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / WALK_METERS_PER_MINUTE))
}

export type NearbyStation = { station: Station; meters: number }

export function nearestStations(
  stations: Station[],
  lat: number,
  lon: number,
  limit: number,
): NearbyStation[] {
  return stations
    .map((station) => ({
      station,
      meters: distanceMeters(lat, lon, station.lat, station.lon),
    }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, limit)
}
