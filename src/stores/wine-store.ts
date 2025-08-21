import { create } from 'zustand'
import { WineTastingWithDetails, Collection, CollectionWithTastings } from '@/types/wine'
import { createSupabaseClient } from '@/lib/supabase'

interface WineState {
  tastings: WineTastingWithDetails[]
  currentTasting: WineTastingWithDetails | null
  collections: CollectionWithTastings[]
  favorites: WineTastingWithDetails[]
  loading: boolean
  searchQuery: string
  filters: TastingFilters
}

interface TastingFilters {
  wine_style?: string
  country?: string
  region?: string
  vintage_from?: number
  vintage_to?: number
  quality_from?: number
  quality_to?: number
  tags?: string[]
  is_public?: boolean
}

interface WineActions {
  // Tastings
  fetchTastings: (filters?: TastingFilters) => Promise<void>
  fetchTastingById: (id: string) => Promise<void>
  createTasting: (tasting: Omit<WineTastingWithDetails, 'id' | 'created_at' | 'updated_at'>) => Promise<WineTastingWithDetails>
  updateTasting: (id: string, updates: Partial<WineTastingWithDetails>) => Promise<void>
  deleteTasting: (id: string) => Promise<void>
  
  // Interactions
  likeTasting: (id: string) => Promise<void>
  unlikeTasting: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  
  // Collections
  fetchCollections: () => Promise<void>
  createCollection: (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) => Promise<Collection>
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  addToCollection: (collectionId: string, tastingId: string) => Promise<void>
  removeFromCollection: (collectionId: string, tastingId: string) => Promise<void>
  
  // Search & Filters
  setSearchQuery: (query: string) => void
  setFilters: (filters: TastingFilters) => void
  clearFilters: () => void
  
  // State management
  setLoading: (loading: boolean) => void
  reset: () => void
}

type WineStore = WineState & WineActions

