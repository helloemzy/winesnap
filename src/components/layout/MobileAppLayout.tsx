'use client'

import React, { useEffect, useState } from 'react'
import { 
  Wine, 
  Camera, 
  BookOpen, 
  User, 
  Settings,
  Plus,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { InstallPrompt, CompactInstallPrompt } from '@/components/pwa/InstallPrompt'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { MobileTastingInterface } from '@/components/mobile/MobileTastingInterface'
import { 
  initializePerformanceOptimization,
  onPerformanceConfigChange,
  getBatteryInfo,
  type PerformanceConfig 
} from '@/lib/performance/battery-optimization'
import { 
  initializeOfflineSync,
  onSyncUpdate,
  getSyncStats,
  type SyncStats 
} from '@/lib/sync/offline-sync'
import { initializePushNotifications } from '@/lib/notifications/push-notifications'

interface MobileAppLayoutProps {
  children: React.ReactNode
}

export function MobileAppLayout({ children }: MobileAppLayoutProps) {
  const [activeTab, setActiveTab] = useState('home')
  const [showTasting, setShowTasting] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig | null>(null)
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [batteryInfo, setBatteryInfo] = useState<any>(null)
  
  const { 
    isOnline, 
    addToast,
    globalLoading 
  } = useUIStore()

  // Initialize mobile optimizations
  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          initializePerformanceOptimization(),
          initializeOfflineSync(),
          initializePushNotifications()
        ])

        // Set up performance monitoring
        const unsubscribePerf = onPerformanceConfigChange(setPerformanceConfig)
        const unsubscribeSync = onSyncUpdate(setSyncStats)
        
        // Update battery info
        const updateBattery = () => {
          const info = getBatteryInfo()
          setBatteryInfo(info)
        }
        
        updateBattery()
        const batteryInterval = setInterval(updateBattery, 60000) // Every minute

        return () => {
          unsubscribePerf()
          unsubscribeSync()
          clearInterval(batteryInterval)
        }
      } catch (error) {
        console.error('Failed to initialize mobile optimizations:', error)
        addToast({
          type: 'error',
          title: 'Initialization Error',
          description: 'Some features may not work optimally'
        })
      }
    }

    initialize()
  }, [addToast])

  // Haptic feedback for navigation
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
  }

  const handleTabChange = (tab: string) => {
    triggerHaptic()
    setActiveTab(tab)
  }

  const handleNewTasting = () => {
    triggerHaptic()
    setShowTasting(true)
  }

  const handleTastingComplete = (data: any) => {
    setShowTasting(false)
    addToast({
      type: 'success',
      title: 'Tasting Saved!',
      description: 'Your wine evaluation has been recorded.'
    })
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: Wine },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Status bar indicators */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500" />
          )}
          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          
          {syncStats && syncStats.totalItems > 0 && (
            <span className="text-blue-600">
              {syncStats.isSyncing ? 'Syncing...' : `${syncStats.totalItems} pending`}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {batteryInfo && (
            <div className="flex items-center gap-1">
              {batteryInfo.level < 0.2 ? (
                <BatteryLow className="h-3 w-3 text-red-500" />
              ) : (
                <Battery className="h-3 w-3 text-gray-500" />
              )}
              <span className={batteryInfo.level < 0.2 ? 'text-red-600' : 'text-gray-600'}>
                {Math.round(batteryInfo.level * 100)}%
              </span>
            </div>
          )}
          
          {performanceConfig?.reducedFeaturesMode && (
            <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
              Power Save
            </span>
          )}
        </div>
      </div>

      {/* Compact install prompt */}
      <CompactInstallPrompt />

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {showTasting ? (
          <MobileTastingInterface
            onComplete={handleTastingComplete}
            onCancel={() => setShowTasting(false)}
          />
        ) : (
          <div className="h-full">
            {children}
          </div>
        )}
      </div>

      {/* Floating action button */}
      {!showTasting && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            onClick={handleNewTasting}
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Bottom navigation */}
      {!showTasting && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
          <div className="grid grid-cols-4 h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    isActive
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* PWA components */}
      <InstallPrompt />
      
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Global loading overlay */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-900 dark:text-white">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Safe area utilities for devices with notches/home indicators
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add CSS custom properties for safe areas
    const root = document.documentElement
    
    // Detect safe area support
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
      root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)')
      root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)')
      root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)')
      root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)')
    } else {
      // Fallback for older devices
      root.style.setProperty('--safe-area-top', '0px')
      root.style.setProperty('--safe-area-bottom', '0px')
      root.style.setProperty('--safe-area-left', '0px')
      root.style.setProperty('--safe-area-right', '0px')
    }
  }, [])

  return <>{children}</>
}

// Performance monitoring component
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    const updateMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        })
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!metrics || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-0 left-0 bg-black/80 text-white text-xs p-2 z-50">
      <div>Memory: {metrics.used}MB / {metrics.total}MB</div>
      <div>Limit: {metrics.limit}MB</div>
    </div>
  )
}