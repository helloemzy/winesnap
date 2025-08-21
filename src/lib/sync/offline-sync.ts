// Offline synchronization system for WineSnap

import { syncPendingImages } from '@/lib/storage/image-cache'
import { shouldEnableBackgroundSync } from '@/lib/performance/battery-optimization'

interface SyncQueueItem {
  id: string
  type: 'wine_tasting' | 'voice_memo' | 'image_upload' | 'user_data'
  data: any
  timestamp: Date
  retryCount: number
  priority: 'high' | 'medium' | 'low'
  dependencies?: string[]
}

interface SyncResult {
  success: boolean
  item: SyncQueueItem
  error?: string
}

interface SyncStats {
  totalItems: number
  syncedItems: number
  failedItems: number
  lastSyncTime: Date | null
  isOnline: boolean
  isSyncing: boolean
}

class OfflineSyncManager {
  private db: IDBDatabase | null = null
  private isInitialized = false
  private syncQueue: SyncQueueItem[] = []
  private isSyncing = false
  private syncListeners: Array<(stats: SyncStats) => void> = []
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map()
  
  private readonly DB_NAME = 'WineSnapSync'
  private readonly DB_VERSION = 1
  private readonly STORE_NAME = 'sync_queue'
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAYS = [1000, 5000, 15000] // 1s, 5s, 15s

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.initializeDB()
      await this.loadSyncQueue()
      this.setupNetworkListeners()
      this.setupBackgroundSync()
      this.isInitialized = true
      
