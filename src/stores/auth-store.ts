import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { Profile } from '@/types/wine'
import { createSupabaseClient } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  deleteAccount: () => Promise<void>
  reset: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,

  // Actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  signOut: async () => {
    const supabase = createSupabaseClient()
    set({ loading: true })
    
    try {
      await supabase.auth.signOut()
      set({
        user: null,
        profile: null,
        session: null,
        loading: false,
      })
    } catch (error) {
      console.error('Error signing out:', error)
      set({ loading: false })
      throw error
    }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return

    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      set({ profile, loading: false })
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ loading: false })
      throw error
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get()
    if (!user || !profile) return

    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      set({ profile: data, loading: false })
    } catch (error) {
      console.error('Error updating profile:', error)
      set({ loading: false })
      throw error
    }
  },

  deleteAccount: async () => {
    const { user } = get()
    if (!user) return

    const supabase = createSupabaseClient()
    set({ loading: true })

    try {
      // Delete user data first (this should cascade in the database)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) throw profileError

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      if (authError) throw authError

      set({
        user: null,
        profile: null,
        session: null,
        loading: false,
      })
    } catch (error) {
      console.error('Error deleting account:', error)
      set({ loading: false })
      throw error
    }
  },

  reset: () => set({
    user: null,
    profile: null,
    session: null,
    loading: false,
    initialized: false,
  }),
}))

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user)
export const useProfile = () => useAuthStore((state) => state.profile)
export const useSession = () => useAuthStore((state) => state.session)
export const useAuthLoading = () => useAuthStore((state) => state.loading)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user)