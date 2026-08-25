import type { WeatherAlert } from '../types'
import { NYC } from './openMeteo'

export function alertsUrl(): string {
  return `https://api.weather.gov/alerts/active?point=${NYC.latitude},${NYC.longitude}`
}

type NwsAlertFeature = {
  id?: string
  properties?: {
    event?: string
    headline?: string | null
    severity?: string
    ends?: string | null
    expires?: string | null
    description?: string
    instruction?: string | null
  }
}

type NwsAlertsResponse = {
  features?: NwsAlertFeature[]
}

const SEVERITIES = new Set([
  'Extreme',
  'Severe',
  'Moderate',
  'Minor',
] as const)

function parseSeverity(value: string | undefined): WeatherAlert['severity'] {
  return SEVERITIES.has(value as never)
    ? (value as WeatherAlert['severity'])
    : 'Unknown'
}

export function parseAlerts(response: NwsAlertsResponse): WeatherAlert[] {
  return (response.features ?? []).map((feature, index) => {
    const properties = feature.properties ?? {}
    return {
      id: feature.id ?? `alert-${index}`,
      event: properties.event ?? 'Weather Alert',
      headline: properties.headline ?? null,
      severity: parseSeverity(properties.severity),
      ends: properties.ends ?? properties.expires ?? null,
      description: properties.description ?? '',
      instruction: properties.instruction ?? null,
    }
  })
}
