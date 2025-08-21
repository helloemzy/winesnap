// Push notification system for WineSnap social features

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: any
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  timestamp?: number
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

class PushNotificationManager {
  private vapidPublicKey: string = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null

  async initialize(): Promise<boolean> {
    try {
      // Check for service worker support
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported')
        return false
      }

      // Check for push notification support
      if (!('PushManager' in window)) {
        console.warn('Push messaging not supported')
        return false
      }

      // Get service worker registration
      this.serviceWorkerRegistration = await navigator.serviceWorker.ready
      
      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        console.log('Notification permission granted')
        return permission
      } else if (permission === 'denied') {
        console.warn('Notification permission denied')
        return permission
      } else {
        console.log('Notification permission default (not granted)')
        return permission
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  async subscribe(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        await this.initialize()
      }

      if (!this.serviceWorkerRegistration) {
        throw new Error('Service Worker not available')
      }

      // Check current subscription
      let subscription = await this.serviceWorkerRegistration.pushManager.getSubscription()

      if (!subscription) {
        // Create new subscription
        subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        })
      }

      // Convert to serializable format
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }

      // Save subscription to backend
      await this.saveSubscriptionToBackend(subscriptionData)

      return subscriptionData
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.serviceWorkerRegistration) {
        return true
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription()
      
      if (subscription) {
        const success = await subscription.unsubscribe()
        if (success) {
          // Remove subscription from backend
          await this.removeSubscriptionFromBackend(subscription.endpoint)
        }
        return success
      }

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  async getSubscription(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        await this.initialize()
      }

      if (!this.serviceWorkerRegistration) {
        return null
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription()
      
      if (subscription) {
        return {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
          }
        }
      }

      return null
    } catch (error) {
      console.error('Failed to get push subscription:', error)
      return null
    }
  }

  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted')
        return
      }

      if (!this.serviceWorkerRegistration) {
        await this.initialize()
      }

      if (!this.serviceWorkerRegistration) {
        // Fallback to regular notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/badge-96x96.png'
        })
        return
      }

      // Show notification through service worker
      await this.serviceWorkerRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-96x96.png',
        image: payload.image,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
        vibrate: payload.vibrate || [200, 100, 200],
        timestamp: payload.timestamp || Date.now()
      })
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  // Wine-specific notification helpers
  async notifyNewTastingShared(wineName: string, sharedBy: string): Promise<void> {
    await this.showLocalNotification({
      title: 'New Wine Tasting Shared',
      body: `${sharedBy} shared a tasting of ${wineName}`,
      icon: '/icons/wine-share.png',
      data: {
        type: 'wine_shared',
        action: 'view_tasting'
      },
      actions: [
        { action: 'view', title: 'View Tasting' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  }

  async notifyTastingReminder(wineName: string, minutes: number): Promise<void> {
    await this.showLocalNotification({
      title: 'Wine Tasting Reminder',
      body: `Ready to taste ${wineName}? Decanting time: ${minutes} minutes`,
      icon: '/icons/wine-timer.png',
      data: {
        type: 'tasting_reminder',
        wine: wineName
      },
      requireInteraction: true,
      actions: [
        { action: 'start_tasting', title: 'Start Tasting' },
        { action: 'snooze', title: 'Snooze 10min' }
      ]
    })
  }

  async notifyWineRecommendation(wineName: string, reason: string): Promise<void> {
    await this.showLocalNotification({
      title: 'Wine Recommendation',
      body: `Based on your taste profile: ${wineName}. ${reason}`,
      icon: '/icons/wine-recommendation.png',
      data: {
        type: 'wine_recommendation',
        wine: wineName
      },
      actions: [
        { action: 'learn_more', title: 'Learn More' },
        { action: 'add_wishlist', title: 'Add to Wishlist' }
      ]
    })
  }

  async notifyFriendActivity(friendName: string, activity: string): Promise<void> {
    await this.showLocalNotification({
      title: 'Friend Activity',
      body: `${friendName} ${activity}`,
      icon: '/icons/friend-activity.png',
      data: {
        type: 'friend_activity',
        friend: friendName
      },
      actions: [
        { action: 'view_profile', title: 'View Profile' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  }

  async scheduleLocalNotification(payload: NotificationPayload, delay: number): Promise<void> {
    // Schedule notification using setTimeout for simple delays
    // For complex scheduling, you'd use a more sophisticated system
    setTimeout(() => {
      this.showLocalNotification(payload)
    }, delay)
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    
    return window.btoa(binary)
  }

  private async saveSubscriptionToBackend(subscription: PushSubscriptionData): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }
    } catch (error) {
      console.error('Failed to save subscription to backend:', error)
    }
  }

  private async removeSubscriptionFromBackend(endpoint: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint })
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription')
      }
    } catch (error) {
      console.error('Failed to remove subscription from backend:', error)
    }
  }
}

// Singleton instance
const pushNotificationManager = new PushNotificationManager()

// Exported functions
export async function initializePushNotifications(): Promise<boolean> {
  return pushNotificationManager.initialize()
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  return pushNotificationManager.requestPermission()
}

export async function subscribeToPushNotifications(): Promise<PushSubscriptionData | null> {
  return pushNotificationManager.subscribe()
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  return pushNotificationManager.unsubscribe()
}

export async function getPushSubscription(): Promise<PushSubscriptionData | null> {
  return pushNotificationManager.getSubscription()
}

export async function showNotification(payload: NotificationPayload): Promise<void> {
  return pushNotificationManager.showLocalNotification(payload)
}

// Wine-specific notification helpers
export async function notifyNewTastingShared(wineName: string, sharedBy: string): Promise<void> {
  return pushNotificationManager.notifyNewTastingShared(wineName, sharedBy)
}

export async function notifyTastingReminder(wineName: string, minutes: number): Promise<void> {
  return pushNotificationManager.notifyTastingReminder(wineName, minutes)
}

export async function notifyWineRecommendation(wineName: string, reason: string): Promise<void> {
  return pushNotificationManager.notifyWineRecommendation(wineName, reason)
}

export async function notifyFriendActivity(friendName: string, activity: string): Promise<void> {
  return pushNotificationManager.notifyFriendActivity(friendName, activity)
}

export async function scheduleNotification(payload: NotificationPayload, delay: number): Promise<void> {
  return pushNotificationManager.scheduleLocalNotification(payload, delay)
}

export { type NotificationPayload, type NotificationAction, type PushSubscriptionData }