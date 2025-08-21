# 🔗 WineSnap API Documentation

## Overview

WineSnap uses a hybrid API architecture combining Supabase Edge Functions for AI processing and direct database operations for real-time features.

**Base URLs**:
- **Live API**: https://winesnap-oleov0698-helloemilywho-gmailcoms-projects.vercel.app/api
- **Supabase Edge Functions**: https://your-project.supabase.co/functions/v1
- **Real-time**: Supabase real-time subscriptions

## Authentication

### Supabase Auth Integration

**Headers**:
```http
Authorization: Bearer <supabase_jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

**Authentication Flow**:
```typescript
import { supabase } from '@/lib/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get session
const { data: { session } } = await supabase.auth.getSession()
```

## Core API Endpoints

### 🎤 Voice Processing API

#### Process Voice Recording

**POST** `/supabase/functions/voice-process`

Processes voice recordings and maps to WSET Level 3 structure.

**Request**:
```typescript
{
  audio_data: string;        // Base64 encoded audio
  duration: number;          // Recording duration in ms
  use_whisper?: boolean;     // Use OpenAI Whisper (default: false)
  enable_wset_mapping?: boolean; // Enable WSET AI mapping (default: true)
  wine_context?: {
    wine_type?: 'red' | 'white' | 'rosé' | 'sparkling';
    region?: string;
    vintage?: number;
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    transcript: string;
    wset_analysis: WSETAssessment;
    confidence_score: number;
    processing_time: number;
    cached: boolean;
  };
  error?: string;
}
```

**Example**:
```typescript
const response = await fetch('/supabase/functions/voice-process', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audio_data: base64AudioData,
    duration: 30000,
    use_whisper: true,
    enable_wset_mapping: true,
    wine_context: {
      wine_type: 'red',
      region: 'Bordeaux'
    }
  })
});
```

### 🍷 Wine Management API

#### Create Wine Entry

**POST** `/api/wines`

Creates a new wine entry with WSET assessment.

**Request**:
```typescript
{
  basic_info: {
    name: string;
    producer?: string;
    region?: string;
    vintage?: number;
    grape_varieties?: string[];
    price?: number;
    alcohol_content?: number;
  };
  wset_assessment: WSETAssessment;
  voice_recording?: {
    audio_url: string;
    transcript: string;
    duration: number;
  };
  images?: string[];
  rating?: number;
  notes?: string;
  is_public?: boolean;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    id: string;
    created_at: string;
    user_id: string;
    // ... wine entry data
  };
  error?: string;
}
```

#### Get Wine Entries

**GET** `/api/wines?limit=20&offset=0&filter=recent`

**Query Parameters**:
- `limit`: Number of entries (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `filter`: `recent` | `rating` | `price` | `region`
- `wine_type`: `red` | `white` | `rosé` | `sparkling`
- `region`: Filter by region
- `user_id`: Filter by user (for public entries)

**Response**:
```typescript
{
  success: boolean;
  data: {
    wines: WineEntry[];
    total_count: number;
    has_more: boolean;
  };
  error?: string;
}
```

#### Update Wine Entry

**PUT** `/api/wines/{wine_id}`

Updates an existing wine entry (user must own the entry).

#### Delete Wine Entry

**DELETE** `/api/wines/{wine_id}`

Deletes a wine entry (user must own the entry).

### 👥 Social Features API

#### Follow User

**POST** `/api/social/follow`

**Request**:
```typescript
{
  user_id: string;
}
```

#### Get Activity Feed

**GET** `/api/social/activity?limit=50&offset=0`

**Response**:
```typescript
{
  success: boolean;
  data: {
    activities: {
      id: string;
      type: 'wine_created' | 'wine_liked' | 'user_followed';
      user: UserProfile;
      wine?: WineEntry;
      created_at: string;
    }[];
    has_more: boolean;
  };
}
```

#### Like Wine Entry

**POST** `/api/social/like`

**Request**:
```typescript
{
  wine_entry_id: string;
}
```

#### Comment on Wine Entry

**POST** `/api/social/comment`

**Request**:
```typescript
{
  wine_entry_id: string;
  content: string;
  parent_comment_id?: string; // For replies
}
```

### 📱 User Management API

#### Get User Profile

**GET** `/api/users/profile`

Returns current user's profile information.

#### Update User Profile

**PUT** `/api/users/profile`

**Request**:
```typescript
{
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  wine_preferences?: {
    favorite_regions?: string[];
    preferred_wine_types?: string[];
    tasting_experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  };
  privacy_settings?: {
    profile_visibility: 'public' | 'friends' | 'private';
    wine_entries_visibility: 'public' | 'friends' | 'private';
    activity_visibility: 'public' | 'friends' | 'private';
  };
}
```

#### Get User Statistics

**GET** `/api/users/stats`

**Response**:
```typescript
{
  success: boolean;
  data: {
    total_wines: number;
    wines_this_month: number;
    average_rating: number;
    favorite_regions: string[];
    wine_type_distribution: {
      red: number;
      white: number;
      rosé: number;
      sparkling: number;
    };
    quality_distribution: {
      outstanding: number;
      very_good: number;
      good: number;
      acceptable: number;
      poor: number;
      faulty: number;
    };
  };
}
```

### 📊 Analytics API

#### Get Wine Analytics

**GET** `/api/analytics/wines?timeframe=month&group_by=region`

**Query Parameters**:
- `timeframe`: `week` | `month` | `quarter` | `year`
- `group_by`: `region` | `wine_type` | `quality` | `price_range`

**Response**:
```typescript
{
  success: boolean;
  data: {
    [group_key: string]: {
      count: number;
      average_rating: number;
      total_value: number;
    };
  };
}
```

## Real-time Features

### 🔔 Supabase Subscriptions

#### Activity Feed Updates

```typescript
import { supabase } from '@/lib/supabase'

