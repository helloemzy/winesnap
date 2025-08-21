# WineSnap - Voice-Powered Wine Tasting Journal

A production-ready wine tasting application that transforms 30-second voice recordings into professional WSET Level 3 tasting notes using advanced AI technology.

## 🎯 Overview

WineSnap combines voice processing, AI-driven WSET mapping, and social features to create the ultimate wine tasting journal experience. Record your voice, get structured WSET analysis, and share with the wine community.

## 🚀 Key Features

### 🎤 Advanced Voice Processing Pipeline
- **Web Speech API** - Primary real-time transcription (free)
- **OpenAI Whisper** - Intelligent fallback for complex audio scenarios
- **Smart Audio Handling** - 30-second recordings with automatic optimization
- **Cost-Optimized** - Maintains $30/month budget with intelligent caching

### 🍷 WSET Level 3 AI Analysis
- **GPT-4 Powered Mapping** - Natural language to structured WSET format
- **Complete WSET Structure** - Appearance, nose, palate, and conclusions
- **Wine Terminology Recognition** - Advanced NLP for wine descriptors
- **Confidence Scoring** - Quality assessment of AI mappings

### 👥 Real-Time Social Features
- **Activity Feeds** - Live updates with Supabase subscriptions
- **Wine Sharing** - Public/private wine entries with photos
- **Social Interactions** - Comments, likes, and user following
- **Collections** - Organize wines into custom collections

### 💾 Production Backend
- **Supabase Integration** - Complete database, auth, and real-time features
- **Edge Functions** - Serverless API with built-in security
- **File Storage** - Optimized photo and audio uploads with CDN
- **Row Level Security** - User-based access controls

## 🏗️ Architecture

### Database Schema
Complete WSET Level 3 implementation with social features:

```sql
-- Core Tables
- profiles (user management)
- wine_entries (complete WSET fields)
- wine_collections (user collections)
- user_follows (social connections)
- wine_entry_likes (social interactions)
- wine_entry_comments (discussions)
- activity_feed (real-time updates)
- voice_processing_cache (cost optimization)
- wine_terminology (NLP enhancement)
```

### API Layer
- **Voice Processing API** - `/supabase/functions/voice-process`
- **Wine Management API** - `/supabase/functions/wines-api`
- **Real-time Subscriptions** - Live activity feeds and notifications
- **File Upload Handling** - Optimized photo and audio processing

### Frontend Architecture
- **Next.js 14** with App Router
- **TypeScript** with complete type safety
- **Tailwind CSS** for responsive design
- **React Hooks** for state management
- **Real-time Components** with Supabase subscriptions

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions, Storage)
- **AI/ML**: OpenAI (Whisper, GPT-4), Web Speech API
- **Real-time**: Supabase Subscriptions
- **Deployment**: Vercel/Netlify compatible

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.55.0",
  "@hookform/resolvers": "^5.2.1",
  "react-hook-form": "^7.62.0",
  "zod": "^4.0.17",
  "zustand": "^5.0.8",
  "lucide-react": "^0.540.0"
}
```

## 📦 Installation & Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd winesnap
npm install
```

### 2. Environment Configuration
Create `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Voice Processing Configuration
NEXT_PUBLIC_MAX_RECORDING_DURATION=30000
NEXT_PUBLIC_VOICE_PROCESSING_ENABLED=true

# Storage Configuration
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=winesnap-media
```

### 3. Database Setup
Run the migration:
```bash
# Apply the database schema
supabase db push
```

Or manually execute `/supabase/migrations/20240101000000_initial_schema.sql`

### 4. Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎮 Usage

### Voice Recording Workflow
1. **Record**: Click the microphone to record 30-second voice note
2. **Process**: Voice → Text → WSET mapping via AI pipeline
3. **Review**: Edit wine details and WSET analysis
4. **Save**: Store as structured wine entry with social features

### WSET Level 3 Mapping
The AI system maps voice input to:
- **Appearance**: Intensity, color, clarity
- **Nose**: Condition, intensity, aroma characteristics, development
- **Palate**: Sweetness, acidity, tannin, alcohol, body, flavor, finish
- **Conclusions**: Quality assessment, readiness, aging potential

## 💰 Cost Optimization

### Smart Cost Management
- **Web Speech API** - Primary (free) transcription
- **Whisper Fallback** - Only when needed (~$0.006/minute)
- **GPT-4 Mapping** - Optimized prompts (~$0.001/request)
- **Intelligent Caching** - Audio hash matching to prevent duplicate processing
- **Usage Limits** - Configurable daily/monthly limits

### Monthly Budget: $30
- ~500 voice recordings with Whisper
- ~3000 WSET mappings with GPT-4
- Comprehensive caching reduces actual costs by 60-80%

## 📁 Project Structure

```
winesnap/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   │   └── VoiceRecorder.tsx  # Main voice recording component
│   ├── lib/
│   │   ├── api/               # Client-side API layer
│   │   ├── voice/             # Voice processing pipeline
│   │   ├── wset/              # WSET AI mapping
│   │   ├── storage/           # File upload utilities
│   │   ├── optimization/      # Cost management
│   │   ├── realtime/          # Supabase subscriptions
│   │   └── supabase.ts        # Supabase client
│   └── types/
│       ├── database.ts        # Database types
│       └── wset.ts            # WSET and voice types
├── supabase/
│   ├── functions/             # Edge Functions
│   │   ├── voice-process/     # Voice processing API
│   │   └── wines-api/         # Wine management API
│   └── migrations/            # Database schema
└── public/                    # Static assets
```

## 🔧 Key Components

### Voice Processing
```typescript
// Voice recording and processing
import { voiceProcessor } from '@/lib/voice/voice-processor'
import { useVoiceProcessing } from '@/lib/api/voice-api'

// Record and process voice
const { processVoice, isProcessing, result } = useVoiceProcessing()
```

### WSET Mapping
```typescript
// AI-powered WSET analysis
import { wsetMapper } from '@/lib/wset/wset-mapper'

// Map transcript to WSET structure
const wsetResult = await wsetMapper.mapTranscriptToWSET({
  transcript: "This wine has a deep ruby color...",
  context: { wineType: 'red' }
})
```

### Wine Management
```typescript
// Wine CRUD operations
import { wineApi } from '@/lib/api/wine-api'

// Create wine from voice processing
const wine = await wineApi.createWineFromVoice(voiceProcessingResult)
```

### Real-time Features
```typescript
// Live social updates
import { useActivityFeed } from '@/lib/realtime/subscriptions'

// Real-time activity feed
const { activities, loading } = useActivityFeed()
```

## 🚀 Deployment

### Environment Variables Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`

### Deploy to Vercel
The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📊 Performance Metrics

### Target Performance
- Voice processing: < 3 seconds end-to-end
- WSET mapping confidence: > 80%
- Cache hit rate: > 60%
- Monthly cost: < $30
- Real-time latency: < 100ms

## 🆘 Support

### Common Issues
- **Microphone permissions**: Check browser settings
- **Voice processing fails**: Verify OpenAI API key
- **Social features not loading**: Check Supabase configuration
- **Cost limits exceeded**: Review usage in dashboard

---

**WineSnap** - Transforming wine tasting through AI-powered voice processing and WSET Level 3 analysis.
