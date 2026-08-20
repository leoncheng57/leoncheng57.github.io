import { describe, expect, it } from 'vitest'
import { alertsUrl, parseAlerts } from './nws'

describe('alertsUrl', () => {
  it('queries active alerts for the NYC point', () => {
    expect(alertsUrl()).toBe(
      'https://api.weather.gov/alerts/active?point=40.7128,-74.006',
    )
  })
})

describe('parseAlerts', () => {
  it('maps NWS GeoJSON features to alerts', () => {
    const alerts = parseAlerts({
      features: [
        {
          id: 'urn:oid:1',
          properties: {
            event: 'Heat Advisory',
            headline: 'Heat Advisory until Thursday 8 PM',
            severity: 'Moderate',
            ends: '2026-08-21T00:00:00-04:00',
            description: 'Heat index values up to 100 expected.',
            instruction: 'Drink plenty of fluids.',
          },
        },
      ],
    })

    expect(alerts).toEqual([
      {
        id: 'urn:oid:1',
        event: 'Heat Advisory',
        headline: 'Heat Advisory until Thursday 8 PM',
        severity: 'Moderate',
        ends: '2026-08-21T00:00:00-04:00',
        description: 'Heat index values up to 100 expected.',
        instruction: 'Drink plenty of fluids.',
      },
    ])
  })

  it('falls back to expires and Unknown severity', () => {
    const alerts = parseAlerts({
      features: [
        {
          properties: {
            event: 'Air Quality Alert',
            severity: 'Bogus',
            expires: '2026-08-21T00:00:00-04:00',
          },
        },
      ],
    })

    expect(alerts[0].severity).toBe('Unknown')
    expect(alerts[0].ends).toBe('2026-08-21T00:00:00-04:00')
    expect(alerts[0].id).toBe('alert-0')
  })

  it('returns an empty list for an empty response', () => {
    expect(parseAlerts({})).toEqual([])
  })
})
