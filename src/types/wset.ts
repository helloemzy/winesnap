// WSET Level 3 Tasting Note Types

export type WSETIntensityLevel = 'light' | 'medium-' | 'medium' | 'medium+' | 'pronounced'
export type WSETAppearanceIntensity = 'pale' | 'medium-' | 'medium' | 'medium+' | 'deep'
export type WSETClarity = 'clear' | 'hazy'
export type WSETCondition = 'clean' | 'unclean'
export type WSETDevelopment = 'youthful' | 'developing' | 'fully developed' | 'tired'
export type WSETSweetness = 'dry' | 'off-dry' | 'medium-dry' | 'medium-sweet' | 'sweet' | 'luscious'
export type WSETAcidityTanninAlcohol = 'low' | 'medium-' | 'medium' | 'medium+' | 'high'
export type WSETBody = 'light' | 'medium-' | 'medium' | 'medium+' | 'full'
export type WSETFinish = 'short' | 'medium-' | 'medium' | 'medium+' | 'long'
export type WSETQuality = 'faulty' | 'poor' | 'acceptable' | 'good' | 'very good' | 'outstanding'
export type WSETReadiness = 'too young' | 'ready but will improve' | 'ready and at peak' | 'ready but past peak' | 'too old'

export interface WSETAppearance {
  intensity?: WSETAppearanceIntensity
  color?: string
  clarity?: WSETClarity
  otherObservations?: string
}

export interface WSETNose {
  condition?: WSETCondition
  intensity?: WSETIntensityLevel
  aromaCharacteristics?: string[]
  development?: WSETDevelopment
}

export interface WSETPalate {
  sweetness?: WSETSweetness
  acidity?: WSETAcidityTanninAlcohol
  tannin?: WSETAcidityTanninAlcohol
  alcohol?: WSETAcidityTanninAlcohol
  body?: WSETBody
  flavorIntensity?: WSETIntensityLevel
  flavorCharacteristics?: string[]
  finish?: WSETFinish
}

export interface WSETConclusions {
  qualityAssessment: WSETQuality
  readinessForDrinking?: WSETReadiness
  agingPotential?: string
}

export interface WSETTastingNote {
  appearance?: WSETAppearance
  nose?: WSETNose
  palate?: WSETPalate
  conclusions: WSETConclusions
}

// Voice processing types
export interface VoiceProcessingRequest {
  audioUrl?: string
  audioBlob?: Blob
  transcript?: string
  useCache?: boolean
}

export interface VoiceProcessingResponse {
  transcript: string
  wsetMapping: WSETTastingNote
  confidence: number
  processingTime: number
  fromCache: boolean
  cost?: number
}

export interface VoiceProcessingError {
  error: string
  code: 'TRANSCRIPTION_FAILED' | 'MAPPING_FAILED' | 'INVALID_INPUT' | 'RATE_LIMITED' | 'API_ERROR'
  details?: any
}

// WSET field mapping configurations
export interface WSETFieldMapping {
  field: string
  keywords: string[]
  synonyms: string[]
  confidence: number
  category: 'appearance' | 'nose' | 'palate' | 'conclusions'
}

// Wine terminology for NLP processing
export interface WineTerminology {
  term: string
  category: string
  wsetField: string
  synonyms: string[]
  confidenceWeight: number
}

// Voice processing cache interface
export interface VoiceProcessingCache {
  audioHash: string
  transcript: string
  wsetMapping: WSETTastingNote
  confidence: number
  createdAt: string
}

// Cost tracking
export interface VoiceProcessingCost {
  transcriptionCost: number
  mappingCost: number
  totalCost: number
  tokensUsed: number
  audioSeconds: number
}

// Processing configuration
export interface VoiceProcessingConfig {
  maxRecordingDuration: number
  enableCache: boolean
  whisperModel: 'whisper-1'
  gptModel: 'gpt-4o' | 'gpt-4o-mini'
  confidenceThreshold: number
  costLimit: number
}

