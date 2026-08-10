import { useCallback, useEffect, useRef, useState } from 'react'
import {
  decodeFeed,
  extractArrivals,
  feedTimestamp,
  type Arrival,
} from '../data/arrivals'
import { feedUrl, feedsForRoutes } from '../data/feeds'
import type { Station } from '../types'

export const POLL_INTERVAL_MS = 25_000

export type ArrivalsStatus = 'loading' | 'ready' | 'error'

export type ArrivalsState = {
  status: ArrivalsStatus
  arrivals: Arrival[]
  /** Epoch ms of the last successful refresh. */
  updatedAt: number | null
  refresh: () => void
}

/**
 * Live arrivals for a station, polled from the MTA GTFS-Realtime feeds.
 *
 * - Fetches only the feeds covering the station's routes
 * - Polls every 25s while the tab is visible
 * - Pauses when the tab is hidden and refreshes immediately on return
 * - Keeps the previous arrivals visible during background refreshes
 */
export default function useArrivals(station: Station | undefined): ArrivalsState {
  const [status, setStatus] = useState<ArrivalsStatus>('loading')
  const [arrivals, setArrivals] = useState<Arrival[]>([])
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stationId = station?.id

  const load = useCallback(async () => {
    if (!station) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const feeds = feedsForRoutes(station.routes)
      const buffers = await Promise.all(
        feeds.map(async (feedId) => {
          const response = await fetch(feedUrl(feedId), {
            signal: controller.signal,
          })
          if (!response.ok) {
            throw new Error(`Feed ${feedId} responded ${response.status}`)
          }
          return response.arrayBuffer()
        }),
      )
      if (controller.signal.aborted) return

      const now = Date.now() / 1000
      const merged: Arrival[] = []
      let newestFeedTimestamp = 0
      for (const buffer of buffers) {
        const feed = decodeFeed(buffer)
        newestFeedTimestamp = Math.max(
          newestFeedTimestamp,
          feedTimestamp(feed) ?? 0,
        )
        merged.push(...extractArrivals(feed, station, now))
      }
      merged.sort((a, b) => a.time - b.time)

      setArrivals(merged)
      setUpdatedAt(newestFeedTimestamp > 0 ? newestFeedTimestamp * 1000 : Date.now())
      setStatus('ready')
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setStatus((current) => (current === 'ready' ? 'ready' : 'error'))
    }
  }, [station])

  useEffect(() => {
    if (!stationId) return undefined
    let cancelled = false

    const scheduleNext = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(runPoll, POLL_INTERVAL_MS)
    }

    const runPoll = () => {
      if (cancelled) return
      if (document.visibilityState === 'hidden') return
      void load().finally(() => {
        if (!cancelled && document.visibilityState !== 'hidden') scheduleNext()
      })
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (timerRef.current !== null) clearTimeout(timerRef.current)
        abortRef.current?.abort()
      } else {
        runPoll()
      }
    }

    setStatus('loading')
    setArrivals([])
    setUpdatedAt(null)
    runPoll()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [stationId, load])

  const refresh = useCallback(() => {
    void load()
  }, [load])

  return { status, arrivals, updatedAt, refresh }
}
