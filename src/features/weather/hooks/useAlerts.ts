import { useEffect, useState } from 'react'
import { alertsUrl, parseAlerts } from '../data/nws'
import type { WeatherAlert } from '../types'

export type AlertsStatus = 'loading' | 'ready' | 'error'

export type AlertsState = {
  status: AlertsStatus
  alerts: WeatherAlert[]
  /** Epoch ms of the last successful check. */
  checkedAt: number | null
}

/** Active NWS alerts for NYC from api.weather.gov. */
export default function useAlerts(): AlertsState {
  const [status, setStatus] = useState<AlertsStatus>('loading')
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [checkedAt, setCheckedAt] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(alertsUrl(), {
          signal: controller.signal,
          headers: { Accept: 'application/geo+json' },
        })
        if (!response.ok) {
          throw new Error(`Alerts responded ${response.status}`)
        }
        const body = (await response.json()) as Parameters<typeof parseAlerts>[0]
        if (controller.signal.aborted) return
        setAlerts(parseAlerts(body))
        setCheckedAt(Date.now())
        setStatus('ready')
      } catch {
        if (controller.signal.aborted) return
        setStatus('error')
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  return { status, alerts, checkedAt }
}
