import { create } from 'zustand'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

interface Modal {
  id: string
  component: React.ComponentType<any>
  props?: any
}

interface UIState {
  // Toast notifications
  toasts: ToastMessage[]
  
  // Modals
  modals: Modal[]
  
  // Loading states
  globalLoading: boolean
  
  // PWA
  installPromptEvent: any
  isInstallable: boolean
  isInstalled: boolean
  
  // Navigation
  sidebarOpen: boolean
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Offline status
  isOnline: boolean
  
  // Search
  searchModalOpen: boolean
  
  // Camera/media permissions
  cameraPermission: 'pending' | 'granted' | 'denied'
  microphonePermission: 'pending' | 'granted' | 'denied'
}

interface UIActions {
  // Toast management
  addToast: (toast: Omit<ToastMessage, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Modal management
  openModal: (component: React.ComponentType<any>, props?: any) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
  
  // Loading
  setGlobalLoading: (loading: boolean) => void
  
  // PWA
  setInstallPromptEvent: (event: any) => void
  setIsInstallable: (installable: boolean) => void
  setIsInstalled: (installed: boolean) => void
  triggerInstallPrompt: () => Promise<void>
  
  // Navigation
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Network status
  setOnlineStatus: (online: boolean) => void
  
  // Search
  setSearchModalOpen: (open: boolean) => void
  
  // Permissions
  setCameraPermission: (permission: 'pending' | 'granted' | 'denied') => void
  setMicrophonePermission: (permission: 'pending' | 'granted' | 'denied') => void
  requestCameraPermission: () => Promise<boolean>
  requestMicrophonePermission: () => Promise<boolean>
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set, get) => ({
  // State
  toasts: [],
  modals: [],
  globalLoading: false,
  installPromptEvent: null,
  isInstallable: false,
  isInstalled: false,
  sidebarOpen: false,
  theme: 'system',
  isOnline: true,
  searchModalOpen: false,
  cameraPermission: 'pending',
  microphonePermission: 'pending',

  // Toast management
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2)
    const newToast = {
      id,
      duration: 5000,
      ...toast,
    }
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, newToast.duration)
    }

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => set({ toasts: [] }),

  // Modal management
  openModal: (component, props) => {
    const id = Math.random().toString(36).substring(2)
    const modal = { id, component, props }
    
    set((state) => ({
      modals: [...state.modals, modal],
    }))

    return id
  },

  closeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    }))
  },

  closeAllModals: () => set({ modals: [] }),

  // Loading
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // PWA
  setInstallPromptEvent: (event) => set({ installPromptEvent: event }),
  setIsInstallable: (installable) => set({ isInstallable: installable }),
  setIsInstalled: (installed) => set({ isInstalled: installed }),

  triggerInstallPrompt: async () => {
    const { installPromptEvent } = get()
    
    if (!installPromptEvent) {
      get().addToast({
        type: 'info',
        title: 'Install WineSnap',
        description: 'Use your browser\'s menu to add WineSnap to your home screen',
      })
      return
    }

    try {
      const result = await installPromptEvent.prompt()
      
      if (result.outcome === 'accepted') {
        set({
          isInstalled: true,
          installPromptEvent: null,
          isInstallable: false,
        })
        
        get().addToast({
          type: 'success',
          title: 'WineSnap Installed!',
          description: 'You can now access WineSnap from your home screen',
        })
      }
    } catch (error) {
      console.error('Error during install prompt:', error)
      get().addToast({
        type: 'error',
        title: 'Installation Failed',
        description: 'Please try installing from your browser menu',
      })
    }
  },

  // Navigation
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Theme
  setTheme: (theme) => {
    set({ theme })
    
    // Apply theme to document
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      document.documentElement.classList.toggle('dark', mediaQuery.matches)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    
    // Persist theme
    localStorage.setItem('winesnap-theme', theme)
  },

  // Network status
  setOnlineStatus: (online) => {
    const wasOffline = !get().isOnline
    set({ isOnline: online })
    
    if (online && wasOffline) {
      get().addToast({
        type: 'success',
        title: 'Back Online',
        description: 'Your connection has been restored',
      })
    } else if (!online) {
      get().addToast({
        type: 'warning',
        title: 'Offline',
        description: 'You\'re currently offline. Some features may not work.',
        duration: 0, // Don't auto-dismiss
      })
    }
  },

  // Search
  setSearchModalOpen: (open) => set({ searchModalOpen: open }),

  // Permissions
  setCameraPermission: (permission) => set({ cameraPermission: permission }),
  setMicrophonePermission: (permission) => set({ microphonePermission: permission }),

  requestCameraPermission: async () => {
    try {
      set({ cameraPermission: 'pending' })
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      
      // Close stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      set({ cameraPermission: 'granted' })
      return true
    } catch (error) {
      set({ cameraPermission: 'denied' })
      get().addToast({
        type: 'error',
        title: 'Camera Permission Denied',
        description: 'Camera access is needed for wine photo capturing',
      })
      return false
    }
  },

  requestMicrophonePermission: async () => {
    try {
      set({ microphonePermission: 'pending' })
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Close stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      set({ microphonePermission: 'granted' })
      return true
    } catch (error) {
      set({ microphonePermission: 'denied' })
      get().addToast({
        type: 'error',
        title: 'Microphone Permission Denied',
        description: 'Microphone access is needed for voice memos',
      })
      return false
    }
  },
}))

// Helper hooks
export const useToasts = () => useUIStore((state) => state.toasts)
export const useModals = () => useUIStore((state) => state.modals)
export const useGlobalLoading = () => useUIStore((state) => state.globalLoading)
export const useInstallable = () => useUIStore((state) => state.isInstallable)
export const useTheme = () => useUIStore((state) => state.theme)
export const useOnlineStatus = () => useUIStore((state) => state.isOnline)