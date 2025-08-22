// Offline sync and error handling for wine capture system

interface CaptureQueueItem {
  id: string
  timestamp: number
  mode: 'voice' | 'camera'
  data: {
    audioBlob?: Blob
    imageFile?: File
    wineInfo?: any
    metadata: {
      location?: { lat: number; lng: number }
      timestamp: string
      deviceInfo: string
      networkStatus: 'online' | 'offline'
    }
  }
  retryCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

interface SyncProgress {
  total: number
  processed: number
  current?: CaptureQueueItem
  errors: string[]
}

export class OfflineCaptureSync {
  private queue: CaptureQueueItem[] = []
  private syncInProgress = false
  private maxRetries = 3
  private retryDelay = 5000 // 5 seconds
  private dbName = 'winesnap-offline'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  constructor() {
    this.initializeDB()
    this.setupNetworkListeners()
    this.startPeriodicSync()
  }

  // Initialize IndexedDB for offline storage
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.loadQueueFromDB()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        const captureStore = db.createObjectStore('captures', { keyPath: 'id' })
        captureStore.createIndex('timestamp', 'timestamp', { unique: false })
        captureStore.createIndex('status', 'status', { unique: false })
        
        const mediaStore = db.createObjectStore('media', { keyPath: 'id' })
        mediaStore.createIndex('captureId', 'captureId', { unique: false })
      }
    })
  }

  // Load existing queue from IndexedDB
  private async loadQueueFromDB(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['captures'], 'readonly')
    const store = transaction.objectStore('captures')
    const request = store.getAll()

    request.onsuccess = () => {
      this.queue = request.result.filter(item => item.status !== 'completed')
      console.log(`Loaded ${this.queue.length} pending captures from offline storage`)
    }
  }

  // Save queue item to IndexedDB
  private async saveQueueItemToDB(item: CaptureQueueItem): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['captures', 'media'], 'readwrite')
    const captureStore = transaction.objectStore('captures')
    const mediaStore = transaction.objectStore('media')

    // Save capture metadata
    captureStore.put(item)

    // Save media files separately
    if (item.data.audioBlob) {
      mediaStore.put({
        id: `${item.id}_audio`,
        captureId: item.id,
        type: 'audio',
        blob: item.data.audioBlob
      })
    }

    if (item.data.imageFile) {
      mediaStore.put({
        id: `${item.id}_image`,
        captureId: item.id,
        type: 'image',
        blob: item.data.imageFile
      })
    }
  }

  // Add capture to offline queue
  async addToQueue(
    mode: 'voice' | 'camera',
    data: {
      audioBlob?: Blob
      imageFile?: File
      wineInfo?: any
      transcript?: string
      ocrResults?: any
    }
  ): Promise<string> {
    const id = `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Get location if available
    let location: { lat: number; lng: number } | undefined
    try {
      if (navigator.geolocation) {
        location = await this.getCurrentLocation()
      }
    } catch (error) {
      console.warn('Location not available:', error)
    }

    const queueItem: CaptureQueueItem = {
      id,
      timestamp: Date.now(),
      mode,
      data: {
        ...data,
        metadata: {
          location,
          timestamp: new Date().toISOString(),
          deviceInfo: navigator.userAgent,
          networkStatus: navigator.onLine ? 'online' : 'offline'
        }
      },
      retryCount: 0,
      status: 'pending'
    }

    this.queue.push(queueItem)
    await this.saveQueueItemToDB(queueItem)

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncQueue()
    }

    return id
  }

  // Get current location
  private async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => reject(error),
        {
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
          enableHighAccuracy: false
        }
      )
    })
  }

  // Sync queue with server
  async syncQueue(onProgress?: (progress: SyncProgress) => void): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return

    this.syncInProgress = true
    const pendingItems = this.queue.filter(item => item.status === 'pending' || item.status === 'failed')
    
    if (pendingItems.length === 0) {
      this.syncInProgress = false
      return
    }

    const progress: SyncProgress = {
      total: pendingItems.length,
      processed: 0,
      errors: []
    }

    try {
      for (const item of pendingItems) {
        progress.current = item
        onProgress?.(progress)

        try {
          await this.syncItem(item)
          item.status = 'completed'
          progress.processed++
        } catch (error) {
          item.retryCount++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          if (item.retryCount >= this.maxRetries) {
            item.status = 'failed'
            item.error = errorMessage
            progress.errors.push(`${item.id}: ${errorMessage}`)
          } else {
            item.status = 'pending'
            // Schedule retry
            setTimeout(() => {
              if (navigator.onLine) {
                this.syncQueue()
              }
            }, this.retryDelay * item.retryCount)
          }
        }

        await this.saveQueueItemToDB(item)
      }
    } finally {
      this.syncInProgress = false
      onProgress?.(progress)
    }
  }

  // Sync individual item
  private async syncItem(item: CaptureQueueItem): Promise<void> {
    const { mode, data } = item

    // Load media files from IndexedDB
    await this.loadMediaForItem(item)

    if (mode === 'voice' && data.audioBlob) {
      // Process voice recording
      const formData = new FormData()
      formData.append('audio', data.audioBlob, 'recording.wav')
      formData.append('metadata', JSON.stringify(data.metadata))
      if (data.wineInfo) {
        formData.append('wineInfo', JSON.stringify(data.wineInfo))
      }

      const response = await fetch('/api/voice/process-offline', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Voice processing failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Voice capture synced:', result)

    } else if (mode === 'camera' && data.imageFile) {
      // Process image capture
      const formData = new FormData()
      formData.append('image', data.imageFile, 'wine-photo.jpg')
      formData.append('metadata', JSON.stringify(data.metadata))
      if (data.wineInfo) {
        formData.append('wineInfo', JSON.stringify(data.wineInfo))
      }

      const response = await fetch('/api/camera/process-offline', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Image processing failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Camera capture synced:', result)
    }
  }

  // Load media files for a queue item
  private async loadMediaForItem(item: CaptureQueueItem): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['media'], 'readonly')
    const store = transaction.objectStore('media')
    const index = store.index('captureId')
    const request = index.getAll(item.id)

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const mediaItems = request.result
        
        for (const mediaItem of mediaItems) {
          if (mediaItem.type === 'audio') {
            item.data.audioBlob = mediaItem.blob
          } else if (mediaItem.type === 'image') {
            item.data.imageFile = mediaItem.blob
          }
        }
        
        resolve()
      }
    })
  }

  // Setup network status listeners
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Network connection restored, syncing offline captures...')
      this.syncQueue()
    })

    window.addEventListener('offline', () => {
      console.log('Network connection lost, captures will be queued for sync')
    })
  }

  // Start periodic sync attempts
  private startPeriodicSync(): void {
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress && this.queue.some(item => item.status === 'pending')) {
        this.syncQueue()
      }
    }, 30000) // Check every 30 seconds
  }

  // Get queue status
  getQueueStatus(): {
    total: number
    pending: number
    completed: number
    failed: number
    items: CaptureQueueItem[]
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => item.status === 'pending').length,
      completed: this.queue.filter(item => item.status === 'completed').length,
      failed: this.queue.filter(item => item.status === 'failed').length,
      items: [...this.queue]
    }
  }

  // Clear completed items
  async clearCompleted(): Promise<void> {
    const completedItems = this.queue.filter(item => item.status === 'completed')
    
    if (this.db && completedItems.length > 0) {
      const transaction = this.db.transaction(['captures', 'media'], 'readwrite')
      const captureStore = transaction.objectStore('captures')
      const mediaStore = transaction.objectStore('media')

      for (const item of completedItems) {
        captureStore.delete(item.id)
        
        // Delete associated media
        const mediaIndex = mediaStore.index('captureId')
        const mediaRequest = mediaIndex.getAll(item.id)
        
        mediaRequest.onsuccess = () => {
          for (const mediaItem of mediaRequest.result) {
            mediaStore.delete(mediaItem.id)
          }
        }
      }
    }

    this.queue = this.queue.filter(item => item.status !== 'completed')
  }

  // Retry failed items
  async retryFailed(): Promise<void> {
    const failedItems = this.queue.filter(item => item.status === 'failed')
    
    for (const item of failedItems) {
      item.status = 'pending'
      item.retryCount = 0
      item.error = undefined
      await this.saveQueueItemToDB(item)
    }

    if (navigator.onLine) {
      this.syncQueue()
    }
  }

  // Delete item from queue
  async deleteItem(id: string): Promise<void> {
    const index = this.queue.findIndex(item => item.id === id)
    if (index === -1) return

    const item = this.queue[index]
    this.queue.splice(index, 1)

    if (this.db) {
      const transaction = this.db.transaction(['captures', 'media'], 'readwrite')
      const captureStore = transaction.objectStore('captures')
      const mediaStore = transaction.objectStore('media')

      captureStore.delete(id)
      
      // Delete associated media
      const mediaIndex = mediaStore.index('captureId')
      const mediaRequest = mediaIndex.getAll(id)
      
      mediaRequest.onsuccess = () => {
        for (const mediaItem of mediaRequest.result) {
          mediaStore.delete(mediaItem.id)
        }
      }
    }
  }

  // Export queue data for debugging
  exportQueue(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      queue: this.queue.map(item => ({
        ...item,
        data: {
          ...item.data,
          audioBlob: item.data.audioBlob ? 'Blob data present' : undefined,
          imageFile: item.data.imageFile ? 'File data present' : undefined
        }
      }))
    }
    return JSON.stringify(exportData, null, 2)
  }
}

// Error handling utilities
export class CaptureErrorHandler {
  private errors: Array<{
    id: string
    timestamp: number
    error: Error
    context: any
    resolved: boolean
  }> = []

  logError(error: Error, context?: any): string {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.errors.push({
      id,
      timestamp: Date.now(),
      error,
      context,
      resolved: false
    })

    // Send to monitoring service if available
    this.reportError(error, context)

    return id
  }

  private reportError(error: Error, context?: any): void {
    // In production, send to error monitoring service (Sentry, etc.)
    console.error('Capture Error:', {
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }

  getErrors(resolved = false): Array<any> {
    return this.errors.filter(err => err.resolved === resolved)
  }

  markResolved(id: string): void {
    const error = this.errors.find(err => err.id === id)
    if (error) {
      error.resolved = true
    }
  }

  clearErrors(): void {
    this.errors = this.errors.filter(err => !err.resolved)
  }
}

// Fallback mechanisms
export class CaptureFallbacks {
  static async fallbackVoiceRecording(): Promise<Blob | null> {
    // Try different audio formats
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ]

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const mediaRecorder = new MediaRecorder(stream, { mimeType })
          
          // Return successful recorder setup
          stream.getTracks().forEach(track => track.stop())
          return new Blob([], { type: mimeType })
        } catch (error) {
          continue
        }
      }
    }

    return null
  }

  static async fallbackCameraCapture(): Promise<File | null> {
    // Try different video constraints
    const constraints = [
      { video: { facingMode: 'environment' } },
      { video: { facingMode: 'user' } },
      { video: true }
    ]

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint)
        stream.getTracks().forEach(track => track.stop())
        
        // Return mock file to indicate success
        return new File([], 'fallback.jpg', { type: 'image/jpeg' })
      } catch (error) {
        continue
      }
    }

    return null
  }

  static createManualWineEntry(): any {
    return {
      wine_name: '',
      producer: '',
      vintage: null,
      region: '',
      country: '',
      notes: 'Manual entry - capture failed',
      fallback: true
    }
  }
}

// Singleton instances
export const offlineSync = new OfflineCaptureSync()
export const errorHandler = new CaptureErrorHandler()
export const fallbacks = CaptureFallbacks