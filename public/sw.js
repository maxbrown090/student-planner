// Kill-switch service worker.
// Old versions of this SW used a cache-first strategy that pinned every
// returning user to a broken build. This version unregisters itself and
// wipes all caches so the next page load fetches fresh from the network.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
    const regs = await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach((c) => c.navigate(c.url))
  })())
})
