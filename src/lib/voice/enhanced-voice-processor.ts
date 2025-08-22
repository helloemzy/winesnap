// Enhanced voice processor with real-time waveform, live transcription, and mobile optimization

import { getVoiceProcessor } from './voice-processor'
import type { VoiceProcessingError } from '@/types/wset'

interface WaveformData {
  frequencyData: Uint8Array
  timeDomainData: Uint8Array
  volume: number
  peak: number
}

interface LiveTranscriptionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  timestamp: number
}

interface RecordingSession {
  id: string
  startTime: number
  maxDuration: number
  isActive: boolean
  audioBlob?: Blob
  waveformHistory: WaveformData[]
  transcriptionResults: LiveTranscriptionResult[]
}

interface EnhancedVoiceConfig {
  maxRecordingDuration: number
  waveformUpdateRate: number
  enableLiveTranscription: boolean
  enableWaveformVisualization: boolean
  volumeThreshold: number
  enableSmartPrompts: boolean
}

export class EnhancedVoiceProcessor {
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private analyzerNode: AnalyserNode | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private stream: MediaStream | null = null
  private recordingSession: RecordingSession | null = null
  private waveformAnimationFrame: number | null = null
  private speechRecognition: SpeechRecognition | null = null
  
  private config: EnhancedVoiceConfig = {
    maxRecordingDuration: 30000,
    waveformUpdateRate: 60, // FPS
    enableLiveTranscription: true,
    enableWaveformVisualization: true,
    volumeThreshold: 0.1,
    enableSmartPrompts: true
  }

  private callbacks: {
    onWaveformUpdate?: (data: WaveformData) => void
    onVolumeChange?: (volume: number) => void
    onLiveTranscription?: (result: LiveTranscriptionResult) => void
    onRecordingStart?: () => void
    onRecordingStop?: (audioBlob: Blob) => void
    onRecordingProgress?: (progress: number) => void
    onError?: (error: VoiceProcessingError) => void
    onSilenceDetected?: (duration: number) => void
    onSpeechDetected?: () => void
  } = {}

  constructor(config?: Partial<EnhancedVoiceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    // Initialize speech recognition if available
    if (this.isWebSpeechSupported()) {
      this.initializeSpeechRecognition()
    }
  }

