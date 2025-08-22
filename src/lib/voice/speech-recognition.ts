// Web Speech API integration with fallback handling

export interface SpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  timeout?: number
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: string[]
}

export interface SpeechRecognitionError {
  error: string
  code: 'not_supported' | 'permission_denied' | 'network_error' | 'timeout' | 'no_speech' | 'audio_capture' | 'service_not_allowed'
}

class SpeechRecognitionService {
  private recognition: any = null
  private isSupported = false
  private isListening = false

  constructor() {
    this.initializeRecognition()
  }

  private initializeRecognition() {
    // Check for browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      this.isSupported = false
      return
    }

    this.isSupported = true
    this.recognition = new SpeechRecognition()
  }

  public isWebSpeechSupported(): boolean {
    return this.isSupported
  }

  public async startListening(
    options: SpeechRecognitionOptions = {}
  ): Promise<SpeechRecognitionResult> {
    if (!this.isSupported) {
      throw new Error('Speech recognition not supported in this browser')
    }

    if (this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }

    return new Promise((resolve, reject) => {
      // Configure recognition
      this.recognition.lang = options.language || 'en-US'
      this.recognition.continuous = options.continuous || false
      this.recognition.interimResults = options.interimResults || false
      this.recognition.maxAlternatives = options.maxAlternatives || 1

      let timeout: NodeJS.Timeout | null = null
      let finalTranscript = ''
      let bestConfidence = 0

      // Set up timeout
      if (options.timeout) {
        timeout = setTimeout(() => {
          this.recognition.stop()
          reject({
            error: 'Speech recognition timeout',
            code: 'timeout'
          } as SpeechRecognitionError)
        }, options.timeout)
      }

      // Handle results
      this.recognition.onresult = (event: any) => {
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          const confidence = result[0].confidence

          if (result.isFinal) {
            finalTranscript += transcript
            bestConfidence = Math.max(bestConfidence, confidence || 0.8)
          } else {
            interimTranscript += transcript
          }
        }

        // Return interim results if requested
        if (options.interimResults && interimTranscript) {
          const alternatives = []
          const lastResult = event.results[event.results.length - 1]
          for (let i = 0; i < Math.min(lastResult.length, options.maxAlternatives || 1); i++) {
            alternatives.push(lastResult[i].transcript)
          }

          // Don't resolve yet, just provide interim feedback
          // This would need to be handled differently in a real implementation
          // For now, we'll only resolve on final results
        }
      }

      // Handle end of speech
      this.recognition.onend = () => {
        this.isListening = false
        if (timeout) clearTimeout(timeout)
        
        if (finalTranscript) {
          resolve({
            transcript: finalTranscript.trim(),
            confidence: bestConfidence,
            isFinal: true
          })
        } else {
          reject({
            error: 'No speech detected',
            code: 'no_speech'
          } as SpeechRecognitionError)
        }
      }

      // Handle errors
      this.recognition.onerror = (event: any) => {
        this.isListening = false
        if (timeout) clearTimeout(timeout)
        
        const errorMap: Record<string, SpeechRecognitionError['code']> = {
          'not-allowed': 'permission_denied',
          'service-not-allowed': 'service_not_allowed',
          'network': 'network_error',
          'audio-capture': 'audio_capture',
          'no-speech': 'no_speech'
        }

        reject({
          error: `Speech recognition error: ${event.error}`,
          code: errorMap[event.error] || 'network_error'
        } as SpeechRecognitionError)
      }

      // Start recognition
      try {
        this.recognition.start()
        this.isListening = true
      } catch (error) {
        reject({
          error: `Failed to start speech recognition: ${error}`,
          code: 'audio_capture'
        } as SpeechRecognitionError)
      }
    })
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  public getIsListening(): boolean {
    return this.isListening
  }
}

// Audio recording utilities
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async startRecording(options: {
    maxDuration?: number
    mimeType?: string
  } = {}): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })

      // Determine the best supported mime type
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ]

      let mimeType = options.mimeType
      if (!mimeType) {
        mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm'
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType })
      this.audioChunks = []

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      // Start recording first
      this.mediaRecorder.start(1000) // Collect data every second

      // Set maximum duration AFTER starting recording
      if (options.maxDuration) {
        setTimeout(() => {
          // Check if recording is still active before stopping
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.stopRecording()
          }
        }, options.maxDuration)
      }
    } catch (error) {
      throw new Error(`Failed to start audio recording: ${error}`)
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      // Check if recording is in a valid state to stop
      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording already stopped'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm'
        })
        
        // Clean up
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop())
          this.stream = null
        }
        
        this.mediaRecorder = null
        this.audioChunks = []
        
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  async getPermissionStatus(): Promise<PermissionState> {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      return permission.state
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        return 'granted'
      } catch (error) {
        return 'denied'
      }
    }
  }
}

// Utility functions
export function createAudioHash(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        resolve(hashHex)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(audioBlob)
  })
}

export function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Export singleton instance
export const speechRecognition = new SpeechRecognitionService()
export const audioRecorder = new AudioRecorder()