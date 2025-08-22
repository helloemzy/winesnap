'use client'

import React, { useEffect, useRef, useState } from 'react'
import { 
  Mic, 
  Camera, 
  Square, 
  RotateCcw, 
  FlashOn, 
  FlashOff,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Zap
} from 'lucide-react'
import { MobileVoiceGestures } from '@/lib/voice/enhanced-voice-processor'
import { useUIStore } from '@/stores/ui-store'
import { usePetStore } from '@/stores/pet-store'

interface MobileGestureCaptureProps {
  isRecording: boolean
  isStreaming: boolean
  captureMode: 'voice' | 'camera'
  recordingDuration: number
  voiceVolume: number
  onStartRecording: () => void
  onStopRecording: () => void
  onCapturePhoto: () => void
  onSwitchMode: (mode: 'voice' | 'camera') => void
  onSwitchCamera?: () => void
  onToggleFlash?: () => void
}

export function MobileGestureCapture({
  isRecording,
  isStreaming,
  captureMode,
  recordingDuration,
  voiceVolume,
  onStartRecording,
  onStopRecording,
  onCapturePhoto,
  onSwitchMode,
  onSwitchCamera,
  onToggleFlash
}: MobileGestureCaptureProps) {
  const captureButtonRef = useRef<HTMLButtonElement>(null)
  const gestureControlRef = useRef<MobileVoiceGestures | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [gestureHint, setGestureHint] = useState('')
  const [hapticSupported, setHapticSupported] = useState(false)
  
  const { addToast } = useUIStore()
  const { currentPet } = usePetStore()

  // Initialize gesture controls
  useEffect(() => {
    if (!captureButtonRef.current) return

    const buttonElement = captureButtonRef.current
    gestureControlRef.current = new MobileVoiceGestures(buttonElement)

    // Check for haptic feedback support
    setHapticSupported('vibrate' in navigator)

    // Gesture event listeners
    const handleLongPressStart = () => {
      setIsLongPressing(true)
      setGestureHint('Long press to record voice')
      
      if (captureMode === 'voice' && !isRecording) {
        onStartRecording()
        triggerHapticFeedback('success')
      }
    }

    const handleLongPressEnd = () => {
      setIsLongPressing(false)
      setGestureHint('')
      
      if (captureMode === 'voice' && isRecording) {
        onStopRecording()
        triggerHapticFeedback('success')
      }
    }

    const handleSingleTap = () => {
      if (captureMode === 'camera' && isStreaming) {
        onCapturePhoto()
        triggerHapticFeedback('success')
      } else if (captureMode === 'voice') {
        // Single tap to start/stop recording
        if (isRecording) {
          onStopRecording()
        } else {
          onStartRecording()
        }
        triggerHapticFeedback('light')
      }
    }

    const handleDoubleTap = () => {
      // Double tap to switch modes
      const newMode = captureMode === 'voice' ? 'camera' : 'voice'
      onSwitchMode(newMode)
      triggerHapticFeedback('selection')
      
      addToast({
        type: 'info',
        title: 'Mode Switched',
        description: `Switched to ${newMode} mode`,
        duration: 2000
      })
    }

    const handleSwipeUp = () => {
      // Swipe up to toggle flash (camera mode)
      if (captureMode === 'camera' && onToggleFlash) {
        onToggleFlash()
        triggerHapticFeedback('light')
        setGestureHint('Flash toggled')
        setTimeout(() => setGestureHint(''), 1000)
      }
    }

    const handleSwipeDown = () => {
      // Swipe down to switch camera (camera mode)
      if (captureMode === 'camera' && onSwitchCamera) {
        onSwitchCamera()
        triggerHapticFeedback('light')
        setGestureHint('Camera switched')
        setTimeout(() => setGestureHint(''), 1000)
      }
    }

    // Add event listeners
    buttonElement.addEventListener('longPressStart', handleLongPressStart)
    buttonElement.addEventListener('longPressEnd', handleLongPressEnd)
    buttonElement.addEventListener('singleTap', handleSingleTap)
    buttonElement.addEventListener('doubleTap', handleDoubleTap)
    buttonElement.addEventListener('swipeUp', handleSwipeUp)
    buttonElement.addEventListener('swipeDown', handleSwipeDown)

    // Cleanup
    return () => {
      buttonElement.removeEventListener('longPressStart', handleLongPressStart)
      buttonElement.removeEventListener('longPressEnd', handleLongPressEnd)
      buttonElement.removeEventListener('singleTap', handleSingleTap)
      buttonElement.removeEventListener('doubleTap', handleDoubleTap)
      buttonElement.removeEventListener('swipeUp', handleSwipeUp)
      buttonElement.removeEventListener('swipeDown', handleSwipeDown)
      
      if (gestureControlRef.current) {
        gestureControlRef.current.destroy()
      }
    }
  }, [
    captureMode, 
    isRecording, 
    isStreaming, 
    onStartRecording, 
    onStopRecording, 
    onCapturePhoto, 
    onSwitchMode, 
    onSwitchCamera, 
    onToggleFlash, 
    addToast
  ])

  // Trigger haptic feedback with different patterns
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection') => {
    if (!hapticSupported) return

    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200],
      success: [50, 50, 50],
      error: [100, 100, 100, 100],
      selection: [25, 25, 50]
    }

    navigator.vibrate(patterns[type])
  }

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get capture button style based on mode and state
  const getCaptureButtonStyle = () => {
    const baseStyle = "w-20 h-20 rounded-full border-4 transition-all duration-200 flex items-center justify-center"
    
    if (captureMode === 'voice') {
      if (isRecording) {
        return `${baseStyle} bg-red-500 border-red-300 animate-pulse scale-110`
      } else if (isLongPressing) {
        return `${baseStyle} bg-red-400 border-red-200 scale-105`
      } else {
        return `${baseStyle} bg-blue-500 border-blue-300 hover:bg-blue-600 active:scale-95`
      }
    } else {
      if (isLongPressing) {
        return `${baseStyle} bg-white border-gray-200 scale-105`
      } else {
        return `${baseStyle} bg-white border-white/30 hover:bg-white/90 active:scale-95`
      }
    }
  }

  // Get capture button icon
  const getCaptureButtonIcon = () => {
    if (captureMode === 'voice') {
      return isRecording ? (
        <Square className="w-8 h-8 text-white" />
      ) : (
        <Mic className="w-8 h-8 text-white" />
      )
    } else {
      return <Camera className="w-8 h-8 text-black" />
    }
  }

  return (
    <div className="relative">
      {/* Gesture hints */}
      {gestureHint && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
          {gestureHint}
        </div>
      )}

      {/* Recording duration indicator */}
      {isRecording && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-mono">
          {formatDuration(recordingDuration)}
        </div>
      )}

      {/* Voice volume indicator */}
      {captureMode === 'voice' && isRecording && voiceVolume > 0 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-6 rounded-full transition-all duration-100 ${
                  voiceVolume * 10 > i ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main capture button */}
      <button
        ref={captureButtonRef}
        className={getCaptureButtonStyle()}
        style={{ touchAction: 'none' }} // Prevent default touch actions
      >
        {getCaptureButtonIcon()}
      </button>

      {/* Pet reaction indicator */}
      {currentPet && (isRecording || isLongPressing) && (
        <div className="absolute -top-20 -right-8 animate-bounce">
          <div className="bg-white/90 rounded-full p-2 shadow-lg">
            {isRecording ? (
              <Heart className="w-5 h-5 text-pink-500" />
            ) : (
              <Zap className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>
      )}

      {/* Mode indicator */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-white text-xs opacity-75 mb-1">
          {captureMode === 'voice' ? 'Voice Mode' : 'Camera Mode'}
        </div>
        <div className="text-white text-xs opacity-50">
          {captureMode === 'voice' 
            ? 'Tap: Start/Stop • Long Press: Hold to Record • Double Tap: Switch Mode'
            : 'Tap: Capture • Double Tap: Switch Mode • Swipe Up/Down: Controls'
          }
        </div>
      </div>
    </div>
  )
}

// Hook for managing mobile-specific UX enhancements
export function useMobileUX() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)

  useEffect(() => {
    // Orientation detection
    const handleOrientationChange = () => {
      if (screen.orientation) {
        setOrientation(screen.orientation.angle === 90 || screen.orientation.angle === 270 ? 'landscape' : 'portrait')
      }
    }

    // Battery API
    const handleBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          setBatteryLevel(battery.level)
          setIsLowPowerMode(battery.level < 0.2)

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(battery.level)
            setIsLowPowerMode(battery.level < 0.2)
          })
        } catch (error) {
          console.warn('Battery API not supported')
        }
      }
    }

    // Fullscreen detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Add event listeners
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // Initialize
    handleOrientationChange()
    handleBattery()
    handleFullscreenChange()

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange)
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const enterFullscreen = async () => {
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen()
      } catch (error) {
        console.warn('Fullscreen not supported')
      }
    }
  }

  const exitFullscreen = async () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.warn('Exit fullscreen failed')
      }
    }
  }

  const lockOrientation = async (orientation: 'portrait' | 'landscape') => {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock(orientation)
      } catch (error) {
        console.warn('Orientation lock not supported')
      }
    }
  }

  const unlockOrientation = () => {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock()
    }
  }

  const preventScreenSleep = async () => {
    // Wake Lock API to prevent screen from sleeping during recording
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await (navigator as any).wakeLock.request('screen')
        return wakeLock
      } catch (error) {
        console.warn('Wake lock not supported')
        return null
      }
    }
    return null
  }

  return {
    orientation,
    isFullscreen,
    batteryLevel,
    isLowPowerMode,
    enterFullscreen,
    exitFullscreen,
    lockOrientation,
    unlockOrientation,
    preventScreenSleep
  }
}

export default MobileGestureCapture