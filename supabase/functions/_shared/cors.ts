// Shared CORS headers for Supabase Edge Functions

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Consider restricting to specific domains in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  'Access-Control-Allow-Credentials': 'false', // Explicitly disable credentials
}

// Security headers for Edge Functions
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}