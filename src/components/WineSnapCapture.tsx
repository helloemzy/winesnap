'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { MobileGestureCapture, useMobileUX } from './MobileGestureCapture'
import { useCaptureGamification } from './gamification/CaptureNotifications'
import { offlineSync, errorHandler, fallbacks } from '@/lib/capture/offline-sync'
import { 
  Mic, 
  MicOff, 
  Camera, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  FlashOn, 
  FlashOff, 
  X,
  CheckCircle,
  Zap,
  Heart,
  Award,
  Upload,
  Loader2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { usePetStore } from '@/stores/pet-store'
import { useVoiceProcessing } from '@/lib/api/voice-api'
import { wineApi, type CreateWineFromVoiceRequest } from '@/lib/api/wine-api'
import { fileUploader, UPLOAD_CONFIGS } from '@/lib/storage/file-upload'
import { costManager, useCostTracking } from '@/lib/optimization/cost-manager'
import { getEnhancedVoiceProcessor, MobileVoiceGestures, getRandomPrompt } from '@/lib/voice/enhanced-voice-processor'
import { compressImage, generateThumbnail } from '@/lib/image/image-processor'
import { saveImageToCache } from '@/lib/storage/image-cache'
import { textRecognizer } from '@/lib/ocr/enhanced-wine-ocr'
import { supabase } from '@/lib/supabase'
import type { WSETTastingNote } from '@/types/wset'
import type { WineTasting } from '@/types/wine'

interface WineSnapCaptureProps {
  onClose?: () => void
  onSuccess?: (data: any) => void
  initialMode?: 'voice' | 'camera'
}

type CaptureMode = 'voice' | 'camera'
type CaptureStep = 'capture' | 'process' | 'review' | 'save'

interface CaptureData {
  mode: CaptureMode
  audioBlob?: Blob
  audioUrl?: string
  imageFile?: File
  imageUrl?: string
  transcript?: string
  wsetNote?: WSETTastingNote
  wineInfo?: {
    wine_name?: string
    producer?: string
    vintage?: number
    region?: string
    country?: string
  }
  ocrResults?: {
    text: string
    confidence: number
    extractedWineInfo: any
  }
}

export default function WineSnapCapture({ 
  onClose, 
  onSuccess, 
  initialMode = 'voice' 
}: WineSnapCaptureProps) {
  // Core state
  const [captureMode, setCaptureMode] = useState<CaptureMode>(initialMode)
  const [currentStep, setCurrentStep] = useState<CaptureStep>('capture')
  const [captureData, setCaptureData] = useState<CaptureData>({ mode: captureMode })
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Voice-specific state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioWaveform, setAudioWaveform] = useState<number[]>([])
  const [realtimeTranscript, setRealtimeTranscript] = useState('')
  const [voiceVolume, setVoiceVolume] = useState(0)
  const [smartPrompt, setSmartPrompt] = useState('')

  // Camera-specific state
  const [isStreaming, setIsStreaming] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [showCropGuide, setShowCropGuide] = useState(true)

  // Pet integration state
  const [petReaction, setPetReaction] = useState<string | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [achievementsUnlocked, setAchievementsUnlocked] = useState<string[]>([])
  const [showPetAnimation, setShowPetAnimation] = useState(false)

  // Mobile and gamification hooks
  const mobileUX = useMobileUX()
  const gamification = useCaptureGamification()

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)
  const animationFrame = useRef<number | null>(null)

  // Store hooks
  const { 
    addToast,
    isOnline,
    cameraPermission,
    microphonePermission,
    requestCameraPermission,
    requestMicrophonePermission
  } = useUIStore()

  const { 
    currentPet, 
    feedPetWithWine, 
    interactWithPet,
    checkEvolution 
  } = usePetStore()

  // API hooks
  const { processVoice, isProcessing, error: processingError } = useVoiceProcessing()

  // Cost tracking
  const [userId, setUserId] = useState<string | null>(null)
  const { usage, warnings, checkLimits } = useCostTracking(userId)

  // Initialize user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
        recordingTimer.current = null
      }
      setRecordingDuration(0)
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
    }
  }, [isRecording])

  // Initialize camera when switching to camera mode
  useEffect(() => {
    if (captureMode === 'camera' && currentStep === 'capture') {
      initializeCamera()
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [captureMode, currentStep])

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Switch capture mode
  const switchMode = useCallback((mode: CaptureMode) => {
    // Stop any active streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (isRecording) {
      getVoiceProcessor().stopRecording()
      setIsRecording(false)
    }

    setCaptureMode(mode)
    setCurrentStep('capture')
    setCaptureData({ mode })
    setError(null)
    setIsStreaming(false)
    setPetReaction(null)
    setXpGained(0)
    setAchievementsUnlocked([])
  }, [isRecording])

  // Initialize camera stream
  const initializeCamera = useCallback(async () => {
    try {
      setError(null)
      
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
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      }

      if (flashEnabled && 'getCapabilities' in MediaStreamTrack.prototype) {
        (constraints.video as any).torch = true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
        
        // Trigger haptic feedback
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
  }, [facingMode, flashEnabled, cameraPermission, requestCameraPermission, addToast])

  // Start voice recording with enhanced processor
  const startRecording = useCallback(async () => {
    try {
      if (userId) {
        const limitCheck = await checkLimits()
        if (!limitCheck.allowed) {
          addToast({
            type: 'error',
            title: 'Recording Limit Reached',
            description: limitCheck.reason
          })
          return
        }
      }

      const enhancedProcessor = getEnhancedVoiceProcessor()
      
      // Set up enhanced callbacks
      const callbacks = {
        onWaveformUpdate: (data: any) => {
          setAudioWaveform(Array.from(data.frequencyData).slice(0, 20))
        },
        onVolumeChange: (volume: number) => {
          setVoiceVolume(volume)
        },
        onLiveTranscription: (result: any) => {
          if (result.transcript && result.transcript.trim()) {
            setRealtimeTranscript(result.transcript)
          }
        },
        onRecordingStart: () => {
          setIsRecording(true)
          setError(null)
          setRealtimeTranscript('')
          
          // Show smart prompt
          setSmartPrompt(getRandomPrompt('appearance'))
          setTimeout(() => setSmartPrompt(getRandomPrompt('nose')), 8000)
          setTimeout(() => setSmartPrompt(getRandomPrompt('palate')), 16000)
          setTimeout(() => setSmartPrompt(getRandomPrompt('overall')), 24000)
        },
        onRecordingProgress: (progress: number) => {
          setRecordingDuration(Math.floor(progress * 30))
        },
        onError: (error: any) => {
          setError(error.error || 'Recording failed')
          addToast({
            type: 'error',
            title: 'Recording Error',
            description: error.error || 'Failed to record audio'
          })
        },
        onSpeechDetected: () => {
          // Pet reacts to speech
          if (currentPet && Math.random() > 0.7) {
            setPetReaction('curious')
            setShowPetAnimation(true)
            setTimeout(() => setShowPetAnimation(false), 1000)
          }
        }
      }

      await enhancedProcessor.startRecording(callbacks)

      // Pet initial reaction
      if (currentPet) {
        setPetReaction('excited')
        setShowPetAnimation(true)
        setTimeout(() => setShowPetAnimation(false), 2000)
      }

      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100)
      }

    } catch (error) {
      console.error('Failed to start recording:', error)
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }, [userId, addToast, checkLimits, currentPet])

  // Stop voice recording
  const stopRecording = useCallback(async () => {
    try {
      const enhancedProcessor = getEnhancedVoiceProcessor()
      const audioBlob = await enhancedProcessor.stopRecording()
      
      setIsRecording(false)
      setSmartPrompt('')
      
      const audioUrl = URL.createObjectURL(audioBlob)
      setCaptureData(prev => ({
        ...prev,
        audioBlob,
        audioUrl
      }))

      // Pet reaction to completed recording
      if (currentPet) {
        setPetReaction('happy')
        setShowPetAnimation(true)
        setTimeout(() => setShowPetAnimation(false), 1500)
      }

      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }

    } catch (error) {
      console.error('Failed to stop recording:', error)
      setError('Failed to stop recording.')
    }
  }, [currentPet])

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return
    
    try {
      setIsCapturing(true)
      
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) throw new Error('Failed to get canvas context')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/jpeg', 0.85)
      })

      const compressedBlob = await compressImage(blob, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85
      })

      const file = new File([compressedBlob], `wine-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })

      const imageUrl = URL.createObjectURL(compressedBlob)
      
      setCaptureData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl
      }))

      // Save to cache for offline use
      if (!isOnline) {
        await saveImageToCache(file.name, compressedBlob)
      }

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        setIsStreaming(false)
      }

      // Pet reaction
      if (currentPet) {
        setPetReaction('curious')
        setShowPetAnimation(true)
        setTimeout(() => setShowPetAnimation(false), 2000)
      }

      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }

    } catch (err) {
      console.error('Error capturing photo:', err)
      setError('Failed to capture photo. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }, [isCapturing, isOnline, currentPet])

  // Process captured data
  const processCapture = useCallback(async () => {
    if (currentStep !== 'capture') return

    try {
      setCurrentStep('process')
      setError(null)

      if (captureMode === 'voice' && captureData.audioBlob) {
        // Process voice recording
        const response = await processVoice({
          audioBlob: captureData.audioBlob,
          useCache: true
        })

        setCaptureData(prev => ({
          ...prev,
          transcript: response.transcript,
          wsetNote: response.wsetMapping,
          wineInfo: {
            wine_name: response.extractedWineInfo?.wine_name || '',
            producer: response.extractedWineInfo?.producer,
            vintage: response.extractedWineInfo?.vintage,
            region: response.extractedWineInfo?.region,
            country: response.extractedWineInfo?.country
          }
        }))

      } else if (captureMode === 'camera' && captureData.imageFile) {
        // Process image with enhanced OCR
        const ocrResults = await textRecognizer.recognizeWineLabel(captureData.imageFile)
        
        setCaptureData(prev => ({
          ...prev,
          ocrResults,
          wineInfo: {
            wine_name: ocrResults.wine_name || '',
            producer: ocrResults.producer,
            vintage: ocrResults.vintage,
            region: ocrResults.region,
            country: ocrResults.country
          }
        }))
      }

      setCurrentStep('review')

      // Pet reaction to successful processing
      if (currentPet) {
        const interaction = await interactWithPet('process_wine')
        setXpGained(interaction.experience_gained)
        setPetReaction('happy')
      }

    } catch (error) {
      console.error('Processing failed:', error)
      setError('Processing failed. Please try again.')
      setCurrentStep('capture')
    }
  }, [currentStep, captureMode, captureData, processVoice, currentPet, interactWithPet])

  // Save wine entry and feed pet with offline support
  const saveEntry = useCallback(async () => {
    if (!userId || !captureData.wineInfo?.wine_name) return

    try {
      setCurrentStep('save')

      if (!isOnline) {
        // Add to offline queue
        const queueId = await offlineSync.addToQueue(captureMode, {
          audioBlob: captureData.audioBlob,
          imageFile: captureData.imageFile,
          wineInfo: captureData.wineInfo,
          transcript: captureData.transcript,
          ocrResults: captureData.ocrResults
        })

        addToast({
          type: 'info',
          title: 'Saved Offline',
          description: 'Wine will sync when connection is restored'
        })

        // Still feed pet and show rewards locally
        if (currentPet) {
          const interaction = await interactWithPet('add_wine_offline')
          setXpGained(interaction.experience_gained)
          gamification.addXPReward(interaction.experience_gained, 'Wine Discovery')
        }

        gamification.addCollectionMilestone(1) // Placeholder count
        gamification.showPendingNotifications()

        setTimeout(resetCapture, 3000)
        return
      }

      // Online processing
      let audioUrl: string | undefined
      let imageUrl: string | undefined

      if (captureData.audioBlob) {
        const uploadResult = await fileUploader.uploadFile(
          captureData.audioBlob, 
          UPLOAD_CONFIGS.VOICE_RECORDING
        )
        audioUrl = uploadResult.url
      }

      if (captureData.imageFile) {
        const uploadResult = await fileUploader.uploadFile(
          captureData.imageFile, 
          UPLOAD_CONFIGS.WINE_PHOTOS
        )
        imageUrl = uploadResult.url
      }

      // Create wine entry
      const createRequest: CreateWineFromVoiceRequest = {
        wineBasicInfo: captureData.wineInfo,
        wsetTastingNote: captureData.wsetNote,
        voiceData: captureData.audioBlob ? {
          audio_url: audioUrl,
          voice_transcript: captureData.transcript,
          processing_confidence: 0.85
        } : undefined,
        imageData: captureData.imageFile ? {
          image_url: imageUrl,
          ocr_results: captureData.ocrResults,
          capture_method: 'camera'
        } : undefined,
        metadata: {
          is_public: true,
          tasting_date: new Date().toISOString().split('T')[0],
          capture_mode: captureMode
        }
      }

      const createdWine = await wineApi.createWineFromVoice(createRequest)

      // Feed pet and trigger gamification
      if (currentPet) {
        const mockWineTasting: WineTasting = {
          id: createdWine.id,
          wine_name: captureData.wineInfo.wine_name || '',
          producer: captureData.wineInfo.producer,
          vintage: captureData.wineInfo.vintage,
          region: captureData.wineInfo.region,
          country: captureData.wineInfo.country,
          quality_assessment: captureData.wsetNote?.conclusions.qualityAssessment || 'good',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const feedingResult = await feedPetWithWine(mockWineTasting)
        
        setXpGained(prev => prev + feedingResult.experience_gained)
        
        // Add gamification rewards
        gamification.addXPReward(feedingResult.experience_gained, 'Wine Discovery')
        
        if (feedingResult.achievements_unlocked && feedingResult.achievements_unlocked.length > 0) {
          feedingResult.achievements_unlocked.forEach(achievement => {
            gamification.addAchievement(achievement)
          })
        }

        setPetReaction('very_happy')

        // Check for evolution
        const evolutionCheck = checkEvolution()
        if (evolutionCheck.can_evolve) {
          gamification.addPetEvolution(evolutionCheck.next_stage?.name || 'Next Stage')
        }
      }

      // Collection milestone
      gamification.addCollectionMilestone(1) // In production, get actual count

      // Success feedback
      addToast({
        type: 'success',
        title: 'Wine Captured Successfully!',
        description: `Added ${captureData.wineInfo.wine_name} to your collection`
      })

      if (onSuccess) {
        onSuccess({ wine: createdWine, xpGained, achievements: achievementsUnlocked })
      }

      // Show gamification notifications
      gamification.showPendingNotifications()

      // Reset after showing rewards
      setTimeout(() => {
        resetCapture()
      }, 1000)

    } catch (error) {
      console.error('Failed to save wine entry:', error)
      
      // Log error for monitoring
      errorHandler.logError(error as Error, {
        userId,
        captureMode,
        wineInfo: captureData.wineInfo
      })

      // Try offline fallback
      try {
        const queueId = await offlineSync.addToQueue(captureMode, {
          audioBlob: captureData.audioBlob,
          imageFile: captureData.imageFile,
          wineInfo: captureData.wineInfo,
          transcript: captureData.transcript,
          ocrResults: captureData.ocrResults
        })

        addToast({
          type: 'warning',
          title: 'Saved for Later',
          description: 'Upload failed but wine is saved offline'
        })

        setTimeout(resetCapture, 2000)
      } catch (offlineError) {
        setError('Failed to save wine entry. Please try again.')
        setCurrentStep('review')
      }
    }
  }, [
    userId, 
    captureData, 
    captureMode, 
    currentPet, 
    feedPetWithWine, 
    checkEvolution,
    interactWithPet,
    addToast,
    gamification,
    onSuccess, 
    xpGained, 
    achievementsUnlocked,
    isOnline
  ])

  // Reset capture
  const resetCapture = useCallback(() => {
    // Clean up URLs
    if (captureData.audioUrl) {
      URL.revokeObjectURL(captureData.audioUrl)
    }
    if (captureData.imageUrl) {
      URL.revokeObjectURL(captureData.imageUrl)
    }

    // Stop streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (isRecording) {
      getEnhancedVoiceProcessor().stopRecording()
      setIsRecording(false)
    }

    // Reset state
    setCurrentStep('capture')
    setCaptureData({ mode: captureMode })
    setError(null)
    setIsStreaming(false)
    setPetReaction(null)
    setXpGained(0)
    setAchievementsUnlocked([])
    setRealtimeTranscript('')
  }, [captureData, isRecording, captureMode])

  // Toggle camera features
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

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

  // Close handler
  const handleClose = useCallback(() => {
    resetCapture()
    if (onClose) onClose()
  }, [resetCapture, onClose])

  // Render pet animations and reactions
  const renderPetReaction = () => {
    if (!currentPet || !petReaction) return null

    return (
      <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${showPetAnimation ? 'scale-110' : 'scale-100'}`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <div className="flex items-center gap-2">
            {petReaction === 'excited' && <Zap className="w-6 h-6 text-yellow-500" />}
            {petReaction === 'curious' && <Camera className="w-6 h-6 text-blue-500" />}
            {petReaction === 'happy' && <Heart className="w-6 h-6 text-pink-500" />}
            {petReaction === 'very_happy' && <Sparkles className="w-6 h-6 text-purple-500" />}
            <span className="text-sm font-medium">{currentPet.name}</span>
          </div>
        </div>
      </div>
    )
  }

  // Render XP and achievement notifications
  const renderRewards = () => {
    if (xpGained === 0 && achievementsUnlocked.length === 0) return null

    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 space-y-2">
        {xpGained > 0 && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-bounce">
            <Trophy className="w-5 h-5 mr-2" />
            <span>+{xpGained} XP</span>
          </div>
        )}
        {achievementsUnlocked.map((achievement, index) => (
          <div key={index} className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-pulse">
            <Award className="w-5 h-5 mr-2" />
            <span>{achievement}</span>
          </div>
        ))}
      </div>
    )
  }

  // Main render based on current step
  const renderMainContent = () => {
    switch (currentStep) {
      case 'capture':
        return renderCaptureInterface()
      case 'process':
        return renderProcessingInterface()
      case 'review':
        return renderReviewInterface()
      case 'save':
        return renderSaveInterface()
      default:
        return renderCaptureInterface()
    }
  }

  const renderCaptureInterface = () => (
    <div className="relative w-full h-full">
      {/* Mode Toggle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 rounded-full p-1">
        <div className="flex">
          <button
            onClick={() => switchMode('voice')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              captureMode === 'voice' 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Mic className="w-4 h-4 mr-2 inline" />
            Voice
          </button>
          <button
            onClick={() => switchMode('camera')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              captureMode === 'camera' 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Camera className="w-4 h-4 mr-2 inline" />
            Camera
          </button>
        </div>
      </div>

      {captureMode === 'voice' ? renderVoiceInterface() : renderCameraInterface()}
    </div>
  )

  const renderVoiceInterface = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-900 to-blue-900 text-white p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Voice Wine Journal</h2>
        <p className="text-blue-200 text-sm">Describe your wine tasting experience</p>
        {isRecording && (
          <p className="text-yellow-300 text-lg font-medium mt-2">
            Recording: {formatDuration(recordingDuration)}
          </p>
        )}
      </div>

      {/* Smart prompts */}
      {smartPrompt && isRecording && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg p-4 mb-4 max-w-md text-center">
          <p className="text-sm text-purple-200">Try describing:</p>
          <p className="text-white font-medium">{smartPrompt}</p>
        </div>
      )}

      {/* Real-time transcript */}
      {realtimeTranscript && (
        <div className="bg-black/30 rounded-lg p-4 mb-6 max-w-md text-center">
          <p className="text-sm text-blue-200">Live transcript:</p>
          <p className="text-white">{realtimeTranscript}</p>
        </div>
      )}

      {/* Enhanced waveform visualization */}
      {isRecording && (
        <div className="mb-8 w-full max-w-md">
          {/* Volume indicator */}
          <div className="text-center mb-2">
            <span className="text-xs text-blue-200">
              {voiceVolume > 0.3 ? 'Speaking...' : 'Listening...'}
            </span>
          </div>
          
          {/* Waveform bars */}
          <div className="flex items-center justify-center gap-1 h-16 bg-black/20 rounded-lg p-2">
            {audioWaveform.length > 0 
              ? audioWaveform.map((freq, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-blue-600 to-blue-400 w-2 rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.max(4, (freq / 255) * 60)}px`,
                      opacity: voiceVolume > 0.1 ? 1 : 0.6
                    }}
                  />
                ))
              : Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-blue-400/50 w-2 rounded-full animate-pulse"
                    style={{
                      height: `${8 + Math.random() * 16}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))
            }
          </div>
          
          {/* Volume meter */}
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-150"
              style={{ width: `${Math.min(100, voiceVolume * 300)}%` }}
            />
          </div>
        </div>
      )}

      {/* Record button */}
      <div className="flex justify-center mb-8">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-8 transition-colors disabled:opacity-50"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-8 transition-colors animate-pulse"
          >
            <Square className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Audio playback */}
      {captureData.audioUrl && (
        <div className="w-full max-w-md space-y-4">
          <audio ref={audioRef} controls className="w-full">
            <source src={captureData.audioUrl} type="audio/wav" />
          </audio>
          
          <div className="flex gap-2">
            <Button
              onClick={processCapture}
              disabled={isProcessing}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Process Recording
                </>
              )}
            </Button>
            
            <Button
              onClick={resetCapture}
              variant="outline"
              className="px-4"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {usage && (
            <div className="text-xs text-blue-200 text-center">
              Estimated cost: ${costManager.estimateProcessingCost(captureData.audioBlob!).totalCost.toFixed(3)}
            </div>
          )}
        </div>
      )}

      {/* Cost warnings */}
      {warnings.length > 0 && (
        <div className="mt-4 bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 max-w-md">
          <div className="flex items-center text-amber-300 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Usage Warning</span>
          </div>
          {warnings.map((warning, index) => (
            <p key={index} className="text-xs text-amber-200">{warning}</p>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-md text-center">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )

  const renderCameraInterface = () => (
    <>
      {/* Camera view */}
      <div className="relative w-full h-full">
        {captureData.imageUrl ? (
          <img
            src={captureData.imageUrl}
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
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-lg">Initializing camera...</div>
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Crop guide overlay */}
        {!captureData.imageUrl && isStreaming && showCropGuide && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-80 h-80 border-2 border-white/70 rounded-lg">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm text-center bg-black/50 px-3 py-1 rounded">
                Position wine label in frame
              </div>
              {/* Corner guides */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-white"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-white"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-white"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-white"></div>
            </div>
          </div>
        )}
      </div>

      {/* Top controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {!captureData.imageUrl && (
          <>
            <Button
              onClick={toggleFlash}
              variant="ghost"
              size="icon"
              className="text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            >
              {flashEnabled ? (
                <FlashOn className="h-5 w-5" />
              ) : (
                <FlashOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              onClick={switchCamera}
              variant="ghost"
              size="icon"
              className="text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => setShowCropGuide(!showCropGuide)}
              variant="ghost"
              size="icon"
              className={`text-white backdrop-blur-sm ${showCropGuide ? 'bg-blue-500/70' : 'bg-black/50'} hover:bg-black/70`}
            >
              <Camera className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-8 left-4 right-4 z-20">
        {captureData.imageUrl ? (
          <div className="flex justify-center gap-4">
            <Button
              onClick={resetCapture}
              variant="outline"
              className="bg-black/50 border-white/50 text-white hover:bg-black/70"
            >
              Retake
            </Button>
            <Button
              onClick={processCapture}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Photo
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
    </>
  )

  const renderProcessingInterface = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="text-center mb-8">
        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-400" />
        <h2 className="text-2xl font-bold mb-2">Processing Your Wine</h2>
        <p className="text-blue-200">
          {captureMode === 'voice' 
            ? 'Analyzing your tasting notes...' 
            : 'Reading wine label information...'
          }
        </p>
      </div>

      {currentPet && (
        <div className="text-center">
          <p className="text-sm text-blue-200">{currentPet.name} is excited to learn about this wine!</p>
        </div>
      )}
    </div>
  )

  const renderReviewInterface = () => (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Your Wine</h2>
        
        {/* Basic Information */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Wine Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wine Name *</label>
              <input
                type="text"
                value={captureData.wineInfo?.wine_name || ''}
                onChange={(e) => setCaptureData(prev => ({
                  ...prev,
                  wineInfo: { ...prev.wineInfo, wine_name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter wine name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producer</label>
              <input
                type="text"
                value={captureData.wineInfo?.producer || ''}
                onChange={(e) => setCaptureData(prev => ({
                  ...prev,
                  wineInfo: { ...prev.wineInfo, producer: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Producer/Winery"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vintage</label>
              <input
                type="number"
                value={captureData.wineInfo?.vintage || ''}
                onChange={(e) => setCaptureData(prev => ({
                  ...prev,
                  wineInfo: { ...prev.wineInfo, vintage: parseInt(e.target.value) || undefined }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Year"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                value={captureData.wineInfo?.region || ''}
                onChange={(e) => setCaptureData(prev => ({
                  ...prev,
                  wineInfo: { ...prev.wineInfo, region: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wine region"
              />
            </div>
          </div>
        </div>

        {/* Preview captured content */}
        {captureMode === 'voice' && captureData.transcript && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Voice Transcript</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{captureData.transcript}</p>
            </div>
          </div>
        )}

        {captureMode === 'camera' && captureData.imageUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Captured Photo</h3>
            <img 
              src={captureData.imageUrl} 
              alt="Wine photo" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
            {captureData.ocrResults && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Extracted text:</strong> {captureData.ocrResults.text}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Confidence: {(captureData.ocrResults.confidence * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* WSET Analysis */}
        {captureData.wsetNote && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">WSET Analysis</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Quality: <strong>{captureData.wsetNote.conclusions.qualityAssessment}</strong>
              </p>
              {captureData.wsetNote.palate?.body && (
                <p className="text-sm text-blue-700">
                  Body: <strong>{captureData.wsetNote.palate.body}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pet preview */}
        {currentPet && (
          <div className="mb-6 bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Feed {currentPet.name}
            </h3>
            <p className="text-sm text-purple-600">
              This wine discovery will help {currentPet.name} grow stronger!
            </p>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <Heart className="w-4 h-4 mr-1" />
              <span>Expected XP: +15-25</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            onClick={saveEntry}
            disabled={!captureData.wineInfo?.wine_name}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Wine Entry
          </Button>
          
          <Button
            onClick={resetCapture}
            variant="outline"
            className="px-6"
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )

  const renderSaveInterface = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-900 to-blue-900 text-white p-8">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
        <h2 className="text-2xl font-bold mb-2">Wine Saved Successfully!</h2>
        <p className="text-green-200">
          {captureData.wineInfo?.wine_name} has been added to your collection
        </p>
      </div>

      {xpGained > 0 && (
        <div className="text-center mb-4">
          <div className="bg-yellow-500/20 rounded-full px-6 py-3 mb-2">
            <Trophy className="w-6 h-6 inline mr-2" />
            <span className="text-xl font-bold">+{xpGained} XP</span>
          </div>
          <p className="text-sm text-yellow-200">
            {currentPet?.name} gained experience!
          </p>
        </div>
      )}

      {achievementsUnlocked.length > 0 && (
        <div className="text-center space-y-2">
          {achievementsUnlocked.map((achievement, index) => (
            <div key={index} className="bg-purple-500/20 rounded-lg px-4 py-2">
              <Award className="w-5 h-5 inline mr-2" />
              <span>{achievement}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (error && !captureData.audioUrl && !captureData.imageUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center p-6 text-white">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <div className="flex gap-4">
            <Button onClick={resetCapture} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <Button
        onClick={handleClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-30 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main content */}
      {renderMainContent()}

      {/* Pet reaction overlay */}
      {renderPetReaction()}

      {/* Rewards overlay */}
      {renderRewards()}

      {/* Gamification notifications */}
      <gamification.CaptureNotifications />
    </div>
  )
}