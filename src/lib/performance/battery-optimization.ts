// Battery optimization utilities for mobile devices

interface BatteryInfo {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

interface PerformanceConfig {
  enableOptimizations: boolean
  batteryThreshold: number
  reducedFeaturesMode: boolean
  backgroundSyncEnabled: boolean
  imageQuality: 'high' | 'medium' | 'low'
  voiceRecordingQuality: 'high' | 'medium' | 'low'
}

class BatteryOptimizationManager {
  private battery: any = null
  private config: PerformanceConfig = {
    enableOptimizations: true,
    batteryThreshold: 0.2, // 20%
    reducedFeaturesMode: false,
    backgroundSyncEnabled: true,
    imageQuality: 'high',
    voiceRecordingQuality: 'high'
  }
  private listeners: Array<(config: PerformanceConfig) => void> = []

  async initialize(): Promise<void> {
    try {
      // Check for Battery API support
      if ('getBattery' in navigator) {
        this.battery = await (navigator as any).getBattery()
        this.setupBatteryListeners()
        this.updatePerformanceConfig()
      } else {
        console.warn('Battery API not supported')
        // Use fallback optimizations based on device characteristics
        this.setupFallbackOptimizations()
      }
    } catch (error) {
      console.error('Failed to initialize battery optimization:', error)
      this.setupFallbackOptimizations()
    }
  }

  private setupBatteryListeners(): void {
    if (!this.battery) return

    const updateConfig = () => {
      this.updatePerformanceConfig()
    }

    this.battery.addEventListener('levelchange', updateConfig)
    this.battery.addEventListener('chargingchange', updateConfig)
  }

  private updatePerformanceConfig(): void {
    if (!this.battery) return

    const batteryLevel = this.battery.level
    const isCharging = this.battery.charging
    const isLowBattery = batteryLevel < this.config.batteryThreshold

    // Adjust configuration based on battery state
    this.config.reducedFeaturesMode = isLowBattery && !isCharging
    
    if (this.config.reducedFeaturesMode) {
      this.config.imageQuality = 'medium'
      this.config.voiceRecordingQuality = 'medium'
      this.config.backgroundSyncEnabled = false
    } else if (isCharging || batteryLevel > 0.5) {
      this.config.imageQuality = 'high'
      this.config.voiceRecordingQuality = 'high'
      this.config.backgroundSyncEnabled = true
    } else {
      this.config.imageQuality = 'medium'
      this.config.voiceRecordingQuality = 'medium'
      this.config.backgroundSyncEnabled = true
    }

    // Notify listeners
    this.notifyListeners()
  }

  private setupFallbackOptimizations(): void {
    // Use device characteristics to determine optimizations
    const deviceMemory = (navigator as any).deviceMemory || 4
    const hardwareConcurrency = navigator.hardwareConcurrency || 4
    const isSlowDevice = deviceMemory < 4 || hardwareConcurrency < 4

    if (isSlowDevice) {
      this.config.imageQuality = 'medium'
      this.config.voiceRecordingQuality = 'medium'
      this.config.reducedFeaturesMode = true
    }

    this.notifyListeners()
  }

  getBatteryInfo(): BatteryInfo | null {
    if (!this.battery) return null

    return {
      level: this.battery.level,
      charging: this.battery.charging,
      chargingTime: this.battery.chargingTime,
      dischargingTime: this.battery.dischargingTime
    }
  }

  getPerformanceConfig(): PerformanceConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates }
    this.notifyListeners()
  }

  onConfigChange(listener: (config: PerformanceConfig) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config))
  }

  // Battery-aware image compression
  getImageCompressionSettings(): {
    maxWidth: number
    maxHeight: number
    quality: number
  } {
    const settings = {
      high: { maxWidth: 1920, maxHeight: 1080, quality: 0.9 },
      medium: { maxWidth: 1280, maxHeight: 720, quality: 0.8 },
      low: { maxWidth: 854, maxHeight: 480, quality: 0.7 }
    }

    return settings[this.config.imageQuality]
  }

  // Battery-aware voice recording settings
  getVoiceRecordingSettings(): {
    sampleRate: number
    bitRate: number
    format: string
  } {
    const settings = {
      high: { sampleRate: 44100, bitRate: 128000, format: 'audio/webm;codecs=opus' },
      medium: { sampleRate: 22050, bitRate: 64000, format: 'audio/webm;codecs=opus' },
      low: { sampleRate: 16000, bitRate: 32000, format: 'audio/webm;codecs=opus' }
    }

    return settings[this.config.voiceRecordingQuality]
  }

  // Adaptive background sync
  shouldEnableBackgroundSync(): boolean {
    return this.config.backgroundSyncEnabled && !this.config.reducedFeaturesMode
  }

  // Power-efficient animation settings
  getAnimationSettings(): {
    enableAnimations: boolean
    duration: number
    easing: string
  } {
    if (this.config.reducedFeaturesMode) {
      return {
        enableAnimations: false,
        duration: 0,
        easing: 'linear'
      }
    }

    return {
      enableAnimations: true,
      duration: 300,
      easing: 'ease-out'
    }
  }

  // Network request optimization
  getNetworkSettings(): {
    timeout: number
    retries: number
    batchRequests: boolean
  } {
    if (this.config.reducedFeaturesMode) {
      return {
        timeout: 10000,
        retries: 1,
        batchRequests: true
      }
    }

    return {
      timeout: 15000,
      retries: 3,
      batchRequests: false
    }
  }
}

