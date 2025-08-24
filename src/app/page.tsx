'use client'

import { useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // If user is already logged in, redirect to capture page
        router.replace('/capture')
      }
    }
    
    checkAuth()
  }, [router, supabase])

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #581c87, #312e81, #581c87)', 
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🍷 WineSnap
        </h1>
        
        <p style={{ fontSize: '2rem', marginBottom: '1rem', color: '#c4b5fd' }}>
          Gotta Taste 'Em All!
        </p>
        
        <p style={{ fontSize: '1.25rem', marginBottom: '3rem', color: '#ddd6fe', lineHeight: '1.6' }}>
          Transform wine discovery into an addictive gaming experience. 
          Collect wines like Pokemon and become the ultimate wine master!
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/auth/signin" 
            style={{ 
              background: 'linear-gradient(to right, #facc15, #f97316)', 
              color: 'black', 
              fontWeight: 'bold', 
              padding: '0.75rem 2rem', 
              fontSize: '1.125rem', 
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            🎮 Start Your Journey
          </a>
          <a 
            href="/capture" 
            style={{ 
              border: '2px solid white', 
              color: 'white', 
              padding: '0.75rem 2rem', 
              fontSize: '1.125rem', 
              fontWeight: '600',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            📸 Try Demo
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '3rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fcd34d' }}>1</div>
            <div style={{ fontSize: '0.875rem', color: '#c4b5fd' }}>Player Level</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#86efac' }}>0</div>
            <div style={{ fontSize: '0.875rem', color: '#c4b5fd' }}>Wines Caught</div>
          </div>
        </div>
      </div>
    </div>
  )
}