// WSET validation schemas
export const WSET_APPEARANCE_INTENSITY_VALUES: WSETAppearanceIntensity[] = [
  'pale', 'medium-', 'medium', 'medium+', 'deep'
]

export const WSET_INTENSITY_VALUES: WSETIntensityLevel[] = [
  'light', 'medium-', 'medium', 'medium+', 'pronounced'
]

export const WSET_CLARITY_VALUES: WSETClarity[] = ['clear', 'hazy']
export const WSET_CONDITION_VALUES: WSETCondition[] = ['clean', 'unclean']
export const WSET_DEVELOPMENT_VALUES: WSETDevelopment[] = [
  'youthful', 'developing', 'fully developed', 'tired'
]

export const WSET_SWEETNESS_VALUES: WSETSweetness[] = [
  'dry', 'off-dry', 'medium-dry', 'medium-sweet', 'sweet', 'luscious'
]

export const WSET_ACIDITY_TANNIN_ALCOHOL_VALUES: WSETAcidityTanninAlcohol[] = [
  'low', 'medium-', 'medium', 'medium+', 'high'
]

export const WSET_BODY_VALUES: WSETBody[] = [
  'light', 'medium-', 'medium', 'medium+', 'full'
]

export const WSET_FINISH_VALUES: WSETFinish[] = [
  'short', 'medium-', 'medium', 'medium+', 'long'
]

export const WSET_QUALITY_VALUES: WSETQuality[] = [
  'faulty', 'poor', 'acceptable', 'good', 'very good', 'outstanding'
]

export const WSET_READINESS_VALUES: WSETReadiness[] = [
  'too young', 'ready but will improve', 'ready and at peak', 
  'ready but past peak', 'too old'
]

// Common wine descriptors organized by category
export const WINE_DESCRIPTORS = {
  appearance: {
    colors: {
      red: ['purple', 'ruby', 'garnet', 'tawny', 'brown'],
      white: ['lemon-green', 'lemon', 'gold', 'amber', 'brown'],
      rosé: ['pink', 'salmon', 'orange']
    }
  },
  nose: {
    fruit: {
      primary: ['citrus', 'apple', 'pear', 'stone fruit', 'tropical', 'red fruit', 'black fruit'],
      cooked: ['jam', 'stewed fruit', 'baked fruit', 'dried fruit']
    },
    floral: ['rose', 'violet', 'jasmine', 'elderflower', 'acacia'],
    spice: ['black pepper', 'white pepper', 'cinnamon', 'clove', 'nutmeg'],
    herbal: ['mint', 'eucalyptus', 'fennel', 'dill', 'thyme'],
    earth: ['forest floor', 'mushroom', 'wet leaves', 'petrichor'],
    mineral: ['chalk', 'slate', 'flint', 'limestone', 'granite'],
    oak: ['vanilla', 'coconut', 'cedar', 'smoke', 'toast'],
    other: ['leather', 'tobacco', 'game', 'barnyard', 'petroleum']
  },
  palate: {
    fruit: ['fresh fruit', 'ripe fruit', 'overripe fruit', 'dried fruit'],
    savory: ['meat', 'game', 'leather', 'earth', 'mushroom'],
    spice: ['pepper', 'spice', 'herbs'],
    oak: ['vanilla', 'toast', 'smoke', 'cedar']
  }
}

// Helper function to validate WSET values
export function validateWSETValue<T>(value: T, validValues: readonly T[]): boolean {
  return validValues.includes(value)
}

// Helper function to map natural language to WSET values
export function mapToWSETValue<T>(
  input: string, 
  validValues: readonly T[], 
  synonymMap?: Record<string, T>
): T | null {
  const normalizedInput = input.toLowerCase().trim()
  
  // Direct match
  if (validValues.includes(normalizedInput as T)) {
    return normalizedInput as T
  }
  
  // Synonym mapping
  if (synonymMap && synonymMap[normalizedInput]) {
    return synonymMap[normalizedInput]
  }
  
  return null
}