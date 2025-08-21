'use client'

import React, { useState, useEffect } from 'react'
import { 
  Camera, 
  Mic, 
  Bell, 
  Smartphone, 
  Wifi, 
  WifiOff,
  Battery,
  BatteryLow,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Zap,
  HardDrive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useUIStore } from '@/stores/ui-store'
import { 
  getBatteryInfo,
  getPerformanceConfig,
  getMemoryInfo,
  type BatteryInfo,
  type PerformanceConfig 
} from '@/lib/performance/battery-optimization'
import { 
  getSyncStats,
  getCacheStats,
  type SyncStats 
} from '@/lib/sync/offline-sync'

interface PWAFeatureStatus {
  name: string
  status: 'enabled' | 'disabled' | 'unavailable'
  description: string
  icon: React.ReactNode
  action?: () => void
  actionLabel?: string
}

export function MobilePWAStatus() {
  const [isOpen, setIsOpen] = useState(false)
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null)
  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig | null>(null)
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [memoryInfo, setMemoryInfo] = useState<any>(null)
  const [cacheStats, setCacheStats] = useState<any>(null)

  const {
    cameraPermission,
    microphonePermission,
    isInstalled,
    isOnline,
    requestCameraPermission,
    requestMicrophonePermission,
    triggerInstallPrompt
  } = useUIStore()

  useEffect(() => {
    const updateStats = async () => {
      setBatteryInfo(getBatteryInfo())
      setPerformanceConfig(getPerformanceConfig())
      setSyncStats(getSyncStats())
      setMemoryInfo(getMemoryInfo())
      
      try {
        const { getCacheStats: getImageCacheStats } = await import('@/lib/storage/image-cache')
        setCacheStats(await getImageCacheStats())
      } catch (error) {
        console.error('Failed to get cache stats:', error)
      }
    }

    updateStats()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const features: PWAFeatureStatus[] = [
    {
      name: 'Camera Access',
      status: cameraPermission === 'granted' ? 'enabled' : 
              cameraPermission === 'denied' ? 'disabled' : 'unavailable',
      description: 'Take photos of wine bottles and labels',
      icon: <Camera className="h-5 w-5" />,
      action: cameraPermission !== 'granted' ? requestCameraPermission : undefined,
      actionLabel: 'Enable Camera'
    },
    {
      name: 'Microphone Access',
      status: microphonePermission === 'granted' ? 'enabled' : 
              microphonePermission === 'denied' ? 'disabled' : 'unavailable',
      description: 'Record voice memos during tastings',
      icon: <Mic className="h-5 w-5" />,
      action: microphonePermission !== 'granted' ? requestMicrophonePermission : undefined,
      actionLabel: 'Enable Microphone'
    },
    {
      name: 'Push Notifications',
      status: Notification.permission === 'granted' ? 'enabled' : 
              Notification.permission === 'denied' ? 'disabled' : 'unavailable',
      description: 'Get notified about tastings and recommendations',
      icon: <Bell className="h-5 w-5" />,
      action: Notification.permission !== 'granted' ? 
        () => Notification.requestPermission() : undefined,
      actionLabel: 'Enable Notifications'
    },
    {
      name: 'App Installation',
      status: isInstalled ? 'enabled' : 'unavailable',
      description: 'Install WineSnap on your home screen',
      icon: <Smartphone className="h-5 w-5" />,
      action: !isInstalled ? triggerInstallPrompt : undefined,
      actionLabel: 'Install App'
    },
    {
      name: 'Offline Support',
      status: 'serviceWorker' in navigator ? 'enabled' : 'unavailable',
      description: 'Use WineSnap without internet connection',
      icon: isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />
    },
    {
      name: 'Background Sync',
      status: syncStats?.totalItems !== undefined ? 'enabled' : 'unavailable',
      description: 'Sync data automatically when online',
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const getStatusIcon = (status: PWAFeatureStatus['status']) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disabled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: PWAFeatureStatus['status']) => {
    switch (status) {
      case 'enabled':
        return 'text-green-600 dark:text-green-400'
      case 'disabled':
        return 'text-red-600 dark:text-red-400'
      case 'unavailable':
        return 'text-yellow-600 dark:text-yellow-400'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        PWA Status
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Mobile PWA Status"
        className="max-w-lg"
      >
        <div className="space-y-6">
          {/* System status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Battery */}
            {batteryInfo && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {batteryInfo.level < 0.2 ? (
                    <BatteryLow className="h-5 w-5 text-red-500" />
                  ) : (
                    <Battery className="h-5 w-5 text-gray-600" />
                  )}
                  <span className="font-medium text-sm">Battery</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(batteryInfo.level * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  {batteryInfo.charging ? 'Charging' : 'Not charging'}
                </div>
              </div>
            )}

            {/* Memory */}
            {memoryInfo && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-sm">Memory</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(memoryInfo.percentage)}%
                </div>
                <div className="text-xs text-gray-500">
                  {formatBytes(memoryInfo.used)} used
                </div>
              </div>
            )}
          </div>

          {/* Performance config */}
          {performanceConfig && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Performance Mode
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Image Quality:</span>
                  <span className="ml-2 capitalize">{performanceConfig.imageQuality}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Voice Quality:</span>
                  <span className="ml-2 capitalize">{performanceConfig.voiceRecordingQuality}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Background Sync:</span>
                  <span className="ml-2">{performanceConfig.backgroundSyncEnabled ? 'On' : 'Off'}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Power Save:</span>
                  <span className="ml-2">{performanceConfig.reducedFeaturesMode ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sync status */}
          {syncStats && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Sync Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-green-700 dark:text-green-300">Pending Items:</span>
                  <span className="ml-2">{syncStats.totalItems}</span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Status:</span>
                  <span className="ml-2">{syncStats.isSyncing ? 'Syncing' : 'Idle'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cache stats */}
          {cacheStats && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Cache Statistics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-purple-700 dark:text-purple-300">Images Cached:</span>
                  <span className="ml-2">{cacheStats.imageCount}</span>
                </div>
                <div>
                  <span className="text-purple-700 dark:text-purple-300">Cache Size:</span>
                  <span className="ml-2">{formatBytes(cacheStats.totalSize)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Features list */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              PWA Features
            </h4>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-600 dark:text-gray-400">
                      {feature.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {feature.name}
                        </span>
                        {getStatusIcon(feature.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {feature.action && feature.actionLabel && (
                    <Button
                      onClick={feature.action}
                      size="sm"
                      variant="outline"
                      className="ml-4"
                    >
                      {feature.actionLabel}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Features Status:
              </span>
              <div className="flex gap-4">
                <span className="text-green-600">
                  {features.filter(f => f.status === 'enabled').length} enabled
                </span>
                <span className="text-red-600">
                  {features.filter(f => f.status === 'disabled').length} disabled
                </span>
                <span className="text-yellow-600">
                  {features.filter(f => f.status === 'unavailable').length} unavailable
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}