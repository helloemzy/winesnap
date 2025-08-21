// GPT-4 service for mapping voice transcripts to WSET Level 3 structure

import type { WSETTastingNote, WineTerminology } from '@/types/wset'

export interface WSETMappingRequest {
  transcript: string
  context?: {
    wineType?: 'red' | 'white' | 'rosé' | 'sparkling'
    previousNotes?: Partial<WSETTastingNote>
  }
}

export interface WSETMappingResponse {
  wsetNote: WSETTastingNote
  confidence: number
  explanations: Record<string, string>
  unmappedTerms: string[]
  suggestions: string[]
}

export interface WSETMappingError {
  error: string
  code: 'INVALID_TRANSCRIPT' | 'API_ERROR' | 'MAPPING_FAILED' | 'RATE_LIMITED'
  details?: any
}

class WSETMapper {
  private apiKey: string
  private model: string
  private baseURL = 'https://api.openai.com/v1'

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey
    this.model = model
  }

  async mapTranscriptToWSET(request: WSETMappingRequest): Promise<WSETMappingResponse> {
    try {
      if (!request.transcript?.trim()) {
        throw {
          error: 'Empty transcript provided',
          code: 'INVALID_TRANSCRIPT'
        } as WSETMappingError
      }

      const systemPrompt = this.createSystemPrompt(request.context?.wineType)
      const userPrompt = this.createUserPrompt(request.transcript, request.context)

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        let errorCode: WSETMappingError['code'] = 'API_ERROR'
        if (response.status === 429) errorCode = 'RATE_LIMITED'
        if (response.status === 401) errorCode = 'API_ERROR'

        throw {
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorCode,
          details: errorData
        } as WSETMappingError
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      if (!content) {
        throw {
          error: 'No content in API response',
          code: 'API_ERROR'
        } as WSETMappingError
      }

      const parsedResult = JSON.parse(content)
      return this.validateAndTransformResponse(parsedResult, request.transcript)

    } catch (error) {
      if ((error as WSETMappingError).code) {
        throw error
      }

      throw {
        error: `WSET mapping failed: ${error}`,
        code: 'MAPPING_FAILED',
        details: error
      } as WSETMappingError
    }
  }

  private createSystemPrompt(wineType?: string): string {
    const wineTypeContext = wineType ? `focusing on ${wineType} wine characteristics` : ''

    return `You are a WSET Level 3 certified wine expert specializing in converting natural language wine tasting notes into structured WSET Level 3 format.

Your task is to analyze a wine tasting transcript and extract structured information according to WSET Level 3 methodology ${wineTypeContext}.

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
  }

  private createUserPrompt(transcript: string, context?: WSETMappingRequest['context']): string {
    let prompt = `Please analyze this wine tasting transcript and convert it to WSET Level 3 format:\n\n"${transcript}"`

    if (context?.wineType) {
      prompt += `\n\nWine type: ${context.wineType}`
    }

    if (context?.previousNotes) {
      prompt += `\n\nPrevious notes context: ${JSON.stringify(context.previousNotes)}`
    }

    prompt += `\n\nExtract and structure the information according to WSET Level 3 methodology. Be precise with terminology and only use the specified WSET values. If information is missing or unclear, omit those fields rather than guessing.`

    return prompt
  }

  private validateAndTransformResponse(parsedResult: any, originalTranscript: string): WSETMappingResponse {
    // Validate the structure
    if (!parsedResult.wsetNote || !parsedResult.wsetNote.conclusions) {
      throw {
        error: 'Invalid response structure from GPT',
        code: 'MAPPING_FAILED'
      } as WSETMappingError
    }

    // Ensure quality assessment is present
    if (!parsedResult.wsetNote.conclusions.qualityAssessment) {
      parsedResult.wsetNote.conclusions.qualityAssessment = 'good' // Default fallback
    }

    // Validate WSET values
    const validatedNote = this.validateWSETValues(parsedResult.wsetNote)

    return {
      wsetNote: validatedNote,
      confidence: Math.min(Math.max(parsedResult.confidence || 0.5, 0.0), 1.0),
      explanations: parsedResult.explanations || {},
      unmappedTerms: Array.isArray(parsedResult.unmappedTerms) ? parsedResult.unmappedTerms : [],
      suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : []
    }
  }

  private validateWSETValues(wsetNote: any): WSETTastingNote {
    const validIntensities = ['light', 'medium-', 'medium', 'medium+', 'pronounced']
    const validAppearanceIntensities = ['pale', 'medium-', 'medium', 'medium+', 'deep']
    const validClarity = ['clear', 'hazy']
    const validCondition = ['clean', 'unclean']
    const validDevelopment = ['youthful', 'developing', 'fully developed', 'tired']
    const validSweetness = ['dry', 'off-dry', 'medium-dry', 'medium-sweet', 'sweet', 'luscious']
    const validLevels = ['low', 'medium-', 'medium', 'medium+', 'high']
    const validBody = ['light', 'medium-', 'medium', 'medium+', 'full']
    const validFinish = ['short', 'medium-', 'medium', 'medium+', 'long']
    const validQuality = ['faulty', 'poor', 'acceptable', 'good', 'very good', 'outstanding']
    const validReadiness = ['too young', 'ready but will improve', 'ready and at peak', 'ready but past peak', 'too old']

    return {
      appearance: {
        intensity: this.validateValue(wsetNote.appearance?.intensity, validAppearanceIntensities),
        color: wsetNote.appearance?.color || undefined,
        clarity: this.validateValue(wsetNote.appearance?.clarity, validClarity),
        otherObservations: wsetNote.appearance?.otherObservations || undefined
      },
      nose: {
        condition: this.validateValue(wsetNote.nose?.condition, validCondition),
        intensity: this.validateValue(wsetNote.nose?.intensity, validIntensities),
        aromaCharacteristics: Array.isArray(wsetNote.nose?.aromaCharacteristics) 
          ? wsetNote.nose.aromaCharacteristics.filter((item: any) => typeof item === 'string')
          : [],
        development: this.validateValue(wsetNote.nose?.development, validDevelopment)
      },
      palate: {
        sweetness: this.validateValue(wsetNote.palate?.sweetness, validSweetness),
        acidity: this.validateValue(wsetNote.palate?.acidity, validLevels),
        tannin: this.validateValue(wsetNote.palate?.tannin, validLevels),
        alcohol: this.validateValue(wsetNote.palate?.alcohol, validLevels),
        body: this.validateValue(wsetNote.palate?.body, validBody),
        flavorIntensity: this.validateValue(wsetNote.palate?.flavorIntensity, validIntensities),
        flavorCharacteristics: Array.isArray(wsetNote.palate?.flavorCharacteristics)
          ? wsetNote.palate.flavorCharacteristics.filter((item: any) => typeof item === 'string')
          : [],
        finish: this.validateValue(wsetNote.palate?.finish, validFinish)
      },
      conclusions: {
        qualityAssessment: this.validateValue(wsetNote.conclusions.qualityAssessment, validQuality) || 'good',
        readinessForDrinking: this.validateValue(wsetNote.conclusions?.readinessForDrinking, validReadiness),
        agingPotential: wsetNote.conclusions?.agingPotential || undefined
      }
    }
  }

  private validateValue<T>(value: any, validValues: readonly T[]): T | undefined {
    return validValues.includes(value) ? value : undefined
  }

  // Enhanced mapping with wine terminology database
  async mapWithTerminology(
    transcript: string, 
    terminology: WineTerminology[]
  ): Promise<WSETMappingResponse> {
    // Pre-process transcript with wine terminology
    const processedTranscript = this.preprocessTranscriptWithTerminology(transcript, terminology)
    
    return this.mapTranscriptToWSET({
      transcript: processedTranscript,
      context: { wineType: this.inferWineType(transcript) }
    })
  }

  private preprocessTranscriptWithTerminology(transcript: string, terminology: WineTerminology[]): string {
    let processed = transcript.toLowerCase()
    
    // Replace synonyms with standard WSET terms
    terminology.forEach(term => {
      if (term.synonyms?.length) {
        term.synonyms.forEach(synonym => {
          const regex = new RegExp(`\\b${synonym.toLowerCase()}\\b`, 'gi')
          processed = processed.replace(regex, term.term)
        })
      }
    })
    
    return processed
  }

  private inferWineType(transcript: string): 'red' | 'white' | 'rosé' | 'sparkling' | undefined {
    const text = transcript.toLowerCase()
    
    if (text.includes('tannin') || text.includes('red') || text.includes('purple') || text.includes('ruby')) {
      return 'red'
    }
    if (text.includes('white') || text.includes('lemon') || text.includes('gold') || text.includes('amber')) {
      return 'white'
    }
    if (text.includes('rosé') || text.includes('pink') || text.includes('salmon')) {
      return 'rosé'
    }
    if (text.includes('sparkling') || text.includes('bubbles') || text.includes('mousse')) {
      return 'sparkling'
    }
    
    return undefined
  }

  // Estimate mapping cost
  estimateCost(transcript: string): number {
    const tokenCount = Math.ceil(transcript.length / 4) // Rough token estimation
    const promptTokens = 1000 // System prompt overhead
    const completionTokens = 500 // Expected response tokens
    
    // GPT-4o-mini pricing (approximate)
    const inputCostPer1k = 0.00015
    const outputCostPer1k = 0.0006
    
    const inputCost = (tokenCount + promptTokens) / 1000 * inputCostPer1k
    const outputCost = completionTokens / 1000 * outputCostPer1k
    
    return inputCost + outputCost
  }
}

// Factory function
export function createWSETMapper(apiKey?: string, model?: string): WSETMapper | null {
  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key || key.includes('placeholder')) {
    console.warn('OpenAI API key not configured - WSET mapping will not be available')
    return null
  }
  return new WSETMapper(key, model)
}

// Safe mapper instance that won't throw during initialization
export function getWSETMapper(): WSETMapper | null {
  try {
    return createWSETMapper()
  } catch (error) {
    console.warn('WSET mapper not available:', error)
    return null
  }
}

// Lazy singleton instance - only initialize when actually needed
let _wsetMapperInstance: WSETMapper | null | undefined = undefined

export const getWSETMapperInstance = (): WSETMapper | null => {
  if (_wsetMapperInstance === undefined) {
    try {
      _wsetMapperInstance = createWSETMapper()
    } catch (error) {
      console.warn('WSET mapper initialization failed - AI features disabled')
      _wsetMapperInstance = null
    }
  }
  return _wsetMapperInstance
}

// For backward compatibility - use lazy initialization
export const wsetMapper = null // Deprecated - use getWSETMapperInstance()

export default WSETMapper