// Memory optimization utilities
class MemoryOptimizationManager {
  private memoryThreshold = 50 * 1024 * 1024 // 50MB
  private cleanupInterval: NodeJS.Timeout | null = null

  initialize(): void {
    // Start periodic memory cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, 60000) // Every minute

    // Listen for memory pressure events
    if ('memory' in performance) {
      this.monitorMemoryUsage()
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  private monitorMemoryUsage(): void {
    const checkMemory = () => {
      const memInfo = (performance as any).memory
      if (memInfo && memInfo.usedJSHeapSize > this.memoryThreshold) {
        this.performAggressiveCleanup()
      }
    }

    // Check memory usage periodically
    setInterval(checkMemory, 30000) // Every 30 seconds
  }

  private performCleanup(): void {
    // Clean up cached images
    this.cleanupImageCache()
    
    // Clean up voice recordings
    this.cleanupVoiceCache()
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc()
    }
  }

  private performAggressiveCleanup(): void {
    console.log('Performing aggressive memory cleanup')
    
    // Clear all non-essential caches
    this.clearNonEssentialCaches()
    
    // Reduce image quality temporarily
    batteryOptimizationManager.updateConfig({
      imageQuality: 'low',
      voiceRecordingQuality: 'low'
    })
    
    // Force cleanup
    this.performCleanup()
  }

  private cleanupImageCache(): void {
    // Clean up old blob URLs
    const blobUrls = document.querySelectorAll('img[src^="blob:"]')
    blobUrls.forEach(img => {
      const src = (img as HTMLImageElement).src
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src)
      }
    })
  }

  private cleanupVoiceCache(): void {
    // Clean up audio blob URLs
    const audioUrls = document.querySelectorAll('audio[src^="blob:"]')
    audioUrls.forEach(audio => {
      const src = (audio as HTMLAudioElement).src
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src)
      }
    })
  }

  private clearNonEssentialCaches(): void {
    // Clear various caches except critical ones
    try {
      // Clear session storage (non-critical data)
      const nonCriticalKeys = Object.keys(sessionStorage).filter(key => 
        !key.includes('auth') && !key.includes('critical')
      )
      nonCriticalKeys.forEach(key => sessionStorage.removeItem(key))
      
      // Clear old IndexedDB entries if needed
      this.cleanupIndexedDB()
    } catch (error) {
      console.error('Cache cleanup failed:', error)
    }
  }

  private async cleanupIndexedDB(): Promise<void> {
    try {
      // This would integrate with the image cache system
      // to remove old, non-critical cached images
      const { cleanupImageCache } = await import('@/lib/storage/image-cache')
      await cleanupImageCache()
    } catch (error) {
      console.error('IndexedDB cleanup failed:', error)
    }
  }

  getMemoryInfo(): {
    used: number
    total: number
    percentage: number
  } | null {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      return {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        percentage: (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100
      }
    }
    return null
  }
}

// Singleton instances
const batteryOptimizationManager = new BatteryOptimizationManager()
const memoryOptimizationManager = new MemoryOptimizationManager()

// Initialize on module load
if (typeof window !== 'undefined') {
  batteryOptimizationManager.initialize()
  memoryOptimizationManager.initialize()
}

// Exported functions
export async function initializePerformanceOptimization(): Promise<void> {
  await batteryOptimizationManager.initialize()
  memoryOptimizationManager.initialize()
}

export function getBatteryInfo(): BatteryInfo | null {
  return batteryOptimizationManager.getBatteryInfo()
}

export function getPerformanceConfig(): PerformanceConfig {
  return batteryOptimizationManager.getPerformanceConfig()
}

export function updatePerformanceConfig(updates: Partial<PerformanceConfig>): void {
  batteryOptimizationManager.updateConfig(updates)
}

export function onPerformanceConfigChange(
  listener: (config: PerformanceConfig) => void
): () => void {
  return batteryOptimizationManager.onConfigChange(listener)
}

export function getOptimizedImageSettings(): {
  maxWidth: number
  maxHeight: number
  quality: number
} {
  return batteryOptimizationManager.getImageCompressionSettings()
}

export function getOptimizedVoiceSettings(): {
  sampleRate: number
  bitRate: number
  format: string
} {
  return batteryOptimizationManager.getVoiceRecordingSettings()
}

export function shouldEnableBackgroundSync(): boolean {
  return batteryOptimizationManager.shouldEnableBackgroundSync()
}

export function getOptimizedAnimationSettings(): {
  enableAnimations: boolean
  duration: number
  easing: string
} {
  return batteryOptimizationManager.getAnimationSettings()
}

export function getOptimizedNetworkSettings(): {
  timeout: number
  retries: number
  batchRequests: boolean
} {
  return batteryOptimizationManager.getNetworkSettings()
}

export function getMemoryInfo(): {
  used: number
  total: number
  percentage: number
} | null {
  return memoryOptimizationManager.getMemoryInfo()
}

export function performMemoryCleanup(): void {
  memoryOptimizationManager['performCleanup']()
}

export { type BatteryInfo, type PerformanceConfig }