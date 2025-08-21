'use client'

import * as React from 'react'
import { useUIStore } from '@/stores/ui-store'

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const { 
    setInstallPromptEvent, 
    setIsInstallable, 
    setIsInstalled,
    setOnlineStatus,
    addToast
  } = useUIStore()

  React.useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault()
      setInstallPromptEvent(event)
      setIsInstallable(true)
      
      addToast({
        type: 'info',
        title: 'Install WineSnap',
        description: 'Add WineSnap to your home screen for the best experience',
        duration: 8000,
      })
    }

    // Handle successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPromptEvent(null)
      
      addToast({
        type: 'success',
        title: 'WineSnap Installed!',
        description: 'WineSnap has been added to your home screen',
      })
    }

    // Handle online/offline status
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    // Set initial online status
    setOnlineStatus(navigator.onLine)

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [
    setInstallPromptEvent,
    setIsInstallable,
    setIsInstalled,
    setOnlineStatus,
    addToast,
  ])

  // Handle service worker registration
  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  // Handle theme initialization
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('winesnap-theme')
    if (storedTheme) {
      const theme = storedTheme as 'light' | 'dark' | 'system'
      
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        document.documentElement.classList.toggle('dark', mediaQuery.matches)
        
        // Listen for system theme changes
        const handleThemeChange = (e: MediaQueryListEvent) => {
          document.documentElement.classList.toggle('dark', e.matches)
        }
        
        mediaQuery.addEventListener('change', handleThemeChange)
        
        return () => {
          mediaQuery.removeEventListener('change', handleThemeChange)
        }
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    }
  }, [])

  return <>{children}</>
}