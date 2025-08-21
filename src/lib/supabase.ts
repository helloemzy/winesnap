import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Client-side Supabase client
export const createSupabaseClient = () => {
  validateSupabaseConfig()
  return createClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey
  )
}

// Admin client for server actions
export const createSupabaseAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set')
    return null
  }
  
  return createClient<Database>(
    supabaseConfig.url,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Configuration constants
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
}

// Validate environment variables at runtime (not build time)
export const validateSupabaseConfig = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables - some features may not work')
    return false
  }
  return true
}

// Default client instance for compatibility
export const supabase = createSupabaseClient()