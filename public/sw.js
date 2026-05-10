// ── VR Books Dashboard — Service Worker ──────────────────────────────────────
const CACHE_NAME    = 'vr-books-v1'
const RUNTIME_CACHE = 'vr-books-runtime-v1'

// Files to cache on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// ── Install: cache app shell ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: serve from cache, fall back to network ─────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests (Google Sheets, Apps Script etc)
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) return

  // Google Fonts — cache first
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(response => {
            cache.put(request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // App shell — network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request).then(cached => {
        if (cached) return cached
        // Offline fallback for navigation
        if (request.mode === 'navigate') return caches.match('/index.html')
      }))
  )
})

// ── Background sync: queue log entries when offline ───────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-log-entries') {
    event.waitUntil(syncPendingEntries())
  }
})

async function syncPendingEntries() {
  // Handled by the app — this is a hook for future use
  console.log('[SW] Background sync triggered')
}
