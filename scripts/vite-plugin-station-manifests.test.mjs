import { describe, expect, it } from 'vitest'
import { createStationManifest } from './vite-plugin-station-manifests.mjs'

describe('station manifests', () => {
  it('uses each station name and unique station URLs', () => {
    const first = createStationManifest({ id: '101', name: 'Van Cortlandt Park-242 St' })
    const second = createStationManifest({ id: '103', name: '238 St' })

    expect(first.name).toBe('Van Cortlandt Park-242 St')
    expect(first.short_name).toBe('Van Cortlandt Park-242 St')
    expect(first.id).toBe('/sub-wait/pwa/station/101')
    expect(first.start_url).toBe('/sub-wait/station/101')
    expect(second.id).not.toBe(first.id)
    expect(second.start_url).not.toBe(first.start_url)
  })

  it('applies the configured base to URLs and icon paths', () => {
    const manifest = createStationManifest(
      { id: 'F16', name: 'East Broadway' },
      '/previews/pr-149/',
    )

    expect(manifest.id).toBe('/previews/pr-149/sub-wait/pwa/station/F16')
    expect(manifest.start_url).toBe('/previews/pr-149/sub-wait/station/F16')
    expect(manifest.scope).toBe('/previews/pr-149/sub-wait/')
    expect(manifest.icons.map((icon) => icon.src)).toEqual([
      '/previews/pr-149/sub-wait/icon-v2-192.png',
      '/previews/pr-149/sub-wait/icon-v2-512.png',
      '/previews/pr-149/sub-wait/icon-v2-maskable-512.png',
    ])
  })
})