  // Public API methods
  async startRecording(callbacks: Partial<typeof this.callbacks> = {}): Promise<void> {
    if (this.recordingSession?.isActive) {
      throw new Error('Recording already in progress')
    }

    this.callbacks = { ...this.callbacks, ...callbacks }

    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      })

      await this.setupAudioProcessing()
      await this.startMediaRecorder()
      this.startWaveformAnalysis()
      
      if (this.config.enableLiveTranscription) {
        this.startLiveTranscription()
      }

      // Create recording session
      this.recordingSession = {
        id: Date.now().toString(),
        startTime: Date.now(),
        maxDuration: this.config.maxRecordingDuration,
        isActive: true,
        waveformHistory: [],
        transcriptionResults: []
      }

      this.callbacks.onRecordingStart?.()

      // Start progress tracking
      this.startProgressTracking()

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.recordingSession?.isActive) {
          this.stopRecording()
        }
      }, this.config.maxRecordingDuration)

    } catch (error) {
      const voiceError: VoiceProcessingError = {
        error: 'Failed to start recording: ' + (error as Error).message,
        code: 'API_ERROR'
      }
      this.callbacks.onError?.(voiceError)
      throw voiceError
    }
  }

  async stopRecording(): Promise<Blob> {
    if (!this.recordingSession?.isActive) {
      throw new Error('No active recording session')
    }

    return new Promise((resolve, reject) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        const chunks: BlobPart[] = []
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' })
          this.cleanup()
          
          if (this.recordingSession) {
            this.recordingSession.audioBlob = audioBlob
            this.recordingSession.isActive = false
          }

          this.callbacks.onRecordingStop?.(audioBlob)
          resolve(audioBlob)
        }

        this.mediaRecorder.onerror = (event) => {
          const error: VoiceProcessingError = {
            error: 'Recording failed: ' + (event as any).error,
            code: 'API_ERROR'
          }
          this.callbacks.onError?.(error)
          reject(error)
        }

        this.mediaRecorder.stop()
      } else {
        reject(new Error('MediaRecorder not available'))
      }
    })
  }

  isRecording(): boolean {
    return this.recordingSession?.isActive ?? false
  }

  getRecordingDuration(): number {
    if (!this.recordingSession) return 0
    return Date.now() - this.recordingSession.startTime
  }

  getWaveformHistory(): WaveformData[] {
    return this.recordingSession?.waveformHistory ?? []
  }

  getTranscriptionHistory(): LiveTranscriptionResult[] {
    return this.recordingSession?.transcriptionResults ?? []
  }

  // Configuration methods
  updateConfig(newConfig: Partial<EnhancedVoiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): EnhancedVoiceConfig {
    return { ...this.config }
  }

  // Capability checks
  isWebSpeechSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }

  isWaveformVisualizationSupported(): boolean {
    return 'AudioContext' in window || 'webkitAudioContext' in window
  }

  // Private methods
  private async setupAudioProcessing(): Promise<void> {
    if (!this.stream || !this.config.enableWaveformVisualization) return

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()

      // Create analyzer node
      this.analyzerNode = this.audioContext.createAnalyser()
      this.analyzerNode.fftSize = 2048
      this.analyzerNode.smoothingTimeConstant = 0.8

      // Create source node
      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream)
      this.sourceNode.connect(this.analyzerNode)

    } catch (error) {
      console.warn('Failed to setup audio processing:', error)
    }
  }

  private async startMediaRecorder(): Promise<void> {
    if (!this.stream) throw new Error('No media stream available')

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: this.getSupportedMimeType()
    })
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm' // fallback
  }

  private startWaveformAnalysis(): void {
    if (!this.analyzerNode || !this.config.enableWaveformVisualization) return

    const bufferLength = this.analyzerNode.frequencyBinCount
    const frequencyData = new Uint8Array(bufferLength)
    const timeDomainData = new Uint8Array(bufferLength)

    const analyze = () => {
      if (!this.analyzerNode || !this.recordingSession?.isActive) return

      this.analyzerNode.getByteFrequencyData(frequencyData)
      this.analyzerNode.getByteTimeDomainData(timeDomainData)

      // Calculate volume and peak
      let volume = 0
      let peak = 0
      
      for (let i = 0; i < timeDomainData.length; i++) {
        const sample = Math.abs(timeDomainData[i] - 128) / 128
        volume += sample
        peak = Math.max(peak, sample)
      }
      volume = volume / timeDomainData.length

      const waveformData: WaveformData = {
        frequencyData: new Uint8Array(frequencyData),
        timeDomainData: new Uint8Array(timeDomainData),
        volume,
        peak
      }

      // Store in history
      if (this.recordingSession) {
        this.recordingSession.waveformHistory.push(waveformData)
        // Keep only last 300 frames (5 seconds at 60fps)
        if (this.recordingSession.waveformHistory.length > 300) {
          this.recordingSession.waveformHistory.shift()
        }
      }

      // Trigger callbacks
      this.callbacks.onWaveformUpdate?.(waveformData)
      this.callbacks.onVolumeChange?.(volume)

      // Detect speech/silence
      if (volume > this.config.volumeThreshold) {
        this.callbacks.onSpeechDetected?.()
      }

      // Schedule next frame
      this.waveformAnimationFrame = requestAnimationFrame(analyze)
    }

    analyze()
  }

  private initializeSpeechRecognition(): void {
    try {
      const SpeechRecognitionClass = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition

      if (!SpeechRecognitionClass) return

      this.speechRecognition = new SpeechRecognitionClass()
      this.speechRecognition.continuous = true
      this.speechRecognition.interimResults = true
      this.speechRecognition.maxAlternatives = 1
      this.speechRecognition.lang = 'en-US'

      this.speechRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          const confidence = result[0].confidence || 0.9

          const transcriptionResult: LiveTranscriptionResult = {
            transcript,
            confidence,
            isFinal: result.isFinal,
            timestamp: Date.now()
          }

          // Store in session
          if (this.recordingSession) {
            this.recordingSession.transcriptionResults.push(transcriptionResult)
          }

          this.callbacks.onLiveTranscription?.(transcriptionResult)
        }
      }

      this.speechRecognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
      }

    } catch (error) {
      console.warn('Failed to initialize speech recognition:', error)
    }
  }

  private startLiveTranscription(): void {
    if (!this.speechRecognition || !this.config.enableLiveTranscription) return

    try {
      this.speechRecognition.start()
    } catch (error) {
      console.warn('Failed to start live transcription:', error)
    }
  }

  private startProgressTracking(): void {
    const updateProgress = () => {
      if (!this.recordingSession?.isActive) return

      const duration = this.getRecordingDuration()
      const progress = duration / this.config.maxRecordingDuration

      this.callbacks.onRecordingProgress?.(progress)

      if (this.recordingSession.isActive) {
        setTimeout(updateProgress, 100) // Update every 100ms
      }
    }

    updateProgress()
  }

  private cleanup(): void {
    // Stop waveform analysis
    if (this.waveformAnimationFrame) {
      cancelAnimationFrame(this.waveformAnimationFrame)
      this.waveformAnimationFrame = null
    }

    // Stop speech recognition
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop()
      } catch (error) {
        // Ignore errors when stopping
      }
    }

    // Clean up audio context
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    if (this.analyzerNode) {
      this.analyzerNode.disconnect()
      this.analyzerNode = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    // Stop media tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    // Reset media recorder
    this.mediaRecorder = null
  }
}

