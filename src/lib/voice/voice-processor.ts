// Main voice processing service that orchestrates Web Speech API and Whisper

import { speechRecognition, audioRecorder, createAudioHash } from './speech-recognition'
import { createWhisperClient, getAudioDuration } from './whisper-client'
import { createWSETMapper } from '@/lib/wset/wset-mapper'
import type { 
  VoiceProcessingRequest, 
  VoiceProcessingResponse, 
  VoiceProcessingError,
  VoiceProcessingConfig,
  VoiceProcessingCost
} from '@/types/wset'

export class VoiceProcessingService {
  private whisperClient: any
  private wsetMapper: any
  private config: VoiceProcessingConfig
  private processingQueue: Map<string, Promise<VoiceProcessingResponse>> = new Map()

  constructor(config: Partial<VoiceProcessingConfig> = {}) {
    this.config = {
      maxRecordingDuration: config.maxRecordingDuration || 30000, // 30 seconds
      enableCache: config.enableCache !== false, // Default true
      whisperModel: config.whisperModel || 'whisper-1',
      gptModel: config.gptModel || 'gpt-4o-mini',
      confidenceThreshold: config.confidenceThreshold || 0.7,
      costLimit: config.costLimit || 30 // $30/month
    }

    // Initialize Whisper client if API key is available
    try {
      this.whisperClient = createWhisperClient()
    } catch (error) {
      console.warn('OpenAI API key not found. Whisper transcription will not be available.')
    }

    // Initialize WSET mapper lazily - don't try to create it during construction
    this.wsetMapper = null
  }

  async processVoice(request: VoiceProcessingRequest): Promise<VoiceProcessingResponse> {
    const startTime = Date.now()
    let transcript = ''
    let confidence = 0
    let fromCache = false
    let audioHash = ''

    try {
      // If transcript is already provided, use it
      if (request.transcript) {
        transcript = request.transcript
        confidence = 1.0 // Assume high confidence for provided transcript
      } else {
        // Generate audio hash for caching
        if (request.audioBlob) {
          audioHash = await createAudioHash(request.audioBlob)
          
          // Check cache if enabled
          if (this.config.enableCache && request.useCache !== false) {
            const cachedResult = await this.getCachedTranscription(audioHash)
            if (cachedResult) {
              return {
                ...cachedResult,
                fromCache: true,
                processingTime: Date.now() - startTime
              }
            }
          }
        }

        // Try Web Speech API first (free)
        if (speechRecognition.isWebSpeechSupported()) {
          try {
            console.log('Attempting Web Speech API transcription...')
            const webSpeechResult = await this.transcribeWithWebSpeech(request.audioBlob)
            transcript = webSpeechResult.transcript
            confidence = webSpeechResult.confidence
            console.log(`Web Speech API result: "${transcript}" (confidence: ${confidence})`)
          } catch (error) {
            console.log('Web Speech API failed, falling back to Whisper:', error)
          }
        }

        // Fallback to Whisper API if Web Speech failed or confidence too low
        if (!transcript || confidence < this.config.confidenceThreshold) {
          if (!this.whisperClient || !request.audioBlob) {
            throw {
              error: 'No transcription method available',
              code: 'API_ERROR'
            } as VoiceProcessingError
          }

          console.log('Using Whisper API for transcription...')
          const whisperResult = await this.transcribeWithWhisper(request.audioBlob)
          transcript = whisperResult.transcript
          confidence = Math.max(confidence, 0.85) // Assume good confidence from Whisper
        }
      }

      if (!transcript.trim()) {
        throw {
          error: 'No speech detected in audio',
          code: 'INVALID_INPUT'
        } as VoiceProcessingError
      }

      // Map transcript to WSET structure
      const wsetMapping = await this.mapTranscriptToWSET(transcript)
      
      const response: VoiceProcessingResponse = {
        transcript: transcript.trim(),
        wsetMapping,
        confidence,
        processingTime: Date.now() - startTime,
        fromCache
      }

      // Cache the result if enabled
      if (this.config.enableCache && audioHash && !fromCache) {
        await this.cacheTranscription(audioHash, response)
      }

      return response

    } catch (error) {
      if ((error as VoiceProcessingError).code) {
        throw error
      }
      
      throw {
        error: `Voice processing failed: ${error}`,
        code: 'API_ERROR',
        details: error
      } as VoiceProcessingError
    }
  }

  private async transcribeWithWebSpeech(audioBlob?: Blob): Promise<{ transcript: string; confidence: number }> {
    if (!audioBlob) {
      throw new Error('Audio blob required for Web Speech API')
    }

    // Web Speech API doesn't directly accept blob input
    // We need to play the audio and use real-time recognition
    // This is a limitation - in practice, you'd need to implement audio playback
    // For now, we'll throw an error to indicate this method needs audio streaming
    throw new Error('Web Speech API requires live audio input, not blob processing')
  }

