import { describe, expect, it } from 'vitest'
import { STATIONS } from './stations'
import { feedUrl, feedsForRoutes, type FeedId } from './feeds'

describe('feed selection', () => {
  it('maps single-feed stations to one feed', () => {
    expect(feedsForRoutes(['F'])).toEqual(['gtfs-bdfm'])
    expect(feedsForRoutes(['L'])).toEqual(['gtfs-l'])
  })

  it('merges feeds for multi-line stations', () => {
    expect(feedsForRoutes(['B', 'D', 'N', 'Q']).sort()).toEqual([
      'gtfs-bdfm',
      'gtfs-nqrw',
    ])
  })

  it('fans the ambiguous S shuttle out to every feed with a shuttle', () => {
    const feeds = feedsForRoutes(['S'])
    expect(feeds).toContain('gtfs')
    expect(feeds).toContain('gtfs-ace')
    expect(feeds).toContain('gtfs-bdfm')
  })

  it('covers every route in the stations dataset', () => {
    const allRoutes = new Set(STATIONS.flatMap((station) => station.routes))
    for (const route of allRoutes) {
      expect(
        feedsForRoutes([route]).length,
        `route ${route} has no feed`,
      ).toBeGreaterThan(0)
    }
  })

  it('builds MTA endpoint URLs', () => {
    const id: FeedId = 'gtfs-bdfm'
    expect(feedUrl(id)).toBe(
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
    )
  })
})
