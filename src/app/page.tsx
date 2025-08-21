import Link from 'next/link'
import { Wine, Camera, Users, TrendingUp, Mic, Zap, Shield, Database } from 'lucide-react'
import VoiceRecorder from '@/components/VoiceRecorder'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 px-4 py-16">
        <div className="container mx-auto max-w-6xl text-center text-white">
          <div className="mb-8 flex justify-center">
            <Wine className="h-16 w-16 text-white" />
          </div>
          
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            WineSnap
          </h1>
          
          <p className="mb-8 text-xl sm:text-2xl text-blue-100">
            Voice-Powered Wine Tasting Journal with AI-Driven WSET Level 3 Analysis
          </p>
          
          <p className="mb-12 text-lg text-blue-100 max-w-4xl mx-auto">
            Transform your 30-second voice recordings into professional WSET tasting notes 
            using advanced AI technology. Web Speech API + OpenAI Whisper + GPT-4 WSET mapping.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm font-medium">🎤 Voice Processing Pipeline</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm font-medium">🍷 WSET Level 3 Structure</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm font-medium">💰 Cost-Optimized ($30/month)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-100">
            <div>✓ Web Speech API</div>
            <div>✓ OpenAI Whisper</div>
            <div>✓ GPT-4 Mapping</div>
            <div>✓ Real-time Social</div>
          </div>
        </div>
      </section>

      {/* Voice Processing Demo */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto max-w-4xl text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Try the Voice Processing System
          </h2>
          <p className="text-xl text-gray-600">
            Record a 30-second wine tasting note and watch it transform into structured WSET Level 3 format
          </p>
        </div>
        <VoiceRecorder />
      </section>

      {/* Technical Features */}
      <section className="bg-white px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Production-Ready Voice Processing Architecture
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="mb-4 flex justify-center">
                <Mic className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Smart Voice Processing</h3>
              <p className="text-gray-600 text-sm">
                Web Speech API primary with OpenAI Whisper fallback for complex audio scenarios
              </p>
            </div>
            
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="mb-4 flex justify-center">
                <Zap className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">WSET AI Mapping</h3>
              <p className="text-gray-600 text-sm">
                GPT-4 powered structured output mapping voice notes to WSET Level 3 format
              </p>
            </div>
            
            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="mb-4 flex justify-center">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Real-time Social</h3>
              <p className="text-gray-600 text-sm">
                Supabase real-time subscriptions for activity feeds, comments, and wine sharing
              </p>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6">
              <div className="mb-4 flex justify-center">
                <Shield className="h-12 w-12 text-amber-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Cost Optimization</h3>
              <p className="text-gray-600 text-sm">
                Smart caching, usage limits, and cost tracking to maintain $30/month budget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Details */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Backend Architecture */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Backend Infrastructure</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Complete Database Schema</h4>
                    <p className="text-gray-600 text-sm">
                      Full WSET Level 3 fields with social features, wine collections, user follows, 
                      comments, likes, and voice processing cache with RLS policies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Supabase Edge Functions</h4>
                    <p className="text-gray-600 text-sm">
                      Voice processing API, wine management, search and filtering, 
                      social feed generation with built-in authentication.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">File Storage & Security</h4>
                    <p className="text-gray-600 text-sm">
                      Optimized photo and audio uploads with compression, CDN delivery, 
                      and secure user-based access controls.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Integration */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">AI Processing Pipeline</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Multi-Modal Voice Processing</h4>
                    <p className="text-gray-600 text-sm">
                      Browser Web Speech API for real-time transcription with OpenAI Whisper 
                      as intelligent fallback for complex audio scenarios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Wine className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">WSET Level 3 Mapping</h4>
                    <p className="text-gray-600 text-sm">
                      GPT-4 powered natural language processing with validated JSON output, 
                      wine terminology recognition, and confidence scoring.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cost & Performance Optimization</h4>
                    <p className="text-gray-600 text-sm">
                      Intelligent caching with audio hash matching, usage tracking, 
                      cost limits, and performance monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Wine Tasting Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of wine journaling with AI-powered WSET analysis
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Get Started Free
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}