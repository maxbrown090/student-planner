'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {})
      if (typeof caches !== 'undefined') {
        caches.keys()
          .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          .catch(() => {})
      }
    }
  }, [])
  return null
}
