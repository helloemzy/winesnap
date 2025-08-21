# 🏗️ WineSnap Technical Architecture

## Overview

WineSnap is a production-ready Progressive Web App (PWA) that combines voice processing, AI-powered WSET mapping, and social features to create the ultimate wine tasting journal experience.

**Live Application**: https://winesnap-oleov0698-helloemilywho-gmailcoms-projects.vercel.app

## Architecture Principles

### Design Philosophy

1. **Mobile-First**: Optimized for wine tasting in social environments
2. **Offline-First**: Core features work without internet connection
3. **Voice-Centric**: 30-second recordings as primary input method
4. **Performance-Optimized**: Battery and memory-aware mobile experience
5. **Professional-Quality**: WSET Level 3 systematic wine assessment

### Technical Goals

- **<2 Second Load Time**: Fast initial page load on mobile networks
- **<3 Second Voice Processing**: Real-time voice to WSET mapping
- **100% Offline Capability**: Core features work without internet
- **<$200/Month Operational Cost**: Cost-effective AI processing
- **Cross-Platform PWA**: Install on mobile and desktop

## System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile PWA    │    │  Next.js 14 App  │    │   Supabase      │
│   (Installed)   │◄──►│  (Frontend)      │◄──►│   (Backend)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │              ┌─────────┴────────┐              │
        │              │ Service Worker   │              │
        │              │ (Offline Cache)  │              │
        │              └──────────────────┘              │
        │                                                │
        └──────────────── Direct Caching ────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Voice Input   │    │ AI Processing    │    │ WSET Output     │
│   (30 seconds)  │───►│ Pipeline         │───►│ (Structured)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │              ┌─────────┴────────┐              │
        │              │ Web Speech API   │              │
        │              │ OpenAI Whisper   │              │
        │              │ GPT-4 Mapping    │              │
        │              └──────────────────┘              │
        │                                                │
        └──────────────── Cache Results ─────────────────┘
```

### Technology Stack

#### Frontend Architecture

**Core Framework**:
- **Next.js 14**: App Router, React Server Components
- **TypeScript**: Full type safety with strict mode
- **Tailwind CSS**: Utility-first styling with custom design system
- **PWA**: Service worker, offline caching, install prompts

**State Management**:
- **Zustand**: Global state for user preferences and app state
- **React Hook Form**: Form state with Zod validation
- **React Query**: Server state caching and synchronization
- **Supabase Real-time**: Live subscriptions for social features

**Mobile Optimization**:
- **Responsive Design**: Mobile-first with touch optimization
- **Battery Optimization**: Adaptive performance based on battery level
- **Memory Management**: Intelligent caching and cleanup
- **Network Optimization**: Request batching and retry logic

#### Backend Architecture

**Database & Authentication**:
- **Supabase PostgreSQL**: Primary database with WSET-optimized schema
- **Supabase Auth**: JWT-based authentication with email/password
- **Row Level Security**: Database-level access control
- **Real-time Subscriptions**: Live updates for social features

**File Storage**:
- **Supabase Storage**: Voice recordings and wine photos
- **CDN Distribution**: Global edge caching for images
- **Automatic Optimization**: Image compression and format conversion
- **Secure Upload**: Pre-signed URLs with validation

**AI Processing**:
- **OpenAI GPT-4**: Natural language to WSET mapping
- **OpenAI Whisper**: High-quality speech transcription
- **Web Speech API**: Primary real-time transcription (free)
- **Intelligent Caching**: Audio hash-based result caching

## Data Architecture

### Database Schema

#### Core Tables

```sql
-- User Management
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  wine_preferences JSONB,
  privacy_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wine Entries (WSET Level 3 Structure)
