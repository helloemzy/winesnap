import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createSupabaseClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=callback_error`)
      }
      
      if (data.session) {
        console.log('Auth successful, user:', data.user?.email)
        // Redirect directly to capture page instead of dashboard
        return NextResponse.redirect(`${requestUrl.origin}/capture`)
      }
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=callback_error`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/capture`)
}