import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { describe, expect, it } from 'vitest'
import {
  decodeFeed,
  extractArrivals,
  feedTimestamp,
  formatMinutes,
  minutesUntil,
} from './arrivals'
import { getStation } from './stations'

const { transit_realtime: rt } = GtfsRealtimeBindings

const NOW = 1_700_000_000

export function buildFeedBuffer(): ArrayBuffer {
  const message = rt.FeedMessage.create({
    header: { gtfsRealtimeVersion: '2.0', timestamp: NOW },
    entity: [
      {
        id: '1',
        tripUpdate: {
          trip: { tripId: 'trip-f-south', routeId: 'F' },
          stopTimeUpdate: [
            { stopId: 'F16S', arrival: { time: NOW + 120 } },
            // Coney Island-Stillwell Av is the trip's final stop.
            { stopId: 'D43S', arrival: { time: NOW + 2400 } },
          ],
        },
      },
      {
        id: '2',
        tripUpdate: {
          trip: { tripId: 'trip-f-north', routeId: 'F' },
          stopTimeUpdate: [
            { stopId: 'F16N', arrival: { time: NOW + 480 } },
            // Jamaica-179 St terminal.
            { stopId: 'F01N', arrival: { time: NOW + 3600 } },
          ],
        },
      },
      {
        id: '3',
        tripUpdate: {
          trip: { tripId: 'trip-departed', routeId: 'F' },
          stopTimeUpdate: [
            // Already passed this station; should be excluded.
            { stopId: 'F16S', arrival: { time: NOW - 60 } },
            { stopId: 'D43S', arrival: { time: NOW + 1200 } },
          ],
        },
      },
      {
        id: '4',
        tripUpdate: {
          trip: { tripId: 'trip-elsewhere', routeId: 'F' },
          stopTimeUpdate: [{ stopId: 'F20S', arrival: { time: NOW + 300 } }],
        },
      },
    ],
  })
  const bytes = rt.FeedMessage.encode(message).finish()
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

describe('arrivals extraction', () => {
  const station = getStation('F16')
  if (!station) throw new Error('East Broadway missing from stations data')

  it('decodes the feed header timestamp', () => {
    const feed = decodeFeed(buildFeedBuffer())
    expect(feedTimestamp(feed)).toBe(NOW)
  })

  it('extracts upcoming arrivals for the station only, sorted by time', () => {
    const feed = decodeFeed(buildFeedBuffer())
    const arrivals = extractArrivals(feed, station, NOW)
    expect(arrivals).toHaveLength(2)
    expect(arrivals[0]).toMatchObject({
      route: 'F',
      direction: 'S',
      time: NOW + 120,
      destination: 'Coney Island-Stillwell Av',
    })
    expect(arrivals[1]).toMatchObject({
      route: 'F',
      direction: 'N',
      time: NOW + 480,
      destination: 'Jamaica-179 St',
    })
  })

  it('drops arrivals that already happened', () => {
    const feed = decodeFeed(buildFeedBuffer())
    const arrivals = extractArrivals(feed, station, NOW)
    expect(
      arrivals.find((arrival) => arrival.tripId === 'trip-departed'),
    ).toBeUndefined()
  })

  it('formats minutes until arrival', () => {
    const feed = decodeFeed(buildFeedBuffer())
    const [soonest] = extractArrivals(feed, station, NOW)
    expect(minutesUntil(soonest, NOW)).toBe(2)
    expect(formatMinutes(2)).toBe('2m')
    expect(formatMinutes(0)).toBe('<1m')
  })
})