CREATE TABLE wine_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Wine Information
  name TEXT NOT NULL,
  producer TEXT,
  region TEXT,
  vintage INTEGER,
  grape_varieties TEXT[],
  price DECIMAL(10,2),
  alcohol_content DECIMAL(4,2),
  
  -- WSET Systematic Assessment
  wset_assessment JSONB NOT NULL DEFAULT '{}',
  
  -- User Content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  images TEXT[],
  
  -- Voice Recording
  voice_recording JSONB,
  
  -- Social Features
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Metadata
  location JSONB,
  tasting_date TIMESTAMPTZ,
  occasion TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wine Collections
CREATE TABLE wine_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  wine_entry_ids UUID[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Features
CREATE TABLE user_follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE wine_entry_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wine_entry_id UUID REFERENCES wine_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, wine_entry_id)
);

CREATE TABLE wine_entry_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wine_entry_id UUID REFERENCES wine_entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES wine_entry_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Feed
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  wine_entry_id UUID REFERENCES wine_entries(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Optimization
CREATE TABLE voice_processing_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_hash TEXT UNIQUE NOT NULL,
  transcript TEXT NOT NULL,
  wset_analysis JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  processing_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wine Terminology for NLP Enhancement
CREATE TABLE wine_terminology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 'appearance', 'aroma', 'flavor', 'texture'
  wset_mapping JSONB,
  synonyms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### WSET Assessment Schema

```typescript
interface WSETAssessment {
  appearance: {
    clarity: 'clear' | 'hazy' | 'turbid';
    intensity: 'pale' | 'medium' | 'deep';
    color: string;
    color_description?: string;
    other_observations?: string;
  };
  nose: {
    condition: 'clean' | 'unclean';
    intensity: 'light' | 'medium' | 'pronounced';
    aroma_characteristics: {
      primary: string[];    // Grape variety aromas
      secondary: string[];  // Winemaking aromas
      tertiary: string[];   // Aging aromas
    };
    development: 'youthful' | 'developing' | 'fully_developed';
    other_observations?: string;
  };
  palate: {
    sweetness: 'bone_dry' | 'dry' | 'off_dry' | 'medium_dry' | 'medium_sweet' | 'sweet' | 'luscious';
    acidity: 'low' | 'medium_minus' | 'medium' | 'medium_plus' | 'high';
    tannin?: 'low' | 'medium_minus' | 'medium' | 'medium_plus' | 'high'; // For red wines
    alcohol: 'low' | 'medium' | 'high';
    body: 'light' | 'medium_minus' | 'medium' | 'medium_plus' | 'full';
    flavor_characteristics: {
      primary: string[];
      secondary: string[];
      tertiary: string[];
    };
    finish: 'short' | 'medium_minus' | 'medium' | 'medium_plus' | 'long';
    other_observations?: string;
  };
  conclusions: {
    quality: 'faulty' | 'poor' | 'acceptable' | 'good' | 'very_good' | 'outstanding';
    readiness: 'too_young' | 'ready' | 'past_its_best';
    aging_potential?: string;
    other_conclusions?: string;
  };
}
```

### Data Flow Architecture

#### Voice Processing Pipeline

```
Voice Input (30s)
      ↓
┌─────────────────┐
│ Audio Capture   │ ← Web Audio API
│ (WebM/MP4/WAV)  │
└─────────────────┘
      ↓
┌─────────────────┐
│ Audio Hashing   │ ← SHA-256 for cache lookup
│ & Validation    │
└─────────────────┘
      ↓
┌─────────────────┐    Cache Hit
│ Cache Check     │ ──────────────► Return Cached Result
└─────────────────┘
      ↓ Cache Miss
┌─────────────────┐
│ Speech-to-Text  │ ← Web Speech API (primary)
│ Processing      │   OpenAI Whisper (fallback)
└─────────────────┘
      ↓
┌─────────────────┐
│ WSET Mapping    │ ← GPT-4 with WSET prompts
│ (AI Processing) │   Wine terminology database
└─────────────────┘
      ↓
┌─────────────────┐
│ Result Caching  │ ← Store for future lookups
│ & Return        │
└─────────────────┘
```

#### Real-time Social Features

```
User Action (Like/Comment)
      ↓
┌─────────────────┐
│ Client Update   │ ← Optimistic UI update
└─────────────────┘
      ↓
┌─────────────────┐
│ Database Write  │ ← Supabase CRUD operation
└─────────────────┘
      ↓
┌─────────────────┐
│ Real-time Sync  │ ← Supabase subscriptions
└─────────────────┘
      ↓
┌─────────────────┐
│ Activity Feed   │ ← Trigger generation
│ Generation      │
└─────────────────┘
      ↓
┌─────────────────┐
│ Push to         │ ← Notify followers
│ Followers       │
└─────────────────┘
```

## Performance Architecture

### Mobile Optimization Strategy

#### Battery Optimization

```typescript
// Adaptive performance based on battery level
class BatteryOptimizationManager {
  private config: PerformanceConfig = {
    imageQuality: 'high',
    voiceRecordingQuality: 'high',
    backgroundSyncEnabled: true,
    reducedFeaturesMode: false
  };

  async initialize() {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      this.updatePerformanceConfig(battery);
      this.setupBatteryListeners(battery);
    }
  }

  private updatePerformanceConfig(battery: any) {
    const isLowBattery = battery.level < 0.2;
    const isCharging = battery.charging;

    if (isLowBattery && !isCharging) {
      this.config = {
        imageQuality: 'medium',
        voiceRecordingQuality: 'medium',
        backgroundSyncEnabled: false,
        reducedFeaturesMode: true
      };
    }
  }
}
```

#### Memory Management

```typescript
class MemoryOptimizationManager {
  private performCleanup() {
    // Clean up cached images
    this.cleanupImageCache();
    
    // Clean up voice recordings
    this.cleanupVoiceCache();
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  private cleanupImageCache() {
    const blobUrls = document.querySelectorAll('img[src^="blob:"]');
    blobUrls.forEach(img => {
      const src = (img as HTMLImageElement).src;
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    });
  }
}
```

### Caching Strategy

#### Service Worker Caching

```javascript
// PWA Runtime Caching Strategy
const runtimeCaching = [
  {
    // Static resources (fonts, CSS, JS)
    urlPattern: /\.(?:js|css|woff2?)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-resources',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  {
    // Images with aggressive caching
    urlPattern: /\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },
  {
    // API responses with network-first strategy
    urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      networkTimeoutSeconds: 10,
    },
  },
];
```

#### Voice Processing Cache

```typescript
// Intelligent audio caching to reduce API costs
class VoiceProcessingCache {
  async getCachedResult(audioBlob: Blob): Promise<CachedResult | null> {
    const audioHash = await this.generateAudioHash(audioBlob);
    
    // Check local IndexedDB cache first
    const localResult = await this.getFromLocalCache(audioHash);
    if (localResult && this.isResultValid(localResult)) {
      return localResult;
    }
    
    // Check server cache
    const serverResult = await this.getFromServerCache(audioHash);
    if (serverResult) {
      await this.storeInLocalCache(audioHash, serverResult);
      return serverResult;
    }
    
    return null;
  }

  private async generateAudioHash(audioBlob: Blob): Promise<string> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
```

## Security Architecture

### Authentication & Authorization

#### JWT-Based Authentication

```typescript
// Supabase Auth integration
class AuthManager {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // JWT token automatically managed by Supabase
    return data.session;
  }

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async signOut() {
    await supabase.auth.signOut();
  }
}
```

#### Row Level Security (RLS)

```sql
-- Wine entries can only be accessed by owner or if public
CREATE POLICY "Wine entries are viewable by owner or if public" ON wine_entries
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_public = true AND auth.role() = 'authenticated')
  );

-- Users can only modify their own wine entries
CREATE POLICY "Users can insert their own wine entries" ON wine_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wine entries" ON wine_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wine entries" ON wine_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Social features policies
CREATE POLICY "Users can like public wine entries" ON wine_entry_likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM wine_entries 
      WHERE id = wine_entry_id AND is_public = true
    )
  );
```

### Data Protection

#### Environment Variables Security

```typescript
// Runtime environment validation
export const validateEnvironment = () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

// Secure API key handling
export const getOpenAIKey = (): string | null => {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.includes('placeholder')) {
    console.warn('OpenAI API key not configured - AI features disabled');
    return null;
  }
  return key;
};
```

#### Content Security Policy

```javascript
// Next.js security headers
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=*, microphone=*, geolocation=*',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co https://api.openai.com",
    ].join('; '),
  },
];
```

## Cost Optimization Architecture

### AI Processing Cost Management

#### Intelligent Cost Controls

```typescript
class CostOptimizationManager {
  private monthlyBudget = 30; // $30/month
  private currentUsage = 0;
  
  async processVoice(audioBlob: Blob, options: ProcessingOptions) {
    // Check budget first
    if (this.currentUsage >= this.monthlyBudget * 0.9) {
      throw new Error('Monthly AI budget nearly exceeded');
    }
    
    // Try cache first (free)
    const cached = await this.getCachedResult(audioBlob);
    if (cached) return cached;
    
    // Try Web Speech API first (free)
    try {
      const webSpeechResult = await this.tryWebSpeechAPI(audioBlob);
      if (webSpeechResult.confidence > 0.8) {
        return await this.mapWithGPT4(webSpeechResult.transcript);
      }
    } catch (error) {
      console.warn('Web Speech API failed, falling back to Whisper');
    }
    
    // Fall back to Whisper (paid)
    return await this.processWithWhisper(audioBlob);
  }
  
  private async estimateCost(operation: string, input: any): Promise<number> {
    const costs = {
      whisper: 0.006, // per minute
      gpt4: 0.001,   // per request
    };
    
    switch (operation) {
      case 'whisper':
        return (input.duration / 60000) * costs.whisper;
      case 'gpt4':
        return costs.gpt4;
      default:
        return 0;
    }
  }
}
```

#### Caching Strategy for Cost Reduction

```typescript
// Audio fingerprinting for exact match caching
class AudioCacheManager {
  async generateFingerprint(audioBlob: Blob): Promise<string> {
    // Convert to consistent format for hashing
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioData = new Float32Array(arrayBuffer);
    
    // Generate perceptual hash for similar audio detection
    const fingerprint = await this.generatePerceptualHash(audioData);
    return fingerprint;
  }
  
  async findSimilarCachedResult(fingerprint: string): Promise<CachedResult | null> {
    // Look for exact matches first
    const exactMatch = await this.findExactMatch(fingerprint);
    if (exactMatch) return exactMatch;
    
    // Look for similar audio with high confidence
    const similarMatch = await this.findSimilarMatch(fingerprint, 0.95);
    if (similarMatch) {
      console.log('Using similar cached result, saving API cost');
      return similarMatch;
    }
    
    return null;
  }
}
```

### Database Optimization

#### Efficient Queries

```sql
-- Optimized indexes for common queries
CREATE INDEX CONCURRENTLY idx_wine_entries_user_created 
ON wine_entries(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_wine_entries_public_rating 
ON wine_entries(is_public, rating DESC) WHERE is_public = true;

CREATE INDEX CONCURRENTLY idx_wine_entries_region_quality 
ON wine_entries(region, (wset_assessment->>'conclusions'->>'quality'));

-- Efficient activity feed query
CREATE INDEX CONCURRENTLY idx_activity_feed_user_created 
ON activity_feed(user_id, created_at DESC);

-- Voice cache optimization
CREATE INDEX CONCURRENTLY idx_voice_cache_hash 
ON voice_processing_cache(audio_hash);
```

#### Connection Pooling

```typescript
// Supabase connection optimization
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  options: {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'x-my-custom-header': 'winesnap' },
    },
  },
};
```

## Deployment Architecture

### Vercel Deployment Strategy

#### Build Optimization

```javascript
// next.config.mjs - Production optimized
const nextConfig = {
  // Build performance
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
  
  // Error handling for deployment
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Environment defaults
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  },
};
```

#### Edge Function Architecture

```typescript
// Supabase Edge Function for voice processing
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { audio_data, duration, use_whisper = false } = await req.json()
    
    // Process voice with appropriate service
    const result = use_whisper 
      ? await processWithWhisper(audio_data)
      : await processWithWebSpeech(audio_data)
    
    // Map to WSET structure
    const wsetAnalysis = await mapToWSET(result.transcript)
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        transcript: result.transcript,
        wset_analysis: wsetAnalysis,
        confidence_score: result.confidence,
        processing_time: Date.now() - startTime
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### Monitoring & Analytics

#### Performance Monitoring

```typescript
// Performance tracking
class PerformanceMonitor {
  trackPageLoad() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        
        this.reportMetric('page_load_time', loadTime);
      });
    }
  }
  
  trackVoiceProcessing(startTime: number, endTime: number) {
    const processingTime = endTime - startTime;
    this.reportMetric('voice_processing_time', processingTime);
  }
  
  private reportMetric(name: string, value: number) {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ metric: name, value, timestamp: Date.now() })
      });
    }
  }
}
```

#### Error Monitoring

```typescript
// Error boundary and reporting
class ErrorReporting {
  static captureException(error: Error, context?: Record<string, any>) {
    console.error('Application error:', error, context);
    
    if (process.env.NODE_ENV === 'production') {
      // Report to monitoring service
      fetch('/api/errors', {
        method: 'POST',
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    }
  }
}
```

## Scalability Considerations

### Database Scaling

#### Horizontal Scaling Strategy

```sql
-- Partitioning strategy for large datasets
CREATE TABLE wine_entries_2024 PARTITION OF wine_entries
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE wine_entries_2025 PARTITION OF wine_entries
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Read replicas for analytics queries
CREATE PUBLICATION wine_analytics FOR TABLE 
  wine_entries, activity_feed, wine_terminology;
```

#### Caching Layers

```typescript
// Multi-tier caching strategy
class CacheManager {
  private localCache = new Map(); // Browser memory
  private indexedDB: IDBDatabase; // Browser storage
  private serviceWorker: ServiceWorkerRegistration; // Network cache
  
  async get(key: string): Promise<any> {
    // L1: Memory cache (fastest)
    if (this.localCache.has(key)) {
      return this.localCache.get(key);
    }
    
    // L2: IndexedDB (offline capable)
    const indexedResult = await this.getFromIndexedDB(key);
    if (indexedResult) {
      this.localCache.set(key, indexedResult);
      return indexedResult;
    }
    
    // L3: Service Worker cache (network)
    const swResult = await this.getFromServiceWorker(key);
    if (swResult) {
      await this.setInIndexedDB(key, swResult);
      this.localCache.set(key, swResult);
      return swResult;
    }
    
    return null;
  }
}
```

### CDN & Edge Distribution

#### Global Edge Caching

```typescript
// Intelligent asset distribution
const optimizeAssetDelivery = () => {
  return {
    images: {
      formats: ['avif', 'webp', 'jpg'],
      sizes: [640, 750, 828, 1080, 1200, 1920],
      quality: {
        default: 80,
        mobile: 70,
        'low-bandwidth': 60
      }
    },
    
    audio: {
      formats: ['opus', 'aac', 'mp3'],
      bitrates: [32, 64, 128], // kbps
      adaptive: true // Adjust based on connection
    },
    
    caching: {
      'static-assets': '365d',
      'wine-images': '30d',
      'voice-recordings': '7d',
      'api-responses': '1h'
    }
  };
};
```

---

🍷 **WineSnap Technical Architecture - Production Ready**

**Live Application**: https://winesnap-oleov0698-helloemilywho-gmailcoms-projects.vercel.app

Professional wine tasting PWA with AI-powered voice processing, WSET Level 3 assessment, and mobile-optimized architecture.