const subscription = supabase
  .channel('activity_feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'activity_feed',
    filter: `user_id=eq.${currentUserId}`
  }, (payload) => {
    // Handle new activity
    console.log('New activity:', payload.new)
  })
  .subscribe()
```

#### Wine Entry Comments

```typescript
const subscription = supabase
  .channel(`wine_entry_comments:${wineEntryId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'wine_entry_comments',
    filter: `wine_entry_id=eq.${wineEntryId}`
  }, (payload) => {
    // Handle new comment
    addComment(payload.new)
  })
  .subscribe()
```

#### User Presence

```typescript
const presenceChannel = supabase.channel('online_users')

// Track user presence
presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    console.log('Online users:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: currentUserId,
        online_at: new Date().toISOString(),
      })
    }
  })
```

## File Upload API

### 📸 Image Upload

#### Upload Wine Image

**POST** `/api/upload/wine-image`

**Request** (multipart/form-data):
```
file: File (max 10MB, jpg/png/webp)
wine_entry_id: string
image_type: 'bottle' | 'label' | 'glass' | 'tasting_notes'
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    image_url: string;
    thumbnail_url: string;
    upload_id: string;
  };
  error?: string;
}
```

#### Upload Voice Recording

**POST** `/api/upload/voice-recording`

**Request** (multipart/form-data):
```
file: File (max 5MB, audio/webm, audio/mp4, audio/wav)
wine_entry_id: string
duration: number
```

## Type Definitions

### WSETAssessment

```typescript
interface WSETAssessment {
  appearance: {
    clarity: 'clear' | 'hazy' | 'turbid';
    intensity: 'pale' | 'medium' | 'deep';
    color: string;
    color_description?: string;
  };
  nose: {
    condition: 'clean' | 'unclean';
    intensity: 'light' | 'medium' | 'pronounced';
    aroma_characteristics: string[];
    development: 'youthful' | 'developing' | 'fully_developed';
    notes?: string;
  };
  palate: {
    sweetness: 'bone_dry' | 'dry' | 'off_dry' | 'medium_dry' | 'medium_sweet' | 'sweet' | 'luscious';
    acidity: 'low' | 'medium_minus' | 'medium' | 'medium_plus' | 'high';
    tannin?: 'low' | 'medium_minus' | 'medium' | 'medium_plus' | 'high';
    alcohol: 'low' | 'medium' | 'high';
    body: 'light' | 'medium_minus' | 'medium' | 'medium_plus' | 'full';
    flavor_characteristics: string[];
    finish: 'short' | 'medium_minus' | 'medium' | 'medium_plus' | 'long';
    notes?: string;
  };
  conclusions: {
    quality: 'faulty' | 'poor' | 'acceptable' | 'good' | 'very_good' | 'outstanding';
    readiness: 'too_young' | 'ready' | 'past_its_best';
    aging_potential?: string;
    notes?: string;
  };
}
```

### WineEntry

```typescript
interface WineEntry {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Basic Information
  name: string;
  producer?: string;
  region?: string;
  vintage?: number;
  grape_varieties?: string[];
  price?: number;
  alcohol_content?: number;
  
  // WSET Assessment
  wset_assessment: WSETAssessment;
  
  // User Content
  rating?: number; // 1-5 stars
  notes?: string;
  images?: string[];
  
  // Voice Recording
  voice_recording?: {
    audio_url: string;
    transcript: string;
    duration: number;
  };
  
  // Social Features
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  
  // Metadata
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  tasting_date?: string;
  occasion?: string;
}
```

### UserProfile

```typescript
interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  
  wine_preferences?: {
    favorite_regions?: string[];
    preferred_wine_types?: string[];
    tasting_experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  };
  
  privacy_settings?: {
    profile_visibility: 'public' | 'friends' | 'private';
    wine_entries_visibility: 'public' | 'friends' | 'private';
    activity_visibility: 'public' | 'friends' | 'private';
  };
  
  stats?: {
    total_wines: number;
    wines_this_month: number;
    followers_count: number;
    following_count: number;
    average_rating: number;
  };
}
```

## Rate Limiting

### API Limits

- **Voice Processing**: 100 requests/hour per user
- **Wine CRUD**: 1000 requests/hour per user
- **Social Actions**: 500 requests/hour per user
- **File Uploads**: 50 uploads/hour per user

### Cost Optimization

- **Voice Processing Cache**: Reduces duplicate processing by 60-80%
- **Web Speech API**: Used primarily (free)
- **OpenAI Whisper**: Fallback only (~$0.006/minute)
- **GPT-4 WSET Mapping**: Optimized prompts (~$0.001/request)

## Error Handling

### Standard Error Response

```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `PROCESSING_ERROR`: Voice/AI processing failed
- `UPLOAD_ERROR`: File upload failed
- `NETWORK_ERROR`: Connection issues

## Client SDKs

### TypeScript Client

```typescript
import { WineSnapAPI } from '@/lib/api/client'

const api = new WineSnapAPI({
  baseUrl: 'https://your-app.vercel.app',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
})

// Process voice recording
const result = await api.voice.processRecording(audioBlob, {
  useWhisper: true,
  wineContext: { wine_type: 'red' }
})

// Create wine entry
const wine = await api.wines.create({
  name: 'Château Margaux 2015',
  wset_assessment: result.wset_analysis
})

// Get activity feed
const activities = await api.social.getActivityFeed()
```

### React Hooks

```typescript
import { useWineAPI } from '@/hooks/useWineAPI'

function WineList() {
  const { wines, loading, error, refetch } = useWineAPI.getWines({
    limit: 20,
    filter: 'recent'
  })
  
  if (loading) return <Loading />
  if (error) return <Error message={error.message} />
  
  return (
    <div>
      {wines.map(wine => (
        <WineCard key={wine.id} wine={wine} />
      ))}
    </div>
  )
}
```

---

🍷 **WineSnap API - Voice-Powered Wine Tasting**

**Live API**: https://winesnap-oleov0698-helloemilywho-gmailcoms-projects.vercel.app/api

Complete API for professional wine assessment with AI voice processing and social features.