  private async transcribeWithWhisper(audioBlob: Blob): Promise<{ transcript: string; confidence: number }> {
    const response = await this.whisperClient.transcribe(audioBlob, {
      model: this.config.whisperModel,
      language: 'en',
      prompt: 'This is a wine tasting note describing the appearance, nose, palate, and quality of a wine.',
      response_format: 'json',
      temperature: 0.1 // Lower temperature for more consistent results
    })

    return {
      transcript: response.text,
      confidence: 0.85 // Assume good confidence from Whisper
    }
  }

  private async mapTranscriptToWSET(transcript: string) {
    // Lazy initialize WSET mapper when actually needed
    if (!this.wsetMapper) {
      try {
        this.wsetMapper = createWSETMapper(undefined, this.config.gptModel)
      } catch (error) {
        console.warn('OpenAI API key not found. WSET mapping will not be available.')
      }
    }
    
    if (!this.wsetMapper) {
      // Fallback basic structure if WSET mapper is not available
      return {
        appearance: {
          intensity: undefined,
          color: undefined,
          clarity: undefined,
          otherObservations: undefined
        },
        nose: {
          condition: undefined,
          intensity: undefined,
          aromaCharacteristics: [],
          development: undefined
        },
        palate: {
          sweetness: undefined,
          acidity: undefined,
          tannin: undefined,
          alcohol: undefined,
          body: undefined,
          flavorIntensity: undefined,
          flavorCharacteristics: [],
          finish: undefined
        },
        conclusions: {
          qualityAssessment: 'good' as const,
          readinessForDrinking: undefined,
          agingPotential: undefined
        }
      }
    }

    try {
      const mappingResult = await this.wsetMapper.mapTranscriptToWSET({
        transcript,
        context: {
          wineType: this.inferWineTypeFromTranscript(transcript)
        }
      })

      return mappingResult.wsetNote
    } catch (error) {
      console.warn('WSET mapping failed, using fallback:', error)
      
      // Return basic structure with inferred quality
      const quality = this.inferQualityFromTranscript(transcript)
      return {
        appearance: {
          intensity: undefined,
          color: undefined,
          clarity: undefined,
          otherObservations: undefined
        },
        nose: {
          condition: undefined,
          intensity: undefined,
          aromaCharacteristics: this.extractBasicDescriptors(transcript, 'nose'),
          development: undefined
        },
        palate: {
          sweetness: undefined,
          acidity: undefined,
          tannin: undefined,
          alcohol: undefined,
          body: undefined,
          flavorIntensity: undefined,
          flavorCharacteristics: this.extractBasicDescriptors(transcript, 'palate'),
          finish: undefined
        },
        conclusions: {
          qualityAssessment: quality,
          readinessForDrinking: undefined,
          agingPotential: undefined
        }
      }
    }
  }

  private inferWineTypeFromTranscript(transcript: string): 'red' | 'white' | 'rosé' | 'sparkling' | undefined {
    const text = transcript.toLowerCase()
    
    if (text.includes('tannin') || text.includes('red') || text.includes('purple') || text.includes('ruby')) {
      return 'red'
    }
    if (text.includes('white') || text.includes('lemon') || text.includes('gold') || text.includes('amber')) {
      return 'white'
    }
    if (text.includes('rosé') || text.includes('pink') || text.includes('salmon')) {
      return 'rosé'
    }
    if (text.includes('sparkling') || text.includes('bubbles') || text.includes('mousse')) {
      return 'sparkling'
    }
    
    return undefined
  }

  private inferQualityFromTranscript(transcript: string): 'faulty' | 'poor' | 'acceptable' | 'good' | 'very good' | 'outstanding' {
    const text = transcript.toLowerCase()
    
    if (text.includes('outstanding') || text.includes('exceptional') || text.includes('perfect')) {
      return 'outstanding'
    }
    if (text.includes('very good') || text.includes('excellent') || text.includes('superb')) {
      return 'very good'
    }
    if (text.includes('good') || text.includes('nice') || text.includes('pleasant')) {
      return 'good'
    }
    if (text.includes('acceptable') || text.includes('okay') || text.includes('decent')) {
      return 'acceptable'
    }
    if (text.includes('poor') || text.includes('disappointing') || text.includes('lacking')) {
      return 'poor'
    }
    if (text.includes('faulty') || text.includes('off') || text.includes('corked')) {
      return 'faulty'
    }
    
    return 'good' // Default fallback
  }

