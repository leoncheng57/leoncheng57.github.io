import type { Station } from '../types'

export type MapPoint = { x: number; y: number }

export type MapProjection = {
  width: number
  height: number
  project: (_lat: number, _lon: number) => MapPoint
}

/**
 * Equirectangular projection of the subway system onto a fixed-size canvas,
 * with longitude scaled by cos(latitude) so distances look right at NYC's
 * latitude. Good enough for a schematic map; no tiles required.
 */
export function buildProjection(
  stations: Station[],
  width: number,
  padding: number,
): MapProjection {
  const lats = stations.map((station) => station.lat)
  const lons = stations.map((station) => station.lon)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)

  const midLatRadians = ((minLat + maxLat) / 2) * (Math.PI / 180)
  const lonScale = Math.cos(midLatRadians)

  const spanX = (maxLon - minLon) * lonScale
  const spanY = maxLat - minLat
  const innerWidth = width - padding * 2
  const unit = innerWidth / spanX
  const height = spanY * unit + padding * 2

  return {
    width,
    height,
    project: (lat, lon) => ({
      x: padding + (lon - minLon) * lonScale * unit,
      // Latitude grows north; SVG y grows down.
      y: padding + (maxLat - lat) * unit,
    }),
  }
}
