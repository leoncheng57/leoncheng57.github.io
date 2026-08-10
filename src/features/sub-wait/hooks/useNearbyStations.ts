import { useCallback, useEffect, useState } from 'react'
import { STATIONS } from '../data/stations'
import { nearestStations, type NearbyStation } from '../utils/distance'

const NEARBY_LIMIT = 5
const AUTO_LOCATE_KEY = 'sub-wait-auto-locate'

export type NearbyStatus =
  | 'idle'
  | 'locating'
  | 'ready'
  | 'denied'
  | 'unavailable'

export type NearbyState = {
  status: NearbyStatus
  nearby: NearbyStation[]
  locate: () => void
}

/**
 * Nearest stations via the Geolocation API. Location is only requested after
 * the user asks; once granted, the choice is remembered so future visits
 * locate automatically.
 */
export default function useNearbyStations(): NearbyState {
  const [status, setStatus] = useState<NearbyStatus>('idle')
  const [nearby, setNearby] = useState<NearbyStation[]>([])

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearby(
          nearestStations(
            STATIONS,
            position.coords.latitude,
            position.coords.longitude,
            NEARBY_LIMIT,
          ),
        )
        setStatus('ready')
        try {
          window.localStorage.setItem(AUTO_LOCATE_KEY, 'true')
        } catch {
          // Ignore storage failures.
        }
      },
      (error) => {
        setStatus(
          error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        )
      },
      { maximumAge: 60_000, timeout: 15_000 },
    )
  }, [])

  useEffect(() => {
    let autoLocate = false
    try {
      autoLocate = window.localStorage.getItem(AUTO_LOCATE_KEY) === 'true'
    } catch {
      autoLocate = false
    }
    if (autoLocate) locate()
  }, [locate])

  return { status, nearby, locate }
}
