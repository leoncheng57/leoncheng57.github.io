import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import type { Direction, Station } from '../types'
import { getStation } from './stations'

const { transit_realtime: rt } = GtfsRealtimeBindings

export type Arrival = {
  tripId: string
  route: string
  direction: Direction
  /** Epoch seconds of the predicted arrival at this station. */
  time: number
  /** Name of the trip's final stop, e.g. "Coney Island-Stillwell Av". */
  destination: string | null
}

/** Long-safe conversion for protobuf int64 fields. */
function toNumber(value: number | { toNumber(): number } | null | undefined): number | null {
  if (value === null || value === undefined) return null
  return typeof value === 'number' ? value : value.toNumber()
}

function destinationName(lastStopId: string | null): string | null {
  if (!lastStopId) return null
  const station = getStation(lastStopId.replace(/[NS]$/, ''))
  return station?.name ?? null
}

export type DecodedFeed = GtfsRealtimeBindings.transit_realtime.IFeedMessage

export function decodeFeed(buffer: ArrayBuffer): DecodedFeed {
  return rt.FeedMessage.decode(new Uint8Array(buffer))
}

export function feedTimestamp(feed: DecodedFeed): number | null {
  return toNumber(feed.header?.timestamp ?? null)
}

/**
 * Extracts upcoming arrivals at a station from a decoded GTFS-RT feed.
 * Stop IDs in the feed are the station's GTFS stop ID plus an N/S suffix.
 */
export function extractArrivals(
  feed: DecodedFeed,
  station: Station,
  nowEpochSeconds: number,
): Arrival[] {
  const arrivals: Arrival[] = []
  for (const entity of feed.entity ?? []) {
    const tripUpdate = entity.tripUpdate
    if (!tripUpdate) continue
    const stopTimeUpdates = tripUpdate.stopTimeUpdate ?? []
    if (stopTimeUpdates.length === 0) continue
    const lastStopId = stopTimeUpdates[stopTimeUpdates.length - 1]?.stopId ?? null

    for (const update of stopTimeUpdates) {
      const stopId = update.stopId
      if (!stopId || !stopId.startsWith(station.id)) continue
      const suffix = stopId.slice(station.id.length)
      if (suffix !== 'N' && suffix !== 'S') continue
      const time =
        toNumber(update.arrival?.time) ?? toNumber(update.departure?.time)
      if (time === null || time < nowEpochSeconds) continue
      arrivals.push({
        tripId: tripUpdate.trip?.tripId ?? '',
        route: tripUpdate.trip?.routeId ?? '',
        direction: suffix,
        time,
        destination: destinationName(lastStopId),
      })
    }
  }
  return arrivals.sort((a, b) => a.time - b.time)
}

export function minutesUntil(
  arrival: Arrival,
  nowEpochSeconds: number,
): number {
  return Math.max(0, Math.round((arrival.time - nowEpochSeconds) / 60))
}

export function formatMinutes(minutes: number): string {
  return minutes < 1 ? '<1m' : `${minutes}m`
}
