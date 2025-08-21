# 🛠️ WineSnap Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd winesnap
   npm install
   ```

2. **Environment Configuration (Optional)**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your keys:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   ```

   **Note**: App works with placeholder values for UI testing.

3. **Start Development**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

## Architecture Overview

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + CSS-in-JS
- **State**: Zustand for global state, React Hook Form for forms
- **TypeScript**: Full type safety with Zod validation
- **PWA**: Next PWA with service worker caching

### Backend Stack
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase subscriptions
- **File Storage**: Supabase Storage
- **Edge Functions**: Voice processing and API endpoints

### Key Features
- **Voice Recording**: 30-second recordings with waveform visualization
- **WSET Level 3**: Complete systematic wine assessment
- **Mobile PWA**: Install to home screen, offline-first
- **Social Features**: Friend connections and wine sharing
- **Performance**: Battery optimization and memory management

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication layouts
│   ├── wines/             # Wine management pages
│   ├── social/            # Social features pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── wine-tasting/     # WSET assessment components
│   ├── voice/            # Voice recording components
│   └── social/           # Social feature components
├── lib/                  # Core business logic
│   ├── api/              # API client functions
│   ├── voice/            # Voice processing pipeline
│   ├── wset/             # WSET mapping logic
│   ├── storage/          # File upload utilities
│   ├── performance/      # Battery & memory optimization
│   ├── realtime/         # Supabase subscriptions
│   └── supabase.ts       # Database client
├── types/                # TypeScript type definitions
│   ├── database.ts       # Database schema types
│   ├── wset.ts           # WSET and voice types
│   └── supabase.ts       # Generated Supabase types
└── hooks/                # Custom React hooks
    ├── useVoiceRecording.ts
    ├── useWSETForm.ts
    └── useBatteryOptimization.ts
```

## Development Workflow

### 1. Database Development

**Schema Changes**:
```bash
# Generate types after database changes
npm run generate-types

# Reset local database
supabase db reset

# Apply migrations
supabase db push
```

**Local Supabase**:
```bash
supabase start
supabase status
```

### 2. Voice Processing Development

**Test Voice Pipeline**:
```typescript
import { processVoiceRecording } from '@/lib/voice/voice-processor'

// Test with audio blob
const result = await processVoiceRecording(audioBlob, {
  useWhisper: true,
  enableWSETMapping: true
})
```

**Voice Recording Component**:
```typescript
import { useVoiceRecording } from '@/hooks/useVoiceRecording'

const { startRecording, stopRecording, isRecording, audioBlob } = useVoiceRecording({
  maxDuration: 30000,
  enableWaveform: true
})
```

### 3. WSET Form Development

**WSET Assessment Component**:
```typescript
import { useWSETForm } from '@/hooks/useWSETForm'
import { WSETFormData } from '@/types/wset'

const { form, handleSubmit, saveAsDraft } = useWSETForm()
```

**WSET Data Structure**:
```typescript
interface WSETAssessment {
  appearance: {
    clarity: 'clear' | 'hazy' | 'turbid'
    intensity: 'pale' | 'medium' | 'deep'
    color: string
  }
  nose: {
    condition: 'clean' | 'unclean'
    intensity: 'light' | 'medium' | 'pronounced'
    aroma_characteristics: string[]
    development: 'youthful' | 'developing' | 'fully_developed'
  }
  palate: {
    sweetness: 'bone_dry' | 'dry' | 'off_dry' | 'medium_dry' | 'medium_sweet' | 'sweet' | 'luscious'
    acidity: 'low' | 'medium_minus' | 'medium' | 'medium_plus' | 'high'
    tannin: 'low' | 'medium_minus' | 'medium' | 'medium_plus' | 'high'
    alcohol: 'low' | 'medium' | 'high'
    body: 'light' | 'medium_minus' | 'medium' | 'medium_plus' | 'full'
    flavor_characteristics: string[]
    finish: 'short' | 'medium_minus' | 'medium' | 'medium_plus' | 'long'
  }
  conclusions: {
    quality: 'faulty' | 'poor' | 'acceptable' | 'good' | 'very_good' | 'outstanding'
    readiness: 'too_young' | 'ready' | 'past_its_best'
    aging_potential: string
  }
}
```

### 4. PWA Development

**Service Worker Testing**:
```bash
# Build and test PWA
npm run build
npm run start

# Check service worker registration
# Visit chrome://inspect/#service-workers
```

**PWA Features**:
- Offline caching for core features
- Background sync for wine entries
- Push notifications for social features
- Install prompt for mobile/desktop

### 5. Performance Optimization

**Battery Optimization**:
```typescript
import { 
  getBatteryInfo, 
  getOptimizedImageSettings,
  onPerformanceConfigChange 
} from '@/lib/performance/battery-optimization'

// Monitor battery and adjust features
const config = getPerformanceConfig()
const imageSettings = getOptimizedImageSettings()
```

**Memory Management**:
```typescript
import { getMemoryInfo, performMemoryCleanup } from '@/lib/performance/battery-optimization'

// Monitor memory usage
const memInfo = getMemoryInfo()
if (memInfo && memInfo.percentage > 80) {
  performMemoryCleanup()
}
```

## Testing Strategy

### Unit Tests
```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

### E2E Testing
```bash
npm run test:e2e    # Playwright tests
```

### Voice Processing Tests
```bash
npm run test:voice  # Voice pipeline tests
```

### PWA Testing
- Test offline functionality
- Verify service worker caching
- Check install prompt
- Test on multiple devices

## Build and Deployment

### Local Build
```bash
npm run build       # Production build
npm run start       # Serve production build
npm run analyze     # Bundle analysis
```

### Environment Variables
```bash
# Required for full functionality
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key

# Optional configuration
NEXT_PUBLIC_MAX_RECORDING_DURATION=30000
NEXT_PUBLIC_VOICE_PROCESSING_ENABLED=true
```

### Performance Monitoring
```bash
# Bundle analysis
ANALYZE=true npm run build

# Lighthouse testing
npm run lighthouse
```

## Troubleshooting

### Common Issues

**Build Errors**:
- ESLint/TypeScript: Configured to allow builds with warnings
- Missing dependencies: Check package.json versions
- Environment variables: App works with placeholders

**Voice Recording Issues**:
- Microphone permissions required
- HTTPS required for Web Audio API
- Browser compatibility varies

**PWA Installation**:
- HTTPS required for service worker
- Manifest.json must be valid
- Icons must be correct sizes

**Performance Issues**:
- Check battery optimization settings
- Monitor memory usage
- Verify service worker caching

### Debug Commands

```bash
# Check Next.js configuration
npm run build -- --debug

# Inspect service worker
# Chrome DevTools → Application → Service Workers

# Check PWA manifest
# Chrome DevTools → Application → Manifest

# Monitor performance
# Chrome DevTools → Performance
```

## Contributing Guidelines

### Code Style
- TypeScript with strict mode
- ESLint + Prettier formatting
- Tailwind CSS for styling
- React Hook patterns

### Git Workflow
```bash
# Feature development
git checkout -b feature/voice-processing-improvements
git commit -m "feat: improve voice recognition accuracy"
git push origin feature/voice-processing-improvements
```

### Testing Requirements
- Unit tests for business logic
- Component tests for UI
- E2E tests for critical paths
- Performance testing for mobile

---

🍷 **WineSnap Development - Voice-Powered Wine Journal**

Built with Next.js 14, Supabase, and modern PWA standards for professional wine tasting in social environments.