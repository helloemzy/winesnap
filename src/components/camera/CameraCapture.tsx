'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, X, RotateCcw, FlashOn, FlashOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { compressImage, generateThumbnail } from '@/lib/image/image-processor'
import { saveImageToCache, getImageFromCache } from '@/lib/storage/image-cache'

interface CameraCaptureProps {
  onCapture: (imageData: {
    file: File
    thumbnail: string
    metadata: {
      timestamp: Date
      deviceInfo: string
      orientation: number
    }
  }) => void
  onClose: () => void
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function CameraCapture({
  onCapture,
  onClose,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    requestCameraPermission, 
    cameraPermission, 
    addToast,
    isOnline 
  } = useUIStore()

  // Initialize camera stream
  const initializeCamera = useCallback(async () => {
    try {
      setError(null)
      
      // Request camera permission if needed
      if (cameraPermission === 'pending') {
        const granted = await requestCameraPermission()
        if (!granted) return
      }
      
      if (cameraPermission === 'denied') {
        setError('Camera permission is required to capture wine photos')
        return
      }

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight },
          frameRate: { ideal: 30 }
        },
        audio: false
      }

      // Add flash/torch constraint if supported and enabled
      if (flashEnabled && 'getCapabilities' in MediaStreamTrack.prototype) {
        (constraints.video as any).torch = true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
        
        // Trigger haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Failed to access camera. Please check permissions and try again.')
      addToast({
        type: 'error',
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.'
      })
    }
  }, [facingMode, flashEnabled, maxWidth, maxHeight, cameraPermission, requestCameraPermission, addToast])

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return
    
    try {
      setIsCapturing(true)
      
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) throw new Error('Failed to get canvas context')

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/jpeg', quality)
      })

      // Compress image
      const compressedBlob = await compressImage(blob, {
        maxWidth,
        maxHeight,
        quality
      })

      // Create file
      const file = new File([compressedBlob], `wine-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })

      // Generate thumbnail
      const thumbnail = await generateThumbnail(compressedBlob, 200, 200)

      // Get device orientation
      const orientation = screen.orientation?.angle ?? 0

      // Capture metadata
      const metadata = {
        timestamp: new Date(),
        deviceInfo: navigator.userAgent,
        orientation
      }

      // Store preview
      const imageUrl = URL.createObjectURL(compressedBlob)
      setCapturedImage(imageUrl)

      // Save to cache for offline use
      if (!isOnline) {
        await saveImageToCache(file.name, compressedBlob)
      }

      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        setIsStreaming(false)
      }

      // Call onCapture with the captured data
      onCapture({
        file,
        thumbnail,
        metadata
      })

    } catch (err) {
      console.error('Error capturing photo:', err)
      setError('Failed to capture photo. Please try again.')
      addToast({
        type: 'error',
        title: 'Capture Failed',
        description: 'Failed to capture photo. Please try again.'
      })
    } finally {
      setIsCapturing(false)
    }
  }, [isCapturing, quality, maxWidth, maxHeight, onCapture, isOnline, addToast])

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  // Toggle flash/torch
  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack && 'getCapabilities' in videoTrack) {
        const capabilities = videoTrack.getCapabilities()
        if (capabilities.torch) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ torch: !flashEnabled }]
            })
            setFlashEnabled(!flashEnabled)
          } catch (err) {
            console.warn('Flash not supported:', err)
          }
        }
      }
    }
  }, [flashEnabled])

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    initializeCamera()
  }, [initializeCamera])

  // Confirm photo
  const confirmPhoto = useCallback(() => {
    onClose()
  }, [onClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage)
      }
    }
  }, [capturedImage])

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera()
  }, [initializeCamera])

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera view or captured image */}
      <div className="relative w-full h-full">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured wine photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-lg">Initializing camera...</div>
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {!capturedImage && (
            <div className="flex gap-2">
              {/* Flash toggle */}
              <Button
                onClick={toggleFlash}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                {flashEnabled ? (
                  <FlashOn className="h-6 w-6" />
                ) : (
                  <FlashOff className="h-6 w-6" />
                )}
              </Button>

              {/* Camera switch */}
              <Button
                onClick={switchCamera}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent">
          {capturedImage ? (
            <div className="flex justify-center gap-4">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="flex-1 max-w-32"
              >
                Retake
              </Button>
              <Button
                onClick={confirmPhoto}
                className="flex-1 max-w-32 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                onClick={capturePhoto}
                disabled={!isStreaming || isCapturing}
                size="lg"
                className="w-20 h-20 rounded-full bg-white border-4 border-white/30 hover:bg-white/90 disabled:opacity-50"
              >
                {isCapturing ? (
                  <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-black" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Capture guide overlay */}
        {!capturedImage && isStreaming && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="flex items-center justify-center h-full">
              <div className="w-80 h-80 border-2 border-white/50 rounded-lg">
                <div className="text-white text-center mt-4 text-sm">
                  Position wine label in frame
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}