/**
 * MTA GTFS-Realtime feed endpoints. The feeds are keyless and CORS-open, so
 * the browser fetches them directly (verified in issue #112).
 */
const FEED_BASE = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F'

export const FEED_IDS = [
  'gtfs',
  'gtfs-ace',
  'gtfs-bdfm',
  'gtfs-g',
  'gtfs-jz',
  'gtfs-l',
  'gtfs-nqrw',
  'gtfs-si',
] as const

export type FeedId = (typeof FEED_IDS)[number]

const ROUTE_TO_FEED: Record<string, FeedId> = {
  '1': 'gtfs',
  '2': 'gtfs',
  '3': 'gtfs',
  '4': 'gtfs',
  '5': 'gtfs',
  '6': 'gtfs',
  '7': 'gtfs',
  GS: 'gtfs',
  A: 'gtfs-ace',
  C: 'gtfs-ace',
  E: 'gtfs-ace',
  H: 'gtfs-ace',
  B: 'gtfs-bdfm',
  D: 'gtfs-bdfm',
  F: 'gtfs-bdfm',
  M: 'gtfs-bdfm',
  FS: 'gtfs-bdfm',
  G: 'gtfs-g',
  J: 'gtfs-jz',
  Z: 'gtfs-jz',
  L: 'gtfs-l',
  N: 'gtfs-nqrw',
  Q: 'gtfs-nqrw',
  R: 'gtfs-nqrw',
  W: 'gtfs-nqrw',
  SI: 'gtfs-si',
  SIR: 'gtfs-si',
}

/**
 * Feeds carrying any of the given routes. The station dataset labels all
 * three shuttles as "S", and each shuttle lives in a different feed, so "S"
 * fans out to every feed with a shuttle; arrivals are filtered by stop ID
 * afterwards, which makes the extra feeds harmless.
 */
export function feedsForRoutes(routes: string[]): FeedId[] {
  const feeds = new Set<FeedId>()
  for (const route of routes) {
    if (route === 'S') {
      feeds.add('gtfs')
      feeds.add('gtfs-ace')
      feeds.add('gtfs-bdfm')
    } else {
      const feed = ROUTE_TO_FEED[route]
      if (feed) feeds.add(feed)
    }
  }
  return [...feeds]
}

export function feedUrl(feedId: FeedId): string {
  return `${FEED_BASE}${feedId}`
}
