// Enhanced Service Worker for WineSnap PWA
// This file would be compiled and served as /sw.js

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'winesnap-v1'
const STATIC_CACHE = 'winesnap-static-v1'
const IMAGE_CACHE = 'winesnap-images-v1'
const API_CACHE = 'winesnap-api-v1'
const VOICE_CACHE = 'winesnap-voice-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/wine-glass.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

const CACHE_STRATEGIES = {
  // Critical resources - cache first
  static: [
    /\/_next\/static\//,
    /\/icons\//,
    /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/
  ],
  
  // API responses - network first with fallback
  api: [
    /\/api\//,
    /supabase\.co/
  ],
  
  // Images - cache first with network fallback
  images: [
    /\.(?:png|jpg|jpeg|gif|svg|webp|avif)$/
  ],
  
  // Voice files - cache first
  voice: [
    /\.(?:wav|mp3|ogg|m4a|webm)$/,
    /\/voice\//
  ]
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== VOICE_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  event.respondWith(handleRequest(request))
})

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  
  try {
    // Static assets - cache first
    if (CACHE_STRATEGIES.static.some(pattern => pattern.test(request.url))) {
      return await cacheFirst(request, STATIC_CACHE)
    }
    
    // Images - cache first with compression
    if (CACHE_STRATEGIES.images.some(pattern => pattern.test(request.url))) {
      return await cacheFirstWithOptimization(request, IMAGE_CACHE)
    }
    
    // Voice files - cache first
    if (CACHE_STRATEGIES.voice.some(pattern => pattern.test(request.url))) {
      return await cacheFirst(request, VOICE_CACHE)
    }
    
    // API requests - network first with intelligent fallback
    if (CACHE_STRATEGIES.api.some(pattern => pattern.test(request.url))) {
      return await networkFirstWithSync(request, API_CACHE)
    }
    
    // Default - network first
    return await networkFirst(request, CACHE_NAME)
    
  } catch (error) {
    console.error('Fetch handler error:', error)
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return await getOfflinePage()
    }
    
    // Return cached version or network error
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Network error', { status: 408 })
  }
}

// Cache first strategy
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    // Update cache in background
    updateCacheInBackground(request, cache)
    return cachedResponse
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request)
  
  // Cache successful responses
  if (networkResponse.status === 200) {
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

// Network first strategy
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName)
  
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ])
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Network first with sync queue for failed requests
async function networkFirstWithSync(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName)
  
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('API request failed, checking cache:', error)
    
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Queue for sync when online
    if (request.method === 'POST' || request.method === 'PUT') {
      await queueForSync(request)
    }
    
    throw error
  }
}

// Cache first with image optimization
async function cacheFirstWithOptimization(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Fetch from network
  const networkResponse = await fetch(request)
  
  if (networkResponse.status === 200) {
    // Optimize image if possible
    const optimizedResponse = await optimizeImageResponse(networkResponse.clone())
    cache.put(request, optimizedResponse || networkResponse.clone())
  }
  
  return networkResponse
}

// Background cache update
async function updateCacheInBackground(request: Request, cache: Cache): Promise<void> {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      await cache.put(request, networkResponse)
    }
  } catch (error) {
    console.log('Background update failed:', error)
  }
}

// Image optimization
async function optimizeImageResponse(response: Response): Promise<Response | null> {
  try {
    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      return null
    }
    
    // For now, just return the original response
    // In a full implementation, you'd compress/optimize the image
    return response
  } catch (error) {
    console.log('Image optimization failed:', error)
    return null
  }
}

// Queue requests for background sync
async function queueForSync(request: Request): Promise<void> {
  try {
    const cache = await caches.open('sync-queue')
    const queueKey = `sync-${Date.now()}-${Math.random()}`
    
    // Store request for later sync
    await cache.put(queueKey, new Response(JSON.stringify({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text()
    })))
    
    console.log('Queued request for sync:', queueKey)
  } catch (error) {
    console.error('Failed to queue request:', error)
  }
}

// Get offline page
async function getOfflinePage(): Promise<Response> {
  const offlineHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WineSnap - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #7c2d12 0%, #dc2626 100%);
          color: white;
          text-align: center;
        }
        .icon {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          opacity: 0.8;
        }
        h1 { margin: 0 0 10px 0; }
        p { margin: 10px 0; opacity: 0.9; }
        .retry-btn {
          margin-top: 20px;
          padding: 12px 24px;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 16px;
        }
        .retry-btn:hover {
          background: rgba(255,255,255,0.3);
        }
      </style>
    </head>
    <body>
      <div class="icon">🍷</div>
      <h1>You're Offline</h1>
      <p>You're currently offline, but you can still:</p>
      <ul style="text-align: left; max-width: 300px;">
        <li>View cached wine entries</li>
        <li>Take new wine photos</li>
        <li>Record voice memos</li>
        <li>Access saved tastings</li>
      </ul>
      <p>Your data will sync when you're back online.</p>
      <button class="retry-btn" onclick="window.location.reload()">
        Try Again
      </button>
    </body>
    </html>
  `
  
  return new Response(offlineHtml, {
    headers: { 'Content-Type': 'text/html' }
  })
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'wine-data-sync') {
    event.waitUntil(syncWineData())
  }
  
  if (event.tag === 'image-upload-sync') {
    event.waitUntil(syncImages())
  }
})

// Sync wine data
async function syncWineData(): Promise<void> {
  try {
    const cache = await caches.open('sync-queue')
    const requests = await cache.keys()
    
    for (const request of requests) {
      try {
        const response = await cache.match(request)
        if (response) {
          const data = await response.json()
          
          // Replay the request
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body
          })
          
          // Remove from queue
          await cache.delete(request)
        }
      } catch (error) {
        console.error('Failed to sync request:', error)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Sync images
async function syncImages(): Promise<void> {
  try {
    // This would integrate with the image cache system
    console.log('Syncing images...')
    
    // Send message to clients to trigger image sync
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_IMAGES',
        timestamp: Date.now()
      })
    })
  } catch (error) {
    console.error('Image sync failed:', error)
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    badge: '/icons/badge-96x96.png',
    icon: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open WineSnap'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }
  
  if (event.data) {
    const payload = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(
        payload.title || 'WineSnap',
        {
          ...options,
          body: payload.body || 'New wine update available',
          data: payload.data || options.data
        }
      )
    )
  } else {
    event.waitUntil(
      self.registration.showNotification(
        'WineSnap',
        {
          ...options,
          body: 'New update available'
        }
      )
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'dismiss') {
    return
  }
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Check if app is already open
      const existingClient = clients.find(client => 
        client.url.includes(urlToOpen) && 'focus' in client
      )
      
      if (existingClient) {
        return existingClient.focus()
      }
      
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

// Message event for communication with main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

console.log('Enhanced Service Worker loaded')

export {}