  private extractBasicDescriptors(transcript: string, category: 'nose' | 'palate'): string[] {
    const descriptors: string[] = []
    const text = transcript.toLowerCase()
    
    // Common wine descriptors
    const fruitDescriptors = ['apple', 'pear', 'citrus', 'lemon', 'lime', 'cherry', 'strawberry', 'raspberry', 'blackberry', 'plum', 'fig', 'tropical']
    const floralDescriptors = ['floral', 'rose', 'violet', 'jasmine', 'elderflower']
    const spiceDescriptors = ['spice', 'pepper', 'cinnamon', 'clove', 'nutmeg', 'vanilla']
    const earthDescriptors = ['earth', 'mineral', 'stone', 'forest', 'mushroom', 'leather']
    const oakDescriptors = ['oak', 'vanilla', 'toast', 'smoke', 'cedar']
    
    const allDescriptors = [...fruitDescriptors, ...floralDescriptors, ...spiceDescriptors, ...earthDescriptors, ...oakDescriptors]
    
    allDescriptors.forEach(descriptor => {
      if (text.includes(descriptor)) {
        descriptors.push(descriptor)
      }
    })
    
    return descriptors.slice(0, 5) // Limit to 5 descriptors
  }

  // Recording management
  async startRecording(): Promise<void> {
    const permission = await audioRecorder.getPermissionStatus()
    if (permission !== 'granted') {
      throw {
        error: 'Microphone permission required',
        code: 'INVALID_INPUT'
      } as VoiceProcessingError
    }

    await audioRecorder.startRecording({
      maxDuration: this.config.maxRecordingDuration
    })
  }

  async stopRecording(): Promise<Blob> {
    return await audioRecorder.stopRecording()
  }

  isRecording(): boolean {
    return audioRecorder.isRecording()
  }

  // Live speech recognition (Web Speech API)
  async startLiveRecognition(
    onResult: (result: { transcript: string; confidence: number; isFinal: boolean }) => void,
    onError: (error: VoiceProcessingError) => void
  ): Promise<void> {
    if (!speechRecognition.isWebSpeechSupported()) {
      onError({
        error: 'Live speech recognition not supported in this browser',
        code: 'API_ERROR'
      })
      return
    }

    try {
      const result = await speechRecognition.startListening({
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
        timeout: this.config.maxRecordingDuration
      })

      onResult({
        transcript: result.transcript,
        confidence: result.confidence,
        isFinal: result.isFinal
      })
    } catch (error) {
      onError({
        error: (error as any).error || 'Speech recognition failed',
        code: (error as any).code || 'API_ERROR'
      })
    }
  }

  stopLiveRecognition(): void {
    speechRecognition.stopListening()
  }

  // Caching methods
  private async getCachedTranscription(audioHash: string): Promise<VoiceProcessingResponse | null> {
    try {
      const response = await fetch('/api/voice/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', audioHash })
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.result || null
    } catch (error) {
      console.warn('Failed to get cached transcription:', error)
      return null
    }
  }

  private async cacheTranscription(audioHash: string, result: VoiceProcessingResponse): Promise<void> {
    try {
      await fetch('/api/voice/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'set', 
          audioHash, 
          transcript: result.transcript,
          wsetMapping: result.wsetMapping,
          confidence: result.confidence
        })
      })
    } catch (error) {
      console.warn('Failed to cache transcription:', error)
    }
  }

  // Cost estimation
  estimateProcessingCost(audioBlob: Blob): VoiceProcessingCost {
    const transcriptionCost = this.whisperClient ? this.whisperClient.estimateCost(audioBlob) : 0
    const mappingCost = 0.001 // Estimated GPT-4 cost for mapping
    
    return {
      transcriptionCost,
      mappingCost,
      totalCost: transcriptionCost + mappingCost,
      tokensUsed: Math.ceil(audioBlob.size / 1000), // Rough estimate
      audioSeconds: audioBlob.size / (1024 * 8) // Very rough estimate
    }
  }

  // Utility methods
  getConfig(): VoiceProcessingConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<VoiceProcessingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  isWebSpeechAvailable(): boolean {
    return speechRecognition.isWebSpeechSupported()
  }

  isWhisperAvailable(): boolean {
    return !!this.whisperClient
  }

  async getAudioDuration(audioBlob: Blob): Promise<number> {
    return getAudioDuration(audioBlob)
  }
}

// Lazy singleton instance
let _voiceProcessorInstance: VoiceProcessingService | null = null

export const getVoiceProcessor = (): VoiceProcessingService => {
  if (!_voiceProcessorInstance) {
    _voiceProcessorInstance = new VoiceProcessingService({
      maxRecordingDuration: parseInt(process.env.NEXT_PUBLIC_MAX_RECORDING_DURATION || '30000'),
      enableCache: process.env.NEXT_PUBLIC_VOICE_PROCESSING_ENABLED !== 'false'
    })
  }
  return _voiceProcessorInstance
}

// For backward compatibility - deprecated, use getVoiceProcessor()
export const voiceProcessor = null

export default VoiceProcessingService