// Supabase Edge Function for voice processing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

interface VoiceProcessRequest {
  audioUrl?: string
  audioBase64?: string
  transcript?: string
  userId: string
  useCache?: boolean
}

interface WhisperResponse {
  text: string
}

interface WSETMappingResponse {
  wsetNote: any
  confidence: number
  explanations: Record<string, string>
  unmappedTerms: string[]
  suggestions: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    
    // Parse request
    const { audioUrl, audioBase64, transcript, userId, useCache = true }: VoiceProcessRequest = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let finalTranscript = transcript
    let audioHash: string | null = null

    // If we have audio, process it
    if ((audioUrl || audioBase64) && !transcript) {
      // Generate audio hash for caching
      const audioData = audioBase64 || (await fetchAudioAsBase64(audioUrl!))
      audioHash = await generateAudioHash(audioData)

      // Check cache if enabled
      if (useCache && audioHash) {
        const { data: cachedResult } = await supabase
          .from('voice_processing_cache')
          .select('*')
          .eq('audio_hash', audioHash)
          .single()

        if (cachedResult) {
          return new Response(
            JSON.stringify({
              transcript: cachedResult.transcript,
              wsetMapping: cachedResult.wset_mapping,
              confidence: cachedResult.processing_confidence,
              fromCache: true,
              processingTime: 0
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }

      // Transcribe with Whisper
      finalTranscript = await transcribeWithWhisper(audioData)
    }

    if (!finalTranscript?.trim()) {
      return new Response(
        JSON.stringify({ error: 'No transcript available for processing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map transcript to WSET
    const wsetMapping = await mapTranscriptToWSET(finalTranscript)

    // Cache the result if we have an audio hash
    if (useCache && audioHash) {
      await supabase.from('voice_processing_cache').insert({
        audio_hash: audioHash,
        transcript: finalTranscript,
        wset_mapping: wsetMapping.wsetNote,
        processing_confidence: wsetMapping.confidence
      })
    }

    return new Response(
      JSON.stringify({
        transcript: finalTranscript,
        wsetMapping: wsetMapping.wsetNote,
        confidence: wsetMapping.confidence,
        explanations: wsetMapping.explanations,
        unmappedTerms: wsetMapping.unmappedTerms,
        suggestions: wsetMapping.suggestions,
        fromCache: false,
        processingTime: 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Voice processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Voice processing failed',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions
async function fetchAudioAsBase64(audioUrl: string): Promise<string> {
  const response = await fetch(audioUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.statusText}`)
  }
  
  const arrayBuffer = await response.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function generateAudioHash(audioBase64: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(audioBase64)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function transcribeWithWhisper(audioBase64: string): Promise<string> {
  // Convert base64 to blob for form data
  const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
  const audioBlob = new Blob([audioBytes], { type: 'audio/webm' })
  
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  formData.append('language', 'en')
  formData.append('prompt', 'This is a wine tasting note describing the appearance, nose, palate, and quality of a wine.')
  formData.append('response_format', 'json')
  formData.append('temperature', '0.1')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Whisper API error: ${error}`)
  }

  const result: WhisperResponse = await response.json()
  return result.text
}

async function mapTranscriptToWSET(transcript: string): Promise<WSETMappingResponse> {
  const systemPrompt = `You are a WSET Level 3 certified wine expert specializing in converting natural language wine tasting notes into structured WSET Level 3 format.

Your task is to analyze a wine tasting transcript and extract structured information according to WSET Level 3 methodology.

WSET Level 3 Structure:
1. APPEARANCE:
   - Intensity: pale, medium-, medium, medium+, deep
   - Color: specific color descriptors
   - Clarity: clear, hazy

2. NOSE:
   - Condition: clean, unclean
   - Intensity: light, medium-, medium, medium+, pronounced
   - Aroma characteristics: array of descriptors
   - Development: youthful, developing, fully developed, tired

3. PALATE:
   - Sweetness: dry, off-dry, medium-dry, medium-sweet, sweet, luscious
   - Acidity: low, medium-, medium, medium+, high
   - Tannin: low, medium-, medium, medium+, high
   - Alcohol: low, medium-, medium, medium+, high
   - Body: light, medium-, medium, medium+, full
   - Flavor intensity: light, medium-, medium, medium+, pronounced
   - Flavor characteristics: array of descriptors
   - Finish: short, medium-, medium, medium+, long

4. CONCLUSIONS:
   - Quality assessment: faulty, poor, acceptable, good, very good, outstanding (REQUIRED)
   - Readiness for drinking: too young, ready but will improve, ready and at peak, ready but past peak, too old
   - Aging potential: text description

IMPORTANT RULES:
- Only use the exact WSET terminology listed above
- If unsure about a specific WSET value, omit it rather than guess
- Extract specific descriptors for aroma and flavor characteristics
- Quality assessment is REQUIRED - if not explicitly stated, infer from overall tone
- Provide confidence score (0.0-1.0) based on how clearly the transcript maps to WSET structure
- Include explanations for key mappings
- List any wine terms that couldn't be mapped to WSET categories

Return JSON in this exact format:
{
  "wsetNote": {
    "appearance": {
      "intensity": "medium" | null,
      "color": "string" | null,
      "clarity": "clear" | null,
      "otherObservations": "string" | null
    },
    "nose": {
      "condition": "clean" | null,
      "intensity": "medium" | null,
      "aromaCharacteristics": ["array", "of", "descriptors"],
      "development": "developing" | null
    },
    "palate": {
      "sweetness": "dry" | null,
      "acidity": "medium+" | null,
      "tannin": "medium" | null,
      "alcohol": "medium+" | null,
      "body": "medium+" | null,
      "flavorIntensity": "pronounced" | null,
      "flavorCharacteristics": ["array", "of", "descriptors"],
      "finish": "long" | null
    },
    "conclusions": {
      "qualityAssessment": "very good",
      "readinessForDrinking": "ready and at peak" | null,
      "agingPotential": "string description" | null
    }
  },
  "confidence": 0.85,
  "explanations": {
    "field_name": "explanation of mapping decision"
  },
  "unmappedTerms": ["terms", "that", "couldn't", "be", "mapped"],
  "suggestions": ["suggestions", "for", "missing", "information"]
}`

  const userPrompt = `Please analyze this wine tasting transcript and convert it to WSET Level 3 format:

"${transcript}"

Extract and structure the information according to WSET Level 3 methodology. Be precise with terminology and only use the specified WSET values. If information is missing or unclear, omit those fields rather than guessing.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GPT API error: ${error}`)
  }

  const result = await response.json()
  const content = result.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content in GPT response')
  }

  const parsedResult = JSON.parse(content)
  
  // Ensure quality assessment is present
  if (!parsedResult.wsetNote?.conclusions?.qualityAssessment) {
    parsedResult.wsetNote.conclusions.qualityAssessment = 'good'
  }

  return {
    wsetNote: parsedResult.wsetNote,
    confidence: Math.min(Math.max(parsedResult.confidence || 0.5, 0.0), 1.0),
    explanations: parsedResult.explanations || {},
    unmappedTerms: Array.isArray(parsedResult.unmappedTerms) ? parsedResult.unmappedTerms : [],
    suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : []
  }
}