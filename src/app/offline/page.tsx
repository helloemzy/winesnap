import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline - WineSnap',
  description: 'You are currently offline. Please check your internet connection.',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <svg 
            className="w-24 h-24 mx-auto text-amber-700" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-amber-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-amber-700 mb-8">
          It looks like you're not connected to the internet. 
          Check your connection and try again.
        </p>
        
        <div className="space-y-4">
          <a 
            href="/"
            className="block w-full bg-amber-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-800 transition-colors text-center"
          >
            Try Again
          </a>
          
          <p className="text-sm text-amber-600">
            Some features may still be available offline.
          </p>
        </div>
      </div>
    </div>
  )
}