export const useWineStore = create<WineStore>((set, get) => ({
  // State
  tastings: [],
  currentTasting: null,
  collections: [],
  favorites: [],
  loading: false,
  searchQuery: '',
  filters: {},

  // Tastings
  fetchTastings: async (filters) => {
    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      let query = supabase
        .from('wine_tastings')
        .select(`
          *,
          profiles (id, username, full_name, avatar_url),
          tasting_likes (id),
          tasting_comments (id, content, created_at, profiles (id, username, full_name, avatar_url))
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.wine_style) {
        query = query.eq('wine_style', filters.wine_style)
      }
      if (filters?.country) {
        query = query.eq('country', filters.country)
      }
      if (filters?.region) {
        query = query.eq('region', filters.region)
      }
      if (filters?.vintage_from) {
        query = query.gte('vintage', filters.vintage_from)
      }
      if (filters?.vintage_to) {
        query = query.lte('vintage', filters.vintage_to)
      }
      if (filters?.quality_from) {
        query = query.gte('quality_level', filters.quality_from)
      }
      if (filters?.quality_to) {
        query = query.lte('quality_level', filters.quality_to)
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public)
      }

      const { data, error } = await query

      if (error) throw error

      const tastingsWithDetails = data?.map((tasting) => ({
        ...tasting,
        likes_count: tasting.tasting_likes?.length || 0,
        comments_count: tasting.tasting_comments?.length || 0,
        is_liked: false, // Will be determined by checking user's likes
      })) || []

      set({ tastings: tastingsWithDetails, loading: false })
    } catch (error) {
      console.error('Error fetching tastings:', error)
      set({ loading: false })
      throw error
    }
  },

  fetchTastingById: async (id) => {
    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('wine_tastings')
        .select(`
          *,
          profiles (id, username, full_name, avatar_url),
          tasting_likes (id, user_id),
          tasting_comments (
            id, content, created_at,
            profiles (id, username, full_name, avatar_url)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const tastingWithDetails = {
        ...data,
        likes_count: data.tasting_likes?.length || 0,
        comments_count: data.tasting_comments?.length || 0,
        is_liked: false, // Will be determined by checking user's likes
      }

      set({ currentTasting: tastingWithDetails, loading: false })
    } catch (error) {
      console.error('Error fetching tasting:', error)
      set({ loading: false })
      throw error
    }
  },

  createTasting: async (tasting) => {
    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('wine_tastings')
        .insert(tasting)
        .select(`
          *,
          profiles (id, username, full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      const newTasting = {
        ...data,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
      }

      set((state) => ({
        tastings: [newTasting, ...state.tastings],
        loading: false,
      }))

      return newTasting
    } catch (error) {
      console.error('Error creating tasting:', error)
      set({ loading: false })
      throw error
    }
  },

  updateTasting: async (id, updates) => {
    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('wine_tastings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          profiles (id, username, full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      const updatedTasting = {
        ...data,
        likes_count: 0, // This should be fetched properly
        comments_count: 0, // This should be fetched properly
        is_liked: false,
      }

      set((state) => ({
        tastings: state.tastings.map((t) => 
          t.id === id ? updatedTasting : t
        ),
        currentTasting: state.currentTasting?.id === id ? updatedTasting : state.currentTasting,
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating tasting:', error)
      set({ loading: false })
      throw error
    }
  },

  deleteTasting: async (id) => {
    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      const { error } = await supabase
        .from('wine_tastings')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        tastings: state.tastings.filter((t) => t.id !== id),
        currentTasting: state.currentTasting?.id === id ? null : state.currentTasting,
        loading: false,
      }))
    } catch (error) {
      console.error('Error deleting tasting:', error)
      set({ loading: false })
      throw error
    }
  },

  // Social interactions
  likeTasting: async (id) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('tasting_likes')
        .insert({ user_id: user.id, tasting_id: id })

      if (error) throw error

      set((state) => ({
        tastings: state.tastings.map((t) =>
          t.id === id
            ? { ...t, likes_count: (t.likes_count || 0) + 1, is_liked: true }
            : t
        ),
        currentTasting: state.currentTasting?.id === id
          ? { ...state.currentTasting, likes_count: (state.currentTasting.likes_count || 0) + 1, is_liked: true }
          : state.currentTasting,
      }))
    } catch (error) {
      console.error('Error liking tasting:', error)
      throw error
    }
  },

  unlikeTasting: async (id) => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('tasting_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('tasting_id', id)

      if (error) throw error

      set((state) => ({
        tastings: state.tastings.map((t) =>
          t.id === id
            ? { ...t, likes_count: Math.max((t.likes_count || 0) - 1, 0), is_liked: false }
            : t
        ),
        currentTasting: state.currentTasting?.id === id
          ? { ...state.currentTasting, likes_count: Math.max((state.currentTasting.likes_count || 0) - 1, 0), is_liked: false }
          : state.currentTasting,
      }))
    } catch (error) {
      console.error('Error unliking tasting:', error)
      throw error
    }
  },

  toggleFavorite: async (id) => {
    set((state) => ({
      tastings: state.tastings.map((t) =>
        t.id === id ? { ...t, is_favorite: !t.is_favorite } : t
      ),
    }))

    const supabase = createSupabaseClient()
    const tasting = get().tastings.find((t) => t.id === id)

    try {
      const { error } = await supabase
        .from('wine_tastings')
        .update({ is_favorite: tasting?.is_favorite })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Revert optimistic update
      set((state) => ({
        tastings: state.tastings.map((t) =>
          t.id === id ? { ...t, is_favorite: !t.is_favorite } : t
        ),
      }))
      throw error
    }
  },

  // Collections - simplified for now
  fetchCollections: async () => {
    set({ collections: [] })
  },

  createCollection: async (collection) => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('collections')
      .insert(collection)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateCollection: async (id, updates) => {},
  deleteCollection: async (id) => {},
  addToCollection: async (collectionId, tastingId) => {},
  removeFromCollection: async (collectionId, tastingId) => {},

  // Search & Filters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  // State management
  setLoading: (loading) => set({ loading }),
  reset: () => set({
    tastings: [],
    currentTasting: null,
    collections: [],
    favorites: [],
    loading: false,
    searchQuery: '',
    filters: {},
  }),
}))

// Helper hooks
export const useTastings = () => useWineStore((state) => state.tastings)
export const useCurrentTasting = () => useWineStore((state) => state.currentTasting)
export const useWineLoading = () => useWineStore((state) => state.loading)