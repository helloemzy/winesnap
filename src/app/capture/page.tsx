'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, Mic, MicOff, RotateCcw, Check, Sparkles, X, Wine, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Universal Tasting Notes Quick Buttons (works for all beverages)
const TASTING_CATEGORIES = {
  appearance: {
    title: 'Appearance',
    options: ['Clear', 'Hazy', 'Pale', 'Medium', 'Deep', 'Light', 'Dark', 'Colorful', 'Vibrant', 'Rich']
  },
  aroma: {
    title: 'Aroma/Smell',
    options: ['Fresh', 'Fruity', 'Sweet', 'Citrus', 'Herbal', 'Spicy', 'Strong', 'Mild', 'Pleasant', 'Complex']
  },
  taste: {
    title: 'Taste', 
    options: ['Sweet', 'Bitter', 'Sour', 'Salty', 'Refreshing', 'Bold', 'Mild', 'Smooth', 'Sharp', 'Balanced']
  },
  texture: {
    title: 'Texture/Mouthfeel',
    options: ['Smooth', 'Bubbly', 'Creamy', 'Light', 'Heavy', 'Crisp', 'Thick', 'Thin', 'Fizzy', 'Still']
  },
  overall: {
    title: 'Overall Rating',
    options: ['Excellent', 'Very Good', 'Good', 'Average', 'Poor']
  }
}