      // Start initial sync if online
      if (navigator.onLine) {
        this.triggerSync()
      }
    } catch (error) {
      console.error('Failed to initialize offline sync:', error)
    }
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('type', 'type')
          store.createIndex('priority', 'priority')
        }
      }
    })
  }

  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        this.syncQueue = request.result || []
        this.notifyListeners()
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Network connection restored, triggering sync')
      this.triggerSync()
    })

    window.addEventListener('offline', () => {
      console.log('Network connection lost')
      this.notifyListeners()
    })
  }

  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // Register background sync
        return registration.sync.register('wine-data-sync')
      }).catch(error => {
        console.warn('Background sync not supported:', error)
      })
    }
  }

  async addToQueue(
    type: SyncQueueItem['type'],
    data: any,
    priority: SyncQueueItem['priority'] = 'medium',
    dependencies?: string[]
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
      priority,
      dependencies
    }

    this.syncQueue.push(item)
    await this.persistSyncQueue()
    this.notifyListeners()

    // Trigger sync if online and high priority
    if (navigator.onLine && priority === 'high') {
      this.triggerSync()
    }

    return item.id
  }

  async removeFromQueue(itemId: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId)
    await this.persistSyncQueue()
    this.notifyListeners()

    // Clear any pending retry
    const timeout = this.retryTimeouts.get(itemId)
    if (timeout) {
      clearTimeout(timeout)
      this.retryTimeouts.delete(itemId)
    }
  }

  private async persistSyncQueue(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)

      // Clear and repopulate
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        const promises = this.syncQueue.map(item => {
          return new Promise<void>((res, rej) => {
            const addRequest = store.add(item)
            addRequest.onsuccess = () => res()
            addRequest.onerror = () => rej(addRequest.error)
          })
        })

        Promise.all(promises)
          .then(() => resolve())
          .catch(reject)
      }

      clearRequest.onerror = () => reject(clearRequest.error)
    })
  }

  async triggerSync(): Promise<SyncResult[]> {
    if (this.isSyncing || !navigator.onLine || !shouldEnableBackgroundSync()) {
      return []
    }

    this.isSyncing = true
    this.notifyListeners()

    try {
      // Sort queue by priority and dependencies
      const sortedQueue = this.getSortedSyncQueue()
      const results: SyncResult[] = []

      for (const item of sortedQueue) {
        try {
          const result = await this.syncItem(item)
          results.push(result)

          if (result.success) {
            await this.removeFromQueue(item.id)
          } else {
            await this.handleSyncFailure(item)
          }
        } catch (error) {
          console.error(`Sync failed for item ${item.id}:`, error)
          results.push({
            success: false,
            item,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          await this.handleSyncFailure(item)
        }
      }

      return results
    } finally {
      this.isSyncing = false
      this.notifyListeners()
    }
  }

  private getSortedSyncQueue(): SyncQueueItem[] {
    // Sort by priority (high first) then by timestamp
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    
    return [...this.syncQueue].sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return a.timestamp.getTime() - b.timestamp.getTime()
    })
  }

  private async syncItem(item: SyncQueueItem): Promise<SyncResult> {
    try {
      switch (item.type) {
        case 'wine_tasting':
          return await this.syncWineTasting(item)
        case 'voice_memo':
          return await this.syncVoiceMemo(item)
        case 'image_upload':
          return await this.syncImageUpload(item)
        case 'user_data':
          return await this.syncUserData(item)
        default:
          throw new Error(`Unknown sync type: ${item.type}`)
      }
    } catch (error) {
      return {
        success: false,
        item,
        error: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  private async syncWineTasting(item: SyncQueueItem): Promise<SyncResult> {
    const response = await fetch('/api/wine-tastings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item.data)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return { success: true, item }
  }

  private async syncVoiceMemo(item: SyncQueueItem): Promise<SyncResult> {
    const formData = new FormData()
    formData.append('audio', item.data.audioBlob)
    formData.append('metadata', JSON.stringify(item.data.metadata))

    const response = await fetch('/api/voice-memos', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return { success: true, item }
  }

  private async syncImageUpload(item: SyncQueueItem): Promise<SyncResult> {
    // Use the image cache sync system
    try {
      const { success, failed } = await syncPendingImages(
        async (blob: Blob, filename: string) => {
          const formData = new FormData()
          formData.append('image', blob, filename)
          
          const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
          }

          const result = await response.json()
          return result.url
        }
      )

      return { 
        success: failed === 0, 
        item,
        error: failed > 0 ? `${failed} images failed to upload` : undefined
      }
    } catch (error) {
      throw error
    }
  }

  private async syncUserData(item: SyncQueueItem): Promise<SyncResult> {
    const response = await fetch('/api/user/data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item.data)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return { success: true, item }
  }

  private async handleSyncFailure(item: SyncQueueItem): Promise<void> {
    item.retryCount++

    if (item.retryCount >= this.MAX_RETRIES) {
      console.error(`Max retries reached for sync item ${item.id}, removing from queue`)
      await this.removeFromQueue(item.id)
      return
    }

    // Schedule retry with exponential backoff
    const delay = this.RETRY_DELAYS[Math.min(item.retryCount - 1, this.RETRY_DELAYS.length - 1)]
    
    const timeout = setTimeout(() => {
      if (navigator.onLine) {
        this.triggerSync()
      }
      this.retryTimeouts.delete(item.id)
    }, delay)

    this.retryTimeouts.set(item.id, timeout)
    await this.persistSyncQueue()
  }

  getSyncStats(): SyncStats {
    const failedItems = this.syncQueue.filter(item => item.retryCount >= this.MAX_RETRIES).length
    
    return {
      totalItems: this.syncQueue.length,
      syncedItems: 0, // Would be tracked separately
      failedItems,
      lastSyncTime: null, // Would be persisted
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing
    }
  }

  onSyncUpdate(listener: (stats: SyncStats) => void): () => void {
    this.syncListeners.push(listener)
    
    return () => {
      const index = this.syncListeners.indexOf(listener)
      if (index > -1) {
        this.syncListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    const stats = this.getSyncStats()
    this.syncListeners.forEach(listener => listener(stats))
  }

  async clearQueue(): Promise<void> {
    this.syncQueue = []
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
    await this.persistSyncQueue()
    this.notifyListeners()
  }

  async forceSyncItem(itemId: string): Promise<SyncResult | null> {
    const item = this.syncQueue.find(i => i.id === itemId)
    if (!item) return null

    try {
      const result = await this.syncItem(item)
      if (result.success) {
        await this.removeFromQueue(item.id)
      }
      return result
    } catch (error) {
      return {
        success: false,
        item,
        error: error instanceof Error ? error.message : 'Force sync failed'
      }
    }
  }
}

// Singleton instance
const offlineSyncManager = new OfflineSyncManager()

// Initialize on module load
if (typeof window !== 'undefined') {
  offlineSyncManager.initialize()
}

// Exported functions
export async function initializeOfflineSync(): Promise<void> {
  return offlineSyncManager.initialize()
}

export async function addToSyncQueue(
  type: SyncQueueItem['type'],
  data: any,
  priority?: SyncQueueItem['priority'],
  dependencies?: string[]
): Promise<string> {
  return offlineSyncManager.addToQueue(type, data, priority, dependencies)
}

export async function triggerSync(): Promise<SyncResult[]> {
  return offlineSyncManager.triggerSync()
}

export function getSyncStats(): SyncStats {
  return offlineSyncManager.getSyncStats()
}

export function onSyncUpdate(listener: (stats: SyncStats) => void): () => void {
  return offlineSyncManager.onSyncUpdate(listener)
}

export async function clearSyncQueue(): Promise<void> {
  return offlineSyncManager.clearQueue()
}

export async function forceSyncItem(itemId: string): Promise<SyncResult | null> {
  return offlineSyncManager.forceSyncItem(itemId)
}

export { type SyncQueueItem, type SyncResult, type SyncStats }