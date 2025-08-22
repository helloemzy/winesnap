import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Environment detection
const getAppEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development'
  return env as 'development' | 'staging' | 'production'
}

// Configuration constants with environment-aware selection
export const supabaseConfig = {
  url: (() => {
    const env = getAppEnvironment()
    switch (env) {
      case 'staging':
        return process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
      case 'production':
        return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
      default:
        return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    }
  })(),
  anonKey: (() => {
    const env = getAppEnvironment()
    switch (env) {
      case 'staging':
        return process.env.NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
      case 'production':
        return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
      default:
        return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    }
  })(),
  environment: getAppEnvironment(),
  schema: process.env.NEXT_PUBLIC_DATABASE_SCHEMA || 'public',
}

// Validate environment variables at runtime (not build time)
export const validateSupabaseConfig = () => {
  const env = getAppEnvironment()
  let missingVars = []
  
  if (supabaseConfig.url === 'https://placeholder.supabase.co') {
    missingVars.push(`NEXT_PUBLIC${env === 'staging' ? '_STAGING' : ''}_SUPABASE_URL`)
  }
  
  if (supabaseConfig.anonKey === 'placeholder-key') {
    missingVars.push(`NEXT_PUBLIC${env === 'staging' ? '_STAGING' : ''}_SUPABASE_ANON_KEY`)
  }
  
  if (missingVars.length > 0) {
    console.warn(`Missing Supabase environment variables for ${env}: ${missingVars.join(', ')}`)
    return false
  }
  
  console.info(`Supabase configured for ${env} environment`)
  return true
}

// Singleton client instance to prevent multiple instances
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null

// Client-side Supabase client (singleton)
export const createSupabaseClient = () => {
  if (_supabaseClient) {
    return _supabaseClient
  }

  validateSupabaseConfig()
  _supabaseClient = createClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: {
        storageKey: 'winesnap-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  )
  
  return _supabaseClient
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

// Default client instance for compatibility
export const supabase = createSupabaseClient()