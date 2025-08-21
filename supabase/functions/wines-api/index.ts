// Supabase Edge Function for wine management API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WineEntry {
  id?: string
  user_id: string
  wine_name: string
  producer?: string
  vintage?: number
  region?: string
  country?: string
  grape_varieties?: string[]
  alcohol_content?: number
  price_paid?: number
  where_purchased?: string
  
  // WSET fields
  appearance_intensity?: string
  appearance_color?: string
  appearance_clarity?: string
  appearance_other_observations?: string
  
  nose_condition?: string
  nose_intensity?: string
  nose_aroma_characteristics?: string[]
  nose_development?: string
  
  palate_sweetness?: string
  palate_acidity?: string
  palate_tannin?: string
  palate_alcohol?: string
  palate_body?: string
  palate_flavor_intensity?: string
  palate_flavor_characteristics?: string[]
  palate_finish?: string
  
  quality_assessment: string
  readiness_for_drinking?: string
  aging_potential?: string
  
  // Media and metadata
  photo_url?: string
  audio_url?: string
  voice_transcript?: string
  processing_confidence?: number
  is_public?: boolean
  rating?: number
  notes?: string
  tasting_date?: string
}

interface SearchFilters {
  region?: string
  country?: string
  grape_varieties?: string[]
  quality_min?: string
  quality_max?: string
  vintage_min?: number
  vintage_max?: number
  user_id?: string
  is_public?: boolean
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'rating' | 'quality_assessment' | 'vintage'
  sort_order?: 'asc' | 'desc'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const url = new URL(req.url)
    const path = url.pathname

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route handling
    if (path === '/wines-api' || path === '/wines-api/') {
      return await handleWinesList(req, supabase, user.id)
    } else if (path === '/wines-api/create') {
      return await handleWineCreate(req, supabase, user.id)
    } else if (path.match(/\/wines-api\/[a-f0-9-]+$/)) {
      const wineId = path.split('/').pop()!
      return await handleWineById(req, supabase, user.id, wineId)
    } else if (path === '/wines-api/search') {
      return await handleWineSearch(req, supabase, user.id)
    } else if (path === '/wines-api/feed') {
      return await handleSocialFeed(req, supabase, user.id)
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Wine API error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleWinesList(req: Request, supabase: any, userId: string) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const isPublic = url.searchParams.get('public') === 'true'

  let query = supabase
    .from('wine_entries')
    .select(`
      *,
      profiles!wine_entries_user_id_fkey(username, display_name, avatar_url),
      wine_entry_likes(id),
      wine_entry_comments(id)
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (isPublic) {
    query = query.eq('is_public', true)
  } else {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Transform data to include like and comment counts
  const wines = data.map(wine => ({
    ...wine,
    like_count: wine.wine_entry_likes?.length || 0,
    comment_count: wine.wine_entry_comments?.length || 0,
    wine_entry_likes: undefined, // Remove the arrays from response
    wine_entry_comments: undefined
  }))

  return new Response(
    JSON.stringify({ wines }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleWineCreate(req: Request, supabase: any, userId: string) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const wineData: WineEntry = await req.json()
  wineData.user_id = userId

  // Validate required fields
  if (!wineData.wine_name || !wineData.quality_assessment) {
    return new Response(
      JSON.stringify({ error: 'wine_name and quality_assessment are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabase
    .from('wine_entries')
    .insert(wineData)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ wine: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleWineById(req: Request, supabase: any, userId: string, wineId: string) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('wine_entries')
      .select(`
        *,
        profiles!wine_entries_user_id_fkey(username, display_name, avatar_url),
        wine_entry_likes(id, user_id),
        wine_entry_comments(id, content, created_at, profiles(username, display_name, avatar_url))
      `)
      .eq('id', wineId)
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Wine not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user can view this wine
    if (!data.is_public && data.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add user-specific data
    const userLiked = data.wine_entry_likes?.some((like: any) => like.user_id === userId) || false
    
    const response = {
      ...data,
      like_count: data.wine_entry_likes?.length || 0,
      comment_count: data.wine_entry_comments?.length || 0,
      user_liked: userLiked,
      comments: data.wine_entry_comments || []
    }

    return new Response(
      JSON.stringify({ wine: response }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } else if (req.method === 'PUT') {
    // Update wine entry (only owner can update)
    const updateData: Partial<WineEntry> = await req.json()
    
    const { data, error } = await supabase
      .from('wine_entries')
      .update(updateData)
      .eq('id', wineId)
      .eq('user_id', userId) // Ensure only owner can update
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ wine: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } else if (req.method === 'DELETE') {
    // Delete wine entry (only owner can delete)
    const { error } = await supabase
      .from('wine_entries')
      .delete()
      .eq('id', wineId)
      .eq('user_id', userId)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Wine deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleWineSearch(req: Request, supabase: any, userId: string) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const filters: SearchFilters = {
    region: url.searchParams.get('region') || undefined,
    country: url.searchParams.get('country') || undefined,
    grape_varieties: url.searchParams.get('grape_varieties')?.split(',') || undefined,
    quality_min: url.searchParams.get('quality_min') || undefined,
    quality_max: url.searchParams.get('quality_max') || undefined,
    vintage_min: url.searchParams.get('vintage_min') ? parseInt(url.searchParams.get('vintage_min')!) : undefined,
    vintage_max: url.searchParams.get('vintage_max') ? parseInt(url.searchParams.get('vintage_max')!) : undefined,
    limit: parseInt(url.searchParams.get('limit') || '20'),
    offset: parseInt(url.searchParams.get('offset') || '0'),
    sort_by: (url.searchParams.get('sort_by') as any) || 'created_at',
    sort_order: (url.searchParams.get('sort_order') as any) || 'desc',
    is_public: url.searchParams.get('public') === 'true' || undefined
  }

  const query = url.searchParams.get('q') || ''

  let dbQuery = supabase
    .from('wine_entries')
    .select(`
      *,
      profiles!wine_entries_user_id_fkey(username, display_name, avatar_url),
      wine_entry_likes(id),
      wine_entry_comments(id)
    `)

  // Apply filters
  if (filters.is_public) {
    dbQuery = dbQuery.eq('is_public', true)
  } else {
    dbQuery = dbQuery.eq('user_id', userId)
  }

  if (filters.region) {
    dbQuery = dbQuery.ilike('region', `%${filters.region}%`)
  }

  if (filters.country) {
    dbQuery = dbQuery.ilike('country', `%${filters.country}%`)
  }

  if (filters.vintage_min) {
    dbQuery = dbQuery.gte('vintage', filters.vintage_min)
  }

  if (filters.vintage_max) {
    dbQuery = dbQuery.lte('vintage', filters.vintage_max)
  }

  if (query) {
    dbQuery = dbQuery.or(`wine_name.ilike.%${query}%,producer.ilike.%${query}%,notes.ilike.%${query}%`)
  }

  // Apply sorting and pagination
  const ascending = filters.sort_order === 'asc'
  dbQuery = dbQuery
    .order(filters.sort_by!, { ascending })
    .range(filters.offset!, filters.offset! + filters.limit! - 1)

  const { data, error } = await dbQuery

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const wines = data.map(wine => ({
    ...wine,
    like_count: wine.wine_entry_likes?.length || 0,
    comment_count: wine.wine_entry_comments?.length || 0,
    wine_entry_likes: undefined,
    wine_entry_comments: undefined
  }))

  return new Response(
    JSON.stringify({ wines, filters }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSocialFeed(req: Request, supabase: any, userId: string) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  // Get activity feed for user and people they follow
  const { data, error } = await supabase
    .from('activity_feed')
    .select(`
      *,
      profiles!activity_feed_user_id_fkey(username, display_name, avatar_url),
      target_user:profiles!activity_feed_target_user_id_fkey(username, display_name, avatar_url)
    `)
    .or(`user_id.eq.${userId},user_id.in.(select following_id from user_follows where follower_id = '${userId}')`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ activities: data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}