'use client'

import React, { useState, useEffect } from 'react'
import { X, Download, Smartphone, Share, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { Modal } from '@/components/ui/modal'

interface InstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  const {
    isInstallable,
    installPromptEvent,
    triggerInstallPrompt,
    setIsInstallable,
    addToast
  } = useUIStore()

  const [showModal, setShowModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [browserName, setBrowserName] = useState('')

  useEffect(() => {
    // Detect platform and browser
    const userAgent = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroidDevice = /Android/.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
    const isChrome = /Chrome/.test(userAgent)
    const isFirefox = /Firefox/.test(userAgent)
    
    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)
    
    if (isSafari) setBrowserName('Safari')
    else if (isChrome) setBrowserName('Chrome')
    else if (isFirefox) setBrowserName('Firefox')
    else setBrowserName('your browser')

    // Show install prompt after a delay if installable
    if (isInstallable && !localStorage.getItem('winesnap-install-dismissed')) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isInstallable])

  const handleInstall = async () => {
    try {
      await triggerInstallPrompt()
      setShowModal(false)
      onInstall?.()
      
      // Track install attempt
      localStorage.setItem('winesnap-install-attempted', 'true')
    } catch (error) {
      console.error('Install failed:', error)
      addToast({
        type: 'error',
        title: 'Installation Failed',
        description: 'Please try installing from your browser menu'
      })
    }
  }

  const handleDismiss = () => {
    setShowModal(false)
    setIsInstallable(false)
    onDismiss?.()
    
    // Remember dismissal for 7 days
    const dismissTime = Date.now() + (7 * 24 * 60 * 60 * 1000)
    localStorage.setItem('winesnap-install-dismissed', dismissTime.toString())
  }

  const handleManualInstall = () => {
    setShowModal(false)
    
    addToast({
      type: 'info',
      title: 'Install WineSnap',
      description: isIOS 
        ? 'Tap the Share button and select "Add to Home Screen"'
        : 'Use your browser menu to install WineSnap',
      duration: 8000
    })
  }

  if (!showModal && !isInstallable) {
    return null
  }

  return (
    <>
      {/* Floating install banner */}
      {isInstallable && !showModal && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-lg border border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Install WineSnap</p>
                <p className="text-xs text-red-100">
                  Get the full app experience
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowModal(true)}
                  className="text-white hover:bg-white/10"
                >
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/10 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Install WineSnap"
        className="max-w-md"
      >
        <div className="space-y-6">
          {/* App preview */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🍷</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add WineSnap to Home Screen
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Install WineSnap for the best wine tasting experience
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Native app experience
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Works offline
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Share className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Quick access from home screen
              </span>
            </div>
          </div>

          {/* Platform-specific instructions */}
          {isIOS && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Install on iOS {browserName}:
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Tap the <Share className="inline h-3 w-3" /> Share button</li>
                <li>2. Scroll down and tap "Add to Home Screen"</li>
                <li>3. Tap "Add" to confirm</li>
              </ol>
            </div>
          )}

          {isAndroid && !installPromptEvent && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Install on Android {browserName}:
              </h4>
              <ol className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>1. Tap the menu (⋮) in {browserName}</li>
                <li>2. Select "Add to Home screen" or "Install app"</li>
                <li>3. Tap "Install" to confirm</li>
              </ol>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {installPromptEvent ? (
              <>
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="px-4"
                >
                  Later
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleManualInstall}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Show Instructions
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="px-4"
                >
                  Dismiss
                </Button>
              </>
            )}
          </div>

          {/* Additional info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            WineSnap is a Progressive Web App that works on all devices
          </div>
        </div>
      </Modal>
    </>
  )
}

// Install button component for header/menu
export function InstallButton() {
  const { isInstallable, isInstalled, triggerInstallPrompt } = useUIStore()
  
  if (isInstalled || !isInstallable) {
    return null
  }

  return (
    <Button
      onClick={triggerInstallPrompt}
      size="sm"
      variant="outline"
      className="hidden md:flex"
    >
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  )
}

// Compact install prompt for mobile
export function CompactInstallPrompt() {
  const { isInstallable, triggerInstallPrompt } = useUIStore()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const dismissTime = localStorage.getItem('winesnap-install-dismissed')
    if (dismissTime && Date.now() < parseInt(dismissTime)) {
      setDismissed(true)
    }
  }, [])

  if (!isInstallable || dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    const dismissTime = Date.now() + (7 * 24 * 60 * 60 * 1000)
    localStorage.setItem('winesnap-install-dismissed', dismissTime.toString())
  }

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-sm flex items-center justify-between md:hidden">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        <span>Install WineSnap for better experience</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={triggerInstallPrompt}
          className="text-white hover:text-red-200 font-medium"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-red-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}