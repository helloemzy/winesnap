'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { LoadingScreen } from '@/components/ui/loading'

interface AuthProviderProps {
  children: React.ReactNode
}

const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/callback',
  '/about',
  '/privacy',
  '/terms',
]

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    user,
    session,
    loading,
    initialized,
    setUser,
    setProfile,
    setSession,
    setLoading,
    setInitialized,
    reset,
  } = useAuthStore()
  const { addToast } = useUIStore()

  const supabase = createSupabaseClient()

  // Initialize auth state
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession()

        if (sessionError) {
          console.error('Error getting session:', sessionError)
          reset()
          return
        }

        if (initialSession?.user) {
          setUser(initialSession.user)
          setSession(initialSession)

          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
            
            // If profile doesn't exist, create one
            if (profileError.code === 'PGRST116') {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: initialSession.user.id,
                  email: initialSession.user.email!,
                  username: initialSession.user.email?.split('@')[0] || null,
                  full_name: initialSession.user.user_metadata?.full_name || null,
                  avatar_url: initialSession.user.user_metadata?.avatar_url || null,
                })
                .select()
                .single()

              if (createError) {
                console.error('Error creating profile:', createError)
              } else {
                setProfile(newProfile)
              }
            }
          } else {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        reset()
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()
  }, [supabase, setUser, setProfile, setSession, setLoading, setInitialized, reset])

  // Listen for auth changes
  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)

      setLoading(true)

      try {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          setSession(session)

          // Fetch profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
          } else {
            setProfile(profile)
          }

          addToast({
            type: 'success',
            title: 'Signed In',
            description: 'Welcome back to WineSnap!',
          })

          // Redirect to dashboard if on auth pages
          if (pathname.startsWith('/auth')) {
            router.push('/dashboard')
          }
        } else if (event === 'SIGNED_OUT') {
          reset()
          addToast({
            type: 'info',
            title: 'Signed Out',
            description: 'You have been signed out successfully.',
          })
          router.push('/')
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session)
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [
    supabase,
    pathname,
    router,
    setUser,
    setProfile,
    setSession,
    setLoading,
    reset,
    addToast,
  ])

  // Handle route protection
  React.useEffect(() => {
    if (!initialized || loading) return

    const isPublicPath = publicPaths.some(path => 
      path === pathname || (path !== '/' && pathname.startsWith(path))
    )

    if (!user && !isPublicPath) {
      router.push('/auth/signin')
    } else if (user && pathname.startsWith('/auth')) {
      router.push('/dashboard')
    }
  }, [user, pathname, router, initialized, loading])

  // Show loading screen while initializing
  if (!initialized || loading) {
    return <LoadingScreen message="Initializing WineSnap..." />
  }

  return <>{children}</>
}