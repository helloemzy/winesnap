import { Tables } from './supabase'

// Base types from Supabase
export type Profile = Tables<'profiles'>
export type WineTasting = Tables<'wine_tastings'>
export type Follow = Tables<'follows'>
export type TastingLike = Tables<'tasting_likes'>
export type TastingComment = Tables<'tasting_comments'>
export type Collection = Tables<'collections'>
export type CollectionTasting = Tables<'collection_tastings'>

// Extended types with relations
export type ProfileWithStats = Profile & {
  follower_count?: number
  following_count?: number
  tastings_count?: number
  is_following?: boolean
  is_followed_by?: boolean
}

export type WineTastingWithDetails = WineTasting & {
  profiles?: Profile
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
  tasting_comments?: (TastingComment & { profiles?: Profile })[]
}

export type CollectionWithTastings = Collection & {
  tastings_count?: number
  collection_tastings?: (CollectionTasting & {
    wine_tastings?: WineTasting
  })[]
}

// WSET Level 3 specific types
export interface WSETAssessment {
  appearance: {
    intensity: number // 1-3 (pale, medium, deep)
    color: string
    other?: string // rim variation, gas bubbles, etc.
  }
  nose: {
    intensity: number // 1-3 (light, medium, pronounced)
    characteristics: string[]
    development: 'primary' | 'secondary' | 'tertiary'
  }
  palate: {
    sweetness: number // 1-5 (bone dry to sweet)
    acidity: number // 1-3 (low, medium, high)
    tannin: number // 1-3 (low, medium, high)
    alcohol: number // 1-3 (low, medium, high)
    body: number // 1-3 (light, medium, full)
    intensity: number // 1-3 (light, medium, pronounced)
    finish: number // 1-3 (short, medium, long)
    characteristics: string[]
  }
  conclusion: {
    quality: number // 1-5 (poor to outstanding)
    readiness: 'too young' | 'ready' | 'past best'
    aging_potential?: number // years
  }
}

// Wine characteristics enums
export const WINE_STYLES = [
  'Still Red',
  'Still White',
  'Still Rosé',
  'Sparkling Red',
  'Sparkling White',
  'Sparkling Rosé',
  'Sweet Red',
  'Sweet White',
  'Fortified Red',
  'Fortified White',
] as const

export const CLOSURE_TYPES = [
  'Cork',
  'Screwcap',
  'Crown Cap',
  'Plastic Cork',
  'Glass Stopper',
  'Wax',
] as const

export const PRICE_POINTS = [
  'Budget (Under $15)',
  'Mid-range ($15-30)',
  'Premium ($30-60)',
  'Super Premium ($60-100)',
  'Ultra Premium ($100+)',
] as const

export const READINESS_LEVELS = [
  'Too young - needs time',
  'Just ready to drink',
  'Ready to drink - at peak',
  'Ready but may improve',
  'Fully mature',
  'Past its best',
] as const

export const GLASSWARE_TYPES = [
  'Bordeaux Glass',
  'Burgundy Glass',
  'White Wine Glass',
  'Champagne Flute',
  'Port Glass',
  'ISO Tasting Glass',
  'Universal Wine Glass',
] as const

// Common wine characteristics
export const AROMA_CHARACTERISTICS = {
  primary: [
    'Green apple', 'Lemon', 'Lime', 'Grapefruit', 'Orange', 'Peach', 'Apricot',
    'Pear', 'Pineapple', 'Passion fruit', 'Lychee', 'Gooseberry',
    'Blackcurrant', 'Blackberry', 'Blueberry', 'Cherry', 'Strawberry',
    'Raspberry', 'Plum', 'Fig', 'Raisin',
    'Rose', 'Violet', 'Elderflower', 'Orange blossom',
    'Green bell pepper', 'Tomato leaf', 'Eucalyptus', 'Mint',
    'Black pepper', 'White pepper', 'Licorice', 'Fennel',
  ],
  secondary: [
    'Yeast', 'Biscuit', 'Bread', 'Brioche', 'Pastry',
    'Butter', 'Cream', 'Yogurt', 'Cheese',
    'Almond', 'Hazelnut', 'Walnut', 'Coconut',
  ],
  tertiary: [
    'Vanilla', 'Coconut', 'Cedar', 'Oak', 'Smoke', 'Chocolate', 'Coffee',
    'Caramel', 'Toffee', 'Honey', 'Dried fruit', 'Fig', 'Raisin',
    'Leather', 'Tobacco', 'Earth', 'Mushroom', 'Truffle',
    'Petrol', 'Rubber', 'Tar', 'Game',
  ],
} as const

export type WineStyle = typeof WINE_STYLES[number]
export type ClosureType = typeof CLOSURE_TYPES[number]
export type PricePoint = typeof PRICE_POINTS[number]
export type ReadinessLevel = typeof READINESS_LEVELS[number]
export type GlasswareType = typeof GLASSWARE_TYPES[number]

// Form types
export interface TastingFormData extends Omit<WineTasting, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

export interface ProfileFormData extends Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'> {}