// Smart prompts for better wine descriptions
export const wineDescriptionPrompts = {
  appearance: [
    "Describe the wine's color and clarity",
    "How intense is the color?",
    "What do you see in the glass?"
  ],
  nose: [
    "What aromas do you detect?",
    "Describe the intensity of the nose",
    "Any fruit, floral, or spice notes?"
  ],
  palate: [
    "How does it taste?",
    "Describe the body and texture",
    "What flavors come through?",
    "How's the finish?"
  ],
  overall: [
    "What's your overall impression?",
    "How would you rate this wine?",
    "Would you drink this again?"
  ]
}

export const getRandomPrompt = (category?: keyof typeof wineDescriptionPrompts): string => {
  const categories = Object.keys(wineDescriptionPrompts) as (keyof typeof wineDescriptionPrompts)[]
  const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)]
  const prompts = wineDescriptionPrompts[selectedCategory]
  return prompts[Math.floor(Math.random() * prompts.length)]
}

// Mobile-optimized gesture controls
export class MobileVoiceGestures {
  private element: HTMLElement
  private isLongPressActive = false
  private longPressTimer: NodeJS.Timeout | null = null
  private tapCount = 0
  private tapTimer: NodeJS.Timeout | null = null
  
  constructor(element: HTMLElement) {
    this.element = element
    this.setupGestureListeners()
  }

  private setupGestureListeners(): void {
    let touchStartY = 0
    let touchStartTime = 0

    // Touch events for mobile
    this.element.addEventListener('touchstart', (e) => {
      e.preventDefault()
      touchStartY = e.touches[0].clientY
      touchStartTime = Date.now()
      
      // Start long press detection
      this.longPressTimer = setTimeout(() => {
        this.isLongPressActive = true
        this.element.dispatchEvent(new CustomEvent('longPressStart'))
      }, 500) // 500ms for long press
    }, { passive: false })

    this.element.addEventListener('touchend', (e) => {
      e.preventDefault()
      const touchDuration = Date.now() - touchStartTime
      
      // Clear long press timer
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }

      if (this.isLongPressActive) {
        this.isLongPressActive = false
        this.element.dispatchEvent(new CustomEvent('longPressEnd'))
      } else if (touchDuration < 300) {
        // Handle tap
        this.handleTap()
      }
    }, { passive: false })

    this.element.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY
      
      // Detect swipe up/down
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          this.element.dispatchEvent(new CustomEvent('swipeUp'))
        } else {
          this.element.dispatchEvent(new CustomEvent('swipeDown'))
        }
      }
    }, { passive: true })

    // Mouse events for desktop fallback
    this.element.addEventListener('mousedown', (e) => {
      this.longPressTimer = setTimeout(() => {
        this.isLongPressActive = true
        this.element.dispatchEvent(new CustomEvent('longPressStart'))
      }, 500)
    })

    this.element.addEventListener('mouseup', (e) => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }

      if (this.isLongPressActive) {
        this.isLongPressActive = false
        this.element.dispatchEvent(new CustomEvent('longPressEnd'))
      } else {
        this.handleTap()
      }
    })
  }

  private handleTap(): void {
    this.tapCount++
    
    if (this.tapTimer) {
      clearTimeout(this.tapTimer)
    }
    
    this.tapTimer = setTimeout(() => {
      if (this.tapCount === 1) {
        this.element.dispatchEvent(new CustomEvent('singleTap'))
      } else if (this.tapCount === 2) {
        this.element.dispatchEvent(new CustomEvent('doubleTap'))
      }
      this.tapCount = 0
    }, 300)
  }

  destroy(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
    }
    if (this.tapTimer) {
      clearTimeout(this.tapTimer)
    }
  }
}

// Singleton instance
let enhancedVoiceProcessor: EnhancedVoiceProcessor | null = null

export const getEnhancedVoiceProcessor = (): EnhancedVoiceProcessor => {
  if (!enhancedVoiceProcessor) {
    enhancedVoiceProcessor = new EnhancedVoiceProcessor({
      maxRecordingDuration: 30000,
      enableLiveTranscription: true,
      enableWaveformVisualization: true,
      volumeThreshold: 0.1
    })
  }
  return enhancedVoiceProcessor
}

export default EnhancedVoiceProcessor