// Pokédex-style capture success animation
const CaptureSuccessAnimation = ({ wine, onComplete }: { wine: any, onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl animate-in zoom-in duration-300">
        {/* Pokeball-style animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
            <Wine className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wine Captured!</h2>
        <h3 className="text-xl text-purple-600 font-semibold mb-4">{wine.name}</h3>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Region:</span>
              <p className="font-semibold">{wine.region}</p>
            </div>
            <div>
              <span className="text-gray-600">Year:</span>
              <p className="font-semibold">{wine.year}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Producer:</span>
              <p className="font-semibold">{wine.producer}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onComplete}
          >
            Capture Another
          </Button>
          <Link href="/collection" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              View Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CapturePage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  const [captureMode, setCaptureMode] = useState<'camera' | 'tasting'>('camera')
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedWine, setCapturedWine] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<Record<string, string[]>>({})
  const [voiceNote, setVoiceNote] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState<'unknown' | 'granted' | 'denied' | 'checking'>('unknown')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [cameraError, setCameraError] = useState<string>('')
  const [cameraReady, setCameraReady] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/signin')
        return
      }
      setIsAuthenticated(true)
    }
    
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace('/auth/signin')
      } else {
        setIsAuthenticated(true)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError('')
      setCameraReady(false)
      
      console.log('Requesting camera access...')
      
      // Try different camera configurations
      const constraints = [
        { video: { facingMode: 'environment' } }, // Back camera first
        { video: { facingMode: 'user' } }, // Front camera fallback
        { video: true } // Any camera as last resort
      ]
      
      let stream = null
      let lastError = null
      
      for (const constraint of constraints) {
        try {
          console.log('Trying constraint:', constraint)
          stream = await navigator.mediaDevices.getUserMedia(constraint)
          break
        } catch (err) {
          console.log('Constraint failed:', err)
          lastError = err
        }
      }
      
      if (!stream) {
        throw lastError || new Error('No camera access')
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          setCameraReady(true)
        }
        videoRef.current.oncanplay = () => {
          console.log('Video can play')
          setCameraReady(true)
        }
      }
      
      console.log('Camera started successfully')
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraError(`Camera error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  useEffect(() => {
    if (captureMode === 'camera') {
      startCamera()
    }
    return () => {
      // Clean up camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [captureMode, startCamera])

  const capturePhoto = async () => {
    console.log('Capture photo clicked')
    console.log('Camera ready:', cameraReady)
    console.log('Video ref:', videoRef.current)
    console.log('Video dimensions:', videoRef.current?.videoWidth, videoRef.current?.videoHeight)
    
    // Check if camera is ready
    if (!cameraReady || !videoRef.current) {
      console.log('Camera not ready, showing mock data')
      // Fallback to mock data if camera isn't working
      setIsCapturing(true)
      setTimeout(() => {
        const mockWines = [
          {
            name: "Demo Wine (Camera Not Available)",
            region: "Mock Region", 
            year: "2023",
            producer: "Test Producer",
            type: "Red Wine",
            confidence: 0.85
          }
        ]
        setCapturedWine(mockWines[0])
        setCaptureMode('tasting')
        setIsCapturing(false)
      }, 1000)
      return
    }
    
    setIsCapturing(true)
    
    try {
      console.log('Attempting to capture from video...')
      
      const video = videoRef.current
      const canvas = canvasRef.current
      
      if (!video || !canvas) {
        throw new Error('Video or canvas not available')
      }
      
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Canvas context not available')
      }
      
      // Ensure video has loaded
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Video not loaded properly')
      }
      
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      console.log('Drawing video frame to canvas...')
      
      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      console.log('Image captured, data length:', imageData.length)
      
      // Stop camera stream after successful capture
      const stream = video.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setCameraReady(false)
      }
      
      // Send image to AI analysis API
      try {
        console.log('Sending image to AI analysis API...')
        const aiResponse = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData }),
        })

        if (!aiResponse.ok) {
          throw new Error('AI analysis failed')
        }

        const analysis = await aiResponse.json()
        console.log('AI Analysis result:', analysis)
        
        setCapturedWine(analysis)
        setCaptureMode('tasting')
        setIsCapturing(false)
        
      } catch (aiError) {
        console.error('AI analysis error:', aiError)
        
        // Fallback to basic analysis on AI failure
        const fallbackResult = {
          name: "Captured Image Analysis",
          type: "Unknown Product",
          producer: "Unknown Brand",
          region: "N/A",
          year: "N/A",
          confidence: 0.5,
          isWine: false,
          description: "AI analysis temporarily unavailable"
        }
        
        setCapturedWine(fallbackResult)
        setCaptureMode('tasting')
        setIsCapturing(false)
      }
      
    } catch (error) {
      console.error('Error capturing photo:', error)
      
      // Fallback to mock data on error
      setTimeout(() => {
        const mockWine = {
          name: "Error Fallback Wine",
          region: "Fallback Region", 
          year: "2023",
          producer: "Error Handler",
          type: "Red Wine",
          confidence: 0.75
        }
        setCapturedWine(mockWine)
        setCaptureMode('tasting')
        setIsCapturing(false)
      }, 1000)
    }
  }

  const toggleWSETNote = (category: string, note: string) => {
    setSelectedNotes(prev => ({
      ...prev,
      [category]: prev[category]?.includes(note) 
        ? prev[category].filter(n => n !== note)
        : [...(prev[category] || []), note]
    }))
  }

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  // Check microphone permission on component mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      if (!navigator.permissions) {
        setMicrophonePermission('unknown')
        return
      }
      
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setMicrophonePermission(permission.state as any)
        
        permission.onchange = () => {
          setMicrophonePermission(permission.state as any)
        }
      } catch (error) {
        console.log('Permission API not supported')
        setMicrophonePermission('unknown')
      }
    }
    
    checkMicrophonePermission()
  }, [])

  // Explicit permission request function
  const requestMicrophonePermission = async () => {
    try {
      setMicrophonePermission('checking')
      console.log('Explicitly requesting microphone permission...')
      
      // Force a getUserMedia call to trigger permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      console.log('Permission granted!')
      setMicrophonePermission('granted')
      
      // Stop the stream immediately since we just wanted permission
      stream.getTracks().forEach(track => track.stop())
      
      return true
    } catch (error: any) {
      console.error('Permission request failed:', error)
      setMicrophonePermission('denied')
      
      let errorMessage = "Microphone access denied. "
      const userAgent = navigator.userAgent.toLowerCase()
      if (userAgent.includes('iphone') && userAgent.includes('chrome')) {
        errorMessage += "On iPhone Chrome: 1) Look for 🎤 icon in address bar 2) Tap it and select 'Allow' 3) Refresh page if needed"
      } else {
        errorMessage += "Please check your browser settings to allow microphone access for this site."
      }
      
      setVoiceNote(errorMessage)
      return false
    }
  }
  
  const startVoiceRecording = async () => {
    try {
      // Check permission first
      if (microphonePermission === 'denied') {
        setVoiceNote("Microphone access is denied. Please use the 'Enable Microphone' button above to grant permission.")
        return
      }
      
      if (microphonePermission === 'unknown' || microphonePermission === 'checking') {
        setVoiceNote("Please enable microphone access first using the button above.")
        return
      }
      
      setIsRecording(true)
      
      // Check if microphone is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording not supported on this device')
      }
      
      console.log('Starting recording with granted permission...')
      
      // Request microphone permission with better error handling for iOS
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      // Create MediaRecorder instance
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        
        try {
          console.log('Sending audio for transcription and categorization...')
          setIsProcessingVoice(true)
          
          // Send audio to our transcription API
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')
          
          const transcriptionResponse = await fetch('/api/transcribe-audio', {
            method: 'POST',
            body: formData
          })
          
          if (!transcriptionResponse.ok) {
            throw new Error('Transcription failed')
          }
          
          const result = await transcriptionResponse.json()
          console.log('Transcription result:', result)
          
          // Set the transcribed text
          setVoiceNote(result.transcription)
          
          // Auto-populate tasting categories based on AI analysis
          if (result.categories) {
            const newSelectedNotes: Record<string, string[]> = { ...selectedNotes }
            
            // Add AI-detected keywords to existing selections
            Object.entries(result.categories).forEach(([category, keywords]: [string, any]) => {
              if (Array.isArray(keywords) && keywords.length > 0) {
                // Merge with existing selections (don't override manual selections)
                const existing = newSelectedNotes[category] || []
                const combined = [...existing, ...keywords].filter((item, index, arr) => arr.indexOf(item) === index) // Remove duplicates
                newSelectedNotes[category] = combined
              }
            })
            
            setSelectedNotes(newSelectedNotes)
            console.log('Auto-populated categories:', newSelectedNotes)
          }
          
        } catch (error) {
          console.error('Transcription error:', error)
          
          // Fallback to basic transcription message
          setVoiceNote("Voice note recorded successfully. Transcription service temporarily unavailable.")
        } finally {
          setIsProcessingVoice(false)
        }
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.onerror = (event) => {
        console.error('Recording error:', event)
        setIsRecording(false)
        stream.getTracks().forEach(track => track.stop())
      }
      
      // Start recording
      recorder.start()
      setMediaRecorder(recorder)
      setAudioChunks([])
      
    } catch (error: any) {
      console.error('Error starting voice recording:', error)
      setIsRecording(false)
      
      // Provide specific error messages for different scenarios
      let errorMessage = "Could not access microphone. "
      
      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow microphone access in your browser settings and try again."
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No microphone found on this device."
      } else if (error.name === 'NotSupportedError') {
        errorMessage += "Audio recording not supported on this browser."
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error occurred'}`
      }
      
      // For iOS Chrome, add specific instructions
      const userAgent = navigator.userAgent.toLowerCase()
      if (userAgent.includes('iphone') && userAgent.includes('chrome')) {
        errorMessage += " On iPhone Chrome, try: 1) Refresh the page 2) Tap the microphone icon in the address bar 3) Allow microphone access."
      }
      
      setTimeout(() => {
        setVoiceNote(errorMessage)
      }, 100)
    }
  }
  
  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setIsRecording(false)
    }
  }

  const saveWineCard = () => {
    setShowSuccess(true)
  }

  const resetCapture = () => {
    setCapturedWine(null)
    setSelectedNotes({})
    setVoiceNote('')
    setCaptureMode('camera')
    setShowSuccess(false)
    setIsProcessingVoice(false)
    setMicrophonePermission('unknown')
    startCamera()
  }

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showSuccess && capturedWine) {
    return <CaptureSuccessAnimation wine={capturedWine} onComplete={resetCapture} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {captureMode === 'camera' ? '📸 Capture Beverage' : '📝 Tasting Notes'}
          </h1>
          {capturedWine && (
            <Button variant="ghost" size="sm" onClick={resetCapture}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Camera Mode */}
        {captureMode === 'camera' && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-black aspect-[4/3] rounded-t-xl overflow-hidden">
                {isCapturing ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg font-semibold">Analyzing Wine Label...</p>
                      <p className="text-sm opacity-80">AI is extracting wine information</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-4 border-white/30 border-dashed m-8 rounded-xl flex items-center justify-center">
                      <div className="text-center text-white bg-black/50 rounded-xl p-4 backdrop-blur-sm">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        {cameraError ? (
                          <div>
                            <p className="font-semibold text-red-300">Camera Error</p>
                            <p className="text-sm text-red-200">{cameraError}</p>
                            <p className="text-xs text-gray-300 mt-1">Will use demo mode</p>
                          </div>
                        ) : cameraReady ? (
                          <p className="font-semibold text-green-300">Camera Ready - Position beverage in frame</p>
                        ) : (
                          <div>
                            <p className="font-semibold">Loading Camera...</p>
                            <p className="text-sm text-gray-300">Please allow camera access</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-6">
                <Button 
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg py-6 rounded-xl"
                >
                  {isCapturing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : cameraError ? (
                    <>
                      <Camera className="h-6 w-6 mr-2" />
                      Capture Beverage (Demo Mode)
                    </>
                  ) : cameraReady ? (
                    <>
                      <Camera className="h-6 w-6 mr-2" />
                      📸 Take Photo
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 mr-2" />
                      Loading Camera...
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasting Notes Mode */}
        {captureMode === 'tasting' && capturedWine && (
          <>
            {/* Product Info Card */}
            <Card className={`bg-gradient-to-r ${capturedWine.isWine ? 'from-purple-100 to-blue-100' : 'from-orange-100 to-red-100'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{capturedWine.name}</h2>
                    <p className={`${capturedWine.isWine ? 'text-purple-600' : 'text-orange-600'}`}>
                      {capturedWine.type} • {capturedWine.producer}
                    </p>
                    {capturedWine.isWine && (
                      <p className="text-sm text-gray-600">{capturedWine.region} • {capturedWine.year}</p>
                    )}
                    {capturedWine.description && (
                      <p className="text-sm text-gray-600 mt-2 italic">{capturedWine.description}</p>
                    )}
                  </div>
                  <Badge className={capturedWine.isWine ? "bg-green-500" : "bg-orange-500"}>
                    <Star className="h-3 w-3 mr-1" />
                    {Math.round(capturedWine.confidence * 100)}% Match
                  </Badge>
                </div>
                
                {!capturedWine.isWine && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-800 text-sm font-medium">
                      🥤 {capturedWine.type} detected! You can still add tasting notes below.
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      Rate and review any beverage - not just wine!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Notes - Show first for immediate input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Permission Status */}
                {microphonePermission === 'unknown' || microphonePermission === 'denied' ? (
                  <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <Mic className="h-4 w-4 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 font-medium">
                        Microphone Access {microphonePermission === 'denied' ? 'Denied' : 'Required'}
                      </p>
                    </div>
                    <p className="text-yellow-700 text-sm mb-3">
                      {microphonePermission === 'denied' 
                        ? "Please allow microphone access to record voice notes."
                        : "Enable microphone access to record voice notes and auto-populate tasting categories."
                      }
                    </p>
                    <Button
                      onClick={requestMicrophonePermission}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                      disabled={microphonePermission === 'checking'}
                    >
                      {microphonePermission === 'checking' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Checking Permission...
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          🔓 Enable Microphone
                        </>
                      )}
                    </Button>
                  </div>
                ) : microphonePermission === 'granted' ? (
                  <>
                    {isProcessingVoice ? (
                      <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                          <p className="text-blue-800 font-medium">Processing voice note...</p>
                        </div>
                        <p className="text-blue-600 text-sm mt-1">Transcribing and categorizing keywords</p>
                      </div>
                    ) : voiceNote ? (
                      <div className="bg-purple-50 rounded-xl p-4 mb-4">
                        <p className="text-gray-800 italic">"{voiceNote}"</p>
                        <p className="text-purple-600 text-sm mt-2">✨ Keywords automatically added to categories below</p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-200">
                          <p className="text-green-800 text-sm font-medium">✅ Microphone enabled!</p>
                          <p className="text-green-700 text-sm">Record your tasting notes - keywords will auto-populate categories.</p>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      className="w-full"
                      disabled={isProcessingVoice}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Recording... (tap to stop)
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          🎤 Record Voice Note
                        </>
                      )}
                    </Button>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Universal Tasting Notes - Show for all products */}
            <div className="space-y-4">
              {Object.entries(TASTING_CATEGORIES).map(([category, data]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{data.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.options.map((option) => (
                        <Button
                          key={option}
                          variant={selectedNotes[category]?.includes(option) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleWSETNote(category, option)}
                          className={selectedNotes[category]?.includes(option) 
                            ? "bg-purple-500 hover:bg-purple-600" 
                            : "hover:bg-purple-50"
                          }
                        >
                          {selectedNotes[category]?.includes(option) && (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          {option}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save Card Button */}
            <Button
              onClick={saveWineCard}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg py-6 rounded-xl shadow-lg"
            >
              <Zap className="h-6 w-6 mr-2" />
              Save Review
            </Button>
          </>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}