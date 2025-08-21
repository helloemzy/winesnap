// OpenAI Whisper API client for audio transcription

export interface WhisperTranscriptionOptions {
  model?: 'whisper-1'
  language?: string
  prompt?: string
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
  temperature?: number
}

export interface WhisperTranscriptionResponse {
  text: string
  language?: string
  duration?: number
  segments?: Array<{
    id: number
    seek: number
    start: number
    end: number
    text: string
    tokens: number[]
    temperature: number
    avg_logprob: number
    compression_ratio: number
    no_speech_prob: number
  }>
}

export interface WhisperError {
  error: string
  code: 'INVALID_FILE' | 'FILE_TOO_LARGE' | 'UNSUPPORTED_FORMAT' | 'API_ERROR' | 'RATE_LIMITED' | 'AUTHENTICATION_ERROR'
  details?: any
}

class WhisperClient {
  private apiKey: string
  private baseURL = 'https://api.openai.com/v1'
  private maxFileSize = 25 * 1024 * 1024 // 25MB OpenAI limit

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async transcribe(
    audio: Blob | File,
    options: WhisperTranscriptionOptions = {}
  ): Promise<WhisperTranscriptionResponse> {
    try {
      // Validate file size
      if (audio.size > this.maxFileSize) {
        throw {
          error: `Audio file too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`,
          code: 'FILE_TOO_LARGE'
        } as WhisperError
      }

      // Validate file type
      const supportedTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 
        'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/flac'
      ]
      
      if (!supportedTypes.some(type => audio.type.includes(type.split('/')[1]))) {
        // Try to infer from file extension if available
        const fileName = (audio as File).name || 'audio.webm'
        const extension = fileName.split('.').pop()?.toLowerCase()
        const supportedExtensions = ['mp3', 'wav', 'webm', 'mp4', 'm4a', 'ogg', 'flac']
        
        if (!extension || !supportedExtensions.includes(extension)) {
          console.warn(`Potentially unsupported audio format: ${audio.type}. Proceeding anyway.`)
        }
      }

      // Prepare form data
      const formData = new FormData()
      
      // Ensure the file has a proper name and extension
      let audioFile: File
      if (audio instanceof File) {
        audioFile = audio
      } else {
        // Convert Blob to File with proper name
        const extension = this.getExtensionFromMimeType(audio.type) || 'webm'
        audioFile = new File([audio], `audio.${extension}`, { type: audio.type })
      }
      
      formData.append('file', audioFile)
      formData.append('model', options.model || 'whisper-1')
      
      if (options.language) {
        formData.append('language', options.language)
      }
      
      if (options.prompt) {
        formData.append('prompt', options.prompt)
      }
      
      if (options.response_format) {
        formData.append('response_format', options.response_format)
      }
      
      if (options.temperature !== undefined) {
        formData.append('temperature', options.temperature.toString())
      }

      // Make API request
      const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        let errorCode: WhisperError['code'] = 'API_ERROR'
        if (response.status === 401) {
          errorCode = 'AUTHENTICATION_ERROR'
        } else if (response.status === 429) {
          errorCode = 'RATE_LIMITED'
        } else if (response.status === 400) {
          errorCode = 'INVALID_FILE'
        }

        throw {
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorCode,
          details: errorData
        } as WhisperError
      }

      const result = await response.json()
      
      // Handle different response formats
      if (options.response_format === 'verbose_json') {
        return {
          text: result.text,
          language: result.language,
          duration: result.duration,
          segments: result.segments
        }
      } else {
        return {
          text: typeof result === 'string' ? result : result.text
        }
      }
    } catch (error) {
      if ((error as WhisperError).code) {
        throw error
      }
      
      throw {
        error: `Whisper transcription failed: ${error}`,
        code: 'API_ERROR',
        details: error
      } as WhisperError
    }
  }

  private getExtensionFromMimeType(mimeType: string): string | null {
    const mimeToExtension: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/webm': 'webm',
      'audio/mp4': 'mp4',
      'audio/m4a': 'm4a',
      'audio/ogg': 'ogg',
      'audio/flac': 'flac'
    }

    return mimeToExtension[mimeType] || null
  }

  // Utility method to estimate transcription cost
  estimateCost(audioBlob: Blob): number {
    // OpenAI Whisper pricing: $0.006 per minute
    const estimatedDurationMinutes = audioBlob.size / (1024 * 60) // Rough estimate
    return Math.max(0.006 * estimatedDurationMinutes, 0.006) // Minimum charge
  }

  // Convert audio to optimal format if needed
  async optimizeAudioForWhisper(audioBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // If it's already in a supported format and small enough, return as-is
      if (audioBlob.size <= this.maxFileSize && this.isSupportedFormat(audioBlob.type)) {
        resolve(audioBlob)
        return
      }

      // For now, return the original blob
      // In a production environment, you might want to:
      // 1. Compress the audio
      // 2. Convert to a more efficient format
      // 3. Reduce sample rate if too high
      resolve(audioBlob)
    })
  }

  private isSupportedFormat(mimeType: string): boolean {
    const supportedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm',
      'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/flac'
    ]
    return supportedTypes.some(type => mimeType.includes(type.split('/')[1]))
  }
}

// Factory function to create Whisper client
export function createWhisperClient(apiKey?: string): WhisperClient {
  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error('OpenAI API key is required for Whisper transcription')
  }
  return new WhisperClient(key)
}

// Utility functions for audio processing
export async function getAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    const url = URL.createObjectURL(audioBlob)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio metadata'))
    })
    
    audio.src = url
  })
}

export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Audio compression utilities (placeholder for future implementation)
export async function compressAudio(audioBlob: Blob, targetSizeKB?: number): Promise<Blob> {
  // This is a placeholder - in production, you'd implement actual audio compression
  // using libraries like opus-encoder or by sending to a compression service
  return audioBlob
}

export default WhisperClient