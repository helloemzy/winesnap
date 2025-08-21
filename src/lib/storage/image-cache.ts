// Image cache system for offline storage and sync

interface CachedImage {
  id: string
  blob: Blob
  metadata: {
    filename: string
    originalSize: number
    compressedSize: number
    timestamp: Date
    mimeType: string
    uploaded: boolean
    uploadUrl?: string
  }
}

interface ImageCacheMetadata {
  totalSize: number
  imageCount: number
  lastCleanup: Date
}

const DB_NAME = 'WineSnapImageCache'
const DB_VERSION = 1
const STORE_NAME = 'images'
const METADATA_STORE = 'metadata'
const MAX_CACHE_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_IMAGES = 500

class ImageCacheManager {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  private async initDB(): Promise<void> {
    if (this.db) return

    if (this.initPromise) {
      await this.initPromise
      return
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create images store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const imageStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          imageStore.createIndex('timestamp', 'metadata.timestamp')
          imageStore.createIndex('uploaded', 'metadata.uploaded')
          imageStore.createIndex('filename', 'metadata.filename')
        }

        // Create metadata store
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' })
        }
      }
    })

    await this.initPromise
  }

  async saveImage(filename: string, blob: Blob, metadata: Partial<CachedImage['metadata']> = {}): Promise<string> {
    await this.initDB()
    if (!this.db) throw new Error('Database not initialized')

    const id = `img_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    const cachedImage: CachedImage = {
      id,
      blob,
      metadata: {
        filename,
        originalSize: blob.size,
        compressedSize: blob.size,
        timestamp: new Date(),
        mimeType: blob.type,
        uploaded: false,
        ...metadata
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.add(cachedImage)
      
      request.onsuccess = () => {
        this.updateCacheMetadata()
        this.cleanupIfNeeded()
        resolve(id)
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  async getImage(id: string): Promise<CachedImage | null> {
    await this.initDB()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllImages(): Promise<CachedImage[]> {
    await this.initDB()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getUnuploadedImages(): Promise<CachedImage[]> {
    await this.initDB()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('uploaded')
      
      const request = index.getAll(false)
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async markAsUploaded(id: string, uploadUrl?: string): Promise<void> {
    await this.initDB()
    if (!this.db) return

    const image = await this.getImage(id)
    if (!image) return

    image.metadata.uploaded = true
    if (uploadUrl) {
      image.metadata.uploadUrl = uploadUrl
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.put(image)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteImage(id: string): Promise<void> {
    await this.initDB()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.delete(id)
      
      request.onsuccess = () => {
        this.updateCacheMetadata()
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getCacheStats(): Promise<ImageCacheMetadata> {
    await this.initDB()
    if (!this.db) {
      return {
        totalSize: 0,
        imageCount: 0,
        lastCleanup: new Date()
      }
    }

    const images = await this.getAllImages()
    const totalSize = images.reduce((sum, img) => sum + img.metadata.compressedSize, 0)

    return {
      totalSize,
      imageCount: images.length,
      lastCleanup: new Date() // Would be stored in metadata store in real implementation
    }
  }

  private async updateCacheMetadata(): Promise<void> {
    if (!this.db) return

    const stats = await this.getCacheStats()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)
      
      const request = store.put({ key: 'cache_stats', ...stats })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async cleanupIfNeeded(): Promise<void> {
    const stats = await this.getCacheStats()
    
    if (stats.totalSize > MAX_CACHE_SIZE || stats.imageCount > MAX_IMAGES) {
      await this.cleanupOldImages()
    }
  }

  async cleanupOldImages(): Promise<number> {
    await this.initDB()
    if (!this.db) return 0

    const images = await this.getAllImages()
    
    // Sort by timestamp, oldest first
    const sortedImages = images.sort((a, b) => 
      a.metadata.timestamp.getTime() - b.metadata.timestamp.getTime()
    )

    let deletedCount = 0
    let currentSize = images.reduce((sum, img) => sum + img.metadata.compressedSize, 0)

    // Delete uploaded images first, then oldest unuploaded if still over limit
    for (const image of sortedImages) {
      if (currentSize <= MAX_CACHE_SIZE * 0.8 && images.length - deletedCount <= MAX_IMAGES * 0.8) {
        break
      }

      // Delete uploaded images more aggressively
      if (image.metadata.uploaded || deletedCount < 10) {
        await this.deleteImage(image.id)
        currentSize -= image.metadata.compressedSize
        deletedCount++
      }
    }

    return deletedCount
  }

  async clearCache(): Promise<void> {
    await this.initDB()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.clear()
      
      request.onsuccess = () => {
        this.updateCacheMetadata()
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async exportCache(): Promise<{ images: CachedImage[], metadata: ImageCacheMetadata }> {
    const images = await this.getAllImages()
    const metadata = await this.getCacheStats()
    
    return { images, metadata }
  }

  async syncPendingImages(
    uploadFunction: (blob: Blob, filename: string) => Promise<string>,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<{ success: number, failed: number }> {
    const unuploadedImages = await this.getUnuploadedImages()
    let success = 0
    let failed = 0

    for (let i = 0; i < unuploadedImages.length; i++) {
      const image = unuploadedImages[i]
      
      try {
        const uploadUrl = await uploadFunction(image.blob, image.metadata.filename)
        await this.markAsUploaded(image.id, uploadUrl)
        success++
      } catch (error) {
        console.error(`Failed to upload image ${image.id}:`, error)
        failed++
      }

      onProgress?.(i + 1, unuploadedImages.length)
    }

    return { success, failed }
  }
}

// Singleton instance
const imageCacheManager = new ImageCacheManager()

// Exported functions
export async function saveImageToCache(
  filename: string, 
  blob: Blob, 
  metadata?: Partial<CachedImage['metadata']>
): Promise<string> {
  return imageCacheManager.saveImage(filename, blob, metadata)
}

export async function getImageFromCache(id: string): Promise<CachedImage | null> {
  return imageCacheManager.getImage(id)
}

export async function getAllCachedImages(): Promise<CachedImage[]> {
  return imageCacheManager.getAllImages()
}

export async function getUnuploadedImages(): Promise<CachedImage[]> {
  return imageCacheManager.getUnuploadedImages()
}

export async function markImageAsUploaded(id: string, uploadUrl?: string): Promise<void> {
  return imageCacheManager.markAsUploaded(id, uploadUrl)
}

export async function deleteImageFromCache(id: string): Promise<void> {
  return imageCacheManager.deleteImage(id)
}

export async function getCacheStats(): Promise<ImageCacheMetadata> {
  return imageCacheManager.getCacheStats()
}

export async function cleanupImageCache(): Promise<number> {
  return imageCacheManager.cleanupOldImages()
}

export async function clearImageCache(): Promise<void> {
  return imageCacheManager.clearCache()
}

export async function syncPendingImages(
  uploadFunction: (blob: Blob, filename: string) => Promise<string>,
  onProgress?: (uploaded: number, total: number) => void
): Promise<{ success: number, failed: number }> {
  return imageCacheManager.syncPendingImages(uploadFunction, onProgress)
}