// Bump whenever a same-URL static asset changes. Activation deletes older
// Sub-Wait caches, preventing replaced icons/diagrams from remaining stale.
const CACHE_NAME = 'sub-wait-v2'
const APP_SHELL = [
  '/index.html',
  '/sub-wait/manifest.webmanifest',
  '/sub-wait/icon-v2-192.png',
  '/sub-wait/icon-v2-512.png',
  '/sub-wait/icon-v2-maskable-512.png',
]

// Real-time train data must never be served from cache.
const NETWORK_ONLY_HOSTS = ['api-endpoint.mta.info']

async function precacheApp() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(APP_SHELL)

  const response = await fetch('/.vite/manifest.json')
  if (!response.ok) return

  const manifest = await response.json()
  const assets = new Set()
  Object.values(manifest).forEach((entry) => {
    if (entry.file) assets.add(`/${entry.file}`)
    entry.css?.forEach((file) => assets.add(`/${file}`))
    entry.assets?.forEach((file) => assets.add(`/${file}`))
  })
  await cache.addAll([...assets])
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheApp())
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('sub-wait-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (NETWORK_ONLY_HOSTS.includes(url.hostname)) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    })
  )
})
