// Client-side API for voice processing

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { VoiceProcessingRequest, VoiceProcessingResponse, VoiceProcessingError } from '@/types/wset'

export interface VoiceProcessingApiRequest {
  audioBlob?: Blob
  audioUrl?: string
  transcript?: string
  useCache?: boolean
}

export class VoiceProcessingApi {
  private static instance: VoiceProcessingApi
  private baseUrl = '/api/voice'

  private constructor() {}

  static getInstance(): VoiceProcessingApi {
    if (!VoiceProcessingApi.instance) {
      VoiceProcessingApi.instance = new VoiceProcessingApi()
    }
    return VoiceProcessingApi.instance
  }

  async processVoice(request: VoiceProcessingApiRequest): Promise<VoiceProcessingResponse> {
    try {
      // Get the current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw {
          error: 'Authentication required',
          code: 'API_ERROR'
        } as VoiceProcessingError
      }

      let requestPayload: any = {
        userId: session.user.id,
        useCache: request.useCache !== false
      }

      // Handle different input types
      if (request.transcript) {
        requestPayload.transcript = request.transcript
      } else if (request.audioBlob) {
        // Upload audio blob to Supabase Storage first
        const audioUrl = await this.uploadAudioBlob(request.audioBlob, session.user.id)
        requestPayload.audioUrl = audioUrl
      } else if (request.audioUrl) {
        requestPayload.audioUrl = request.audioUrl
      } else {
        throw {
          error: 'No audio or transcript provided',
          code: 'INVALID_INPUT'
        } as VoiceProcessingError
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('voice-process', {
        body: requestPayload,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw {
          error: error.message || 'Voice processing failed',
          code: 'API_ERROR',
          details: error
        } as VoiceProcessingError
      }

      return data as VoiceProcessingResponse

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

  private async uploadAudioBlob(audioBlob: Blob, userId: string): Promise<string> {
    const fileName = `voice-recordings/${userId}/${Date.now()}.webm`
    
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'winesnap-media')
      .upload(fileName, audioBlob, {
        contentType: audioBlob.type,
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload audio: ${error.message}`)
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'winesnap-media')
      .getPublicUrl(fileName)

    return publicUrl
  }

  async getCachedResult(audioHash: string): Promise<VoiceProcessingResponse | null> {
    try {
      const { data, error } = await supabase
        .from('voice_processing_cache')
        .select('*')
        .eq('audio_hash', audioHash)
        .single()

      if (error || !data) {
        return null
      }

      return {
        transcript: data.transcript,
        wsetMapping: data.wset_mapping,
        confidence: data.processing_confidence,
        processingTime: 0,
        fromCache: true
      }
    } catch (error) {
      console.warn('Failed to get cached result:', error)
      return null
    }
  }

  async clearCache(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Note: This would require RLS policy adjustment or admin function
    // For now, just log the attempt
    console.log('Cache clearing would require admin privileges')
  }
}

// Export singleton instance
export const voiceApi = VoiceProcessingApi.getInstance()

// React hook for voice processing
export function useVoiceProcessing() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<VoiceProcessingError | null>(null)
  const [result, setResult] = useState<VoiceProcessingResponse | null>(null)

  const processVoice = async (request: VoiceProcessingApiRequest) => {
    try {
      setIsProcessing(true)
      setError(null)
      
      const response = await voiceApi.processVoice(request)
      setResult(response)
      
      return response
    } catch (err) {
      const error = err as VoiceProcessingError
      setError(error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setError(null)
    setResult(null)
    setIsProcessing(false)
  }

  return {
    processVoice,
    isProcessing,
    error,
    result,
    reset
  }
}

// Cost tracking utilities
export function estimateVoiceProcessingCost(audioBlob: Blob): number {
  // Rough cost estimation
  const estimatedDurationMinutes = audioBlob.size / (1024 * 60) // Very rough estimate
  const whisperCostPerMinute = 0.006 // $0.006 per minute for Whisper
  const gptCostPerRequest = 0.001 // Estimated GPT cost for mapping
  
  return Math.max(whisperCostPerMinute * estimatedDurationMinutes, whisperCostPerMinute) + gptCostPerRequest
}

export default VoiceProcessingApi