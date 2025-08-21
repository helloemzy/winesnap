// Client-side API for wine management

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { WSETTastingNote } from '@/types/wset'

type WineEntry = Database['public']['Tables']['wine_entries']['Row']
type WineEntryInsert = Database['public']['Tables']['wine_entries']['Insert']
type WineEntryUpdate = Database['public']['Tables']['wine_entries']['Update']

export interface WineWithDetails extends WineEntry {
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  like_count: number
  comment_count: number
  user_liked?: boolean
  comments?: Array<{
    id: string
    content: string
    created_at: string
    profiles: {
      username: string
      display_name: string | null
      avatar_url: string | null
    } | null
  }>
}

export interface WineSearchFilters {
  region?: string
  country?: string
  grape_varieties?: string[]
  quality_min?: string
  quality_max?: string
  vintage_min?: number
  vintage_max?: number
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'rating' | 'quality_assessment' | 'vintage'
  sort_order?: 'asc' | 'desc'
  public?: boolean
  query?: string
}

export interface CreateWineFromVoiceRequest {
  wineBasicInfo: {
    wine_name: string
    producer?: string
    vintage?: number
    region?: string
    country?: string
    grape_varieties?: string[]
    alcohol_content?: number
    price_paid?: number
    where_purchased?: string
  }
  wsetTastingNote: WSETTastingNote
  voiceData?: {
    audio_url?: string
    voice_transcript?: string
    processing_confidence?: number
  }
  mediaUrls?: {
    photo_url?: string
  }
  metadata: {
    is_public?: boolean
    rating?: number
    notes?: string
    tasting_date?: string
  }
}

export class WineApi {
  private static instance: WineApi

  private constructor() {}

  static getInstance(): WineApi {
    if (!WineApi.instance) {
      WineApi.instance = new WineApi()
    }
    return WineApi.instance
  }

