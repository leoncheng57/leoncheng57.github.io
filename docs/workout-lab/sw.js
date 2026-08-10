const CACHE_NAME = 'workout-lab-v2'
const APP_SHELL = [
  '/index.html',
  '/workout-lab/manifest.webmanifest',
  '/workout-lab/icon-192.png',
  '/workout-lab/icon-512.png',
  '/workout-lab/icon-maskable-512.png',
]

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
            .filter((key) => key.startsWith('workout-lab-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  const url = new URL(request.url)
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
