import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function withBase(base, path) {
  return `${base.endsWith('/') ? base : `${base}/`}${path}`
}

export function createStationManifest(station, base = '/') {
  const stationPath = `sub-wait/station/${station.id}`

  return {
    name: station.name,
    short_name: station.name,
    description: `Live NYC subway arrival times for ${station.name}.`,
    id: withBase(base, `sub-wait/pwa/station/${station.id}`),
    start_url: withBase(base, stationPath),
    scope: withBase(base, 'sub-wait/'),
    display: 'standalone',
    background_color: '#f6f6f6',
    theme_color: '#111111',
    orientation: 'portrait',
    icons: [
      {
        src: withBase(base, 'sub-wait/icon-v2-192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: withBase(base, 'sub-wait/icon-v2-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: withBase(base, 'sub-wait/icon-v2-maskable-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

export function stationManifestsPlugin() {
  let base = '/'
  let stations = []

  return {
    name: 'station-manifests',
    configResolved(config) {
      base = config.base
      stations = JSON.parse(
        readFileSync(
          resolve(config.root, 'src/features/sub-wait/data/stations.json'),
          'utf8',
        ),
      )
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
        const prefix = withBase(base, 'sub-wait/manifests/station-')
        if (!pathname.startsWith(prefix) || !pathname.endsWith('.webmanifest')) {
          next()
          return
        }

        const stationId = pathname.slice(prefix.length, -'.webmanifest'.length)
        const station = stations.find((candidate) => candidate.id === stationId)
        if (!station) {
          next()
          return
        }

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/manifest+json')
        response.end(JSON.stringify(createStationManifest(station, base), null, 2))
      })
    },
    generateBundle() {
      for (const station of stations) {
        this.emitFile({
          type: 'asset',
          fileName: `sub-wait/manifests/station-${station.id}.webmanifest`,
          source: JSON.stringify(createStationManifest(station, base), null, 2),
        })
      }
    },
  }
}