  // Create wine entry from voice processing result
  async createWineFromVoice(request: CreateWineFromVoiceRequest): Promise<WineWithDetails> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Authentication required')
    }

    // Transform WSET tasting note to database format
    const wineEntryData: WineEntryInsert = {
      user_id: session.user.id,
      
      // Basic wine info
      wine_name: request.wineBasicInfo.wine_name,
      producer: request.wineBasicInfo.producer,
      vintage: request.wineBasicInfo.vintage,
      region: request.wineBasicInfo.region,
      country: request.wineBasicInfo.country,
      grape_varieties: request.wineBasicInfo.grape_varieties,
      alcohol_content: request.wineBasicInfo.alcohol_content,
      price_paid: request.wineBasicInfo.price_paid,
      where_purchased: request.wineBasicInfo.where_purchased,

      // WSET Appearance
      appearance_intensity: request.wsetTastingNote.appearance?.intensity,
      appearance_color: request.wsetTastingNote.appearance?.color,
      appearance_clarity: request.wsetTastingNote.appearance?.clarity,
      appearance_other_observations: request.wsetTastingNote.appearance?.otherObservations,

      // WSET Nose
      nose_condition: request.wsetTastingNote.nose?.condition,
      nose_intensity: request.wsetTastingNote.nose?.intensity,
      nose_aroma_characteristics: request.wsetTastingNote.nose?.aromaCharacteristics,
      nose_development: request.wsetTastingNote.nose?.development,

      // WSET Palate
      palate_sweetness: request.wsetTastingNote.palate?.sweetness,
      palate_acidity: request.wsetTastingNote.palate?.acidity,
      palate_tannin: request.wsetTastingNote.palate?.tannin,
      palate_alcohol: request.wsetTastingNote.palate?.alcohol,
      palate_body: request.wsetTastingNote.palate?.body,
      palate_flavor_intensity: request.wsetTastingNote.palate?.flavorIntensity,
      palate_flavor_characteristics: request.wsetTastingNote.palate?.flavorCharacteristics,
      palate_finish: request.wsetTastingNote.palate?.finish,

      // WSET Conclusions
      quality_assessment: request.wsetTastingNote.conclusions.qualityAssessment,
      readiness_for_drinking: request.wsetTastingNote.conclusions.readinessForDrinking,
      aging_potential: request.wsetTastingNote.conclusions.agingPotential,

      // Voice and media data
      audio_url: request.voiceData?.audio_url,
      voice_transcript: request.voiceData?.voice_transcript,
      processing_confidence: request.voiceData?.processing_confidence,
      photo_url: request.mediaUrls?.photo_url,

      // Metadata
      is_public: request.metadata.is_public ?? true,
      rating: request.metadata.rating,
      notes: request.metadata.notes,
      tasting_date: request.metadata.tasting_date
    }

    const { data, error } = await supabase.functions.invoke('wines-api/create', {
      body: wineEntryData,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to create wine entry: ${error.message}`)
    }

    return data.wine
  }

  // Get user's wines
  async getUserWines(limit = 20, offset = 0): Promise<WineWithDetails[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Authentication required')

    const { data, error } = await supabase.functions.invoke('wines-api', {
      body: null,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to fetch wines: ${error.message}`)
    }

    return data.wines
  }

  // Get public wines
  async getPublicWines(limit = 20, offset = 0): Promise<WineWithDetails[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Authentication required')

    const url = new URL('wines-api', 'https://placeholder.com')
    url.searchParams.set('public', 'true')
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('offset', offset.toString())

    const { data, error } = await supabase.functions.invoke('wines-api', {
      body: null,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to fetch public wines: ${error.message}`)
    }

    return data.wines
  }

  // Get wine by ID
  async getWineById(wineId: string): Promise<WineWithDetails> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Authentication required')

    const { data, error } = await supabase.functions.invoke(`wines-api/${wineId}`, {
      body: null,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to fetch wine: ${error.message}`)
    }

    return data.wine
  }

  // Update wine
  async updateWine(wineId: string, updates: WineEntryUpdate): Promise<WineWithDetails> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Authentication required')

    const { data, error } = await supabase.functions.invoke(`wines-api/${wineId}`, {
      method: 'PUT',
      body: updates,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to update wine: ${error.message}`)
    }

    return data.wine
  }

  // Delete wine
  async deleteWine(wineId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Authentication required')

    const { error } = await supabase.functions.invoke(`wines-api/${wineId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to delete wine: ${error.message}`)
    }
  }

  // Search wines
  async searchWines(filters: WineSearchFilters): Promise<WineWithDetails[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Authentication required')

    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, value.toString())
        }
      }
    })

    const { data, error } = await supabase.functions.invoke(`wines-api/search?${params}`, {
      body: null,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to search wines: ${error.message}`)
    }

    return data.wines
  }

  // Get social feed
  async getSocialFeed(limit = 20, offset = 0): Promise<any[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Authentication required')

    const { data, error } = await supabase.functions.invoke(`wines-api/feed?limit=${limit}&offset=${offset}`, {
      body: null,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      throw new Error(`Failed to fetch social feed: ${error.message}`)
    }

    return data.activities
  }

  // Like/unlike wine
  async toggleWineLike(wineId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('wine_entry_likes')
      .select('id')
      .eq('wine_entry_id', wineId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('wine_entry_likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) throw new Error(`Failed to unlike: ${error.message}`)
      return false
    } else {
      // Like
      const { error } = await supabase
        .from('wine_entry_likes')
        .insert({
          wine_entry_id: wineId,
          user_id: user.id
        })

      if (error) throw new Error(`Failed to like: ${error.message}`)
      return true
    }
  }

  // Add comment
  async addComment(wineId: string, content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    const { error } = await supabase
      .from('wine_entry_comments')
      .insert({
        wine_entry_id: wineId,
        user_id: user.id,
        content: content.trim()
      })

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`)
    }
  }

  // Upload photo
  async uploadPhoto(file: File, userId: string): Promise<string> {
    const fileName = `wine-photos/${userId}/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'winesnap-media')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload photo: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'winesnap-media')
      .getPublicUrl(fileName)

    return publicUrl
  }
}

// Export singleton
export const wineApi = WineApi.getInstance()

// React hooks
export function useWines() {
  const [wines, setWines] = useState<WineWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWines = async (isPublic = false) => {
    try {
      setLoading(true)
      setError(null)
      const data = isPublic ? await wineApi.getPublicWines() : await wineApi.getUserWines()
      setWines(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWines()
  }, [])

  return { wines, loading, error, reload: loadWines }
}

export function useWineById(wineId: string) {
  const [wine, setWine] = useState<WineWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!wineId) return

    const loadWine = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await wineApi.getWineById(wineId)
        setWine(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadWine()
  }, [wineId])

  return { wine, loading, error }
}

export function useWineSearch(filters: WineSearchFilters) {
  const [wines, setWines] = useState<WineWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await wineApi.searchWines(filters)
      setWines(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return { wines, loading, error, search }
}

export default WineApi