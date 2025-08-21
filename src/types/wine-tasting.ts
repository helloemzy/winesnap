export interface WineAppearance {
  clarity: 'clear' | 'hazy' | 'cloudy';
  intensity: number; // 1-5 scale
  color: {
    type: 'white' | 'rose' | 'red';
    primary: string;
    secondary?: string;
  };
  viscosity?: 'light' | 'medium' | 'pronounced';
}

export interface WineNose {
  condition: {
    clean: boolean;
    faulty?: string[];
  };
  intensity: number; // 1-5 scale
  aromaDevelopment: 'primary' | 'secondary' | 'tertiary' | 'mixed';
  aromaCharacteristics: {
    fruits?: string[];
    florals?: string[];
    herbaceous?: string[];
    spices?: string[];
    oak?: string[];
    earth?: string[];
    other?: string[];
  };
}

export interface WinePalate {
  sweetness: number; // 1-5 scale (bone dry to sweet)
  acidity: number; // 1-5 scale (low to high)
  tannin: number; // 1-5 scale (low to high)
  alcohol: number; // 1-5 scale (low to high)
  body: number; // 1-5 scale (light to full)
  intensity: number; // 1-5 scale
  finish: number; // 1-5 scale (short to long)
  flavorCharacteristics: {
    fruits?: string[];
    spices?: string[];
    oak?: string[];
    earth?: string[];
    other?: string[];
  };
}

export interface WineConclusions {
  quality: number; // 1-5 scale (poor to outstanding)
  readiness: 'too-young' | 'drink-now' | 'past-peak';
  agingPotential: number; // years
  temperature: number; // serving temp in celsius
  notes?: string;
  score?: number; // 0-100 scale
}

export interface WineTastingEntry {
  id: string;
  wineName: string;
  producer?: string;
  vintage?: number;
  region?: string;
  grapeVarieties?: string[];
  appearance: WineAppearance;
  nose: WineNose;
  palate: WinePalate;
  conclusions: WineConclusions;
  voiceNote?: {
    recordingUrl: string;
    transcript?: string;
    duration: number;
  };
  photos?: string[];
  location?: string;
  occasion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  timeRemaining: number;
  audioLevel: number;
  recordingUrl?: string;
  error?: string;
}

// WSET Level 3 specific aroma/flavor descriptors
export const WINE_DESCRIPTORS = {
  fruits: {
    citrus: ['lemon', 'lime', 'grapefruit', 'orange'],
    stoneFruit: ['peach', 'apricot', 'nectarine'],
    tropicalFruit: ['pineapple', 'mango', 'passion fruit', 'lychee'],
    redFruit: ['strawberry', 'raspberry', 'cherry', 'cranberry'],
    blackFruit: ['blackberry', 'blackcurrant', 'plum', 'fig'],
    dried: ['raisin', 'fig', 'date', 'prune']
  },
  florals: ['violet', 'rose', 'lavender', 'elderflower', 'orange blossom'],
  herbaceous: ['grass', 'bell pepper', 'asparagus', 'tomato leaf', 'eucalyptus'],
  spices: ['black pepper', 'white pepper', 'cinnamon', 'clove', 'nutmeg', 'ginger'],
  oak: ['vanilla', 'toast', 'smoke', 'cedar', 'coconut', 'dill'],
  earth: ['wet stones', 'chalk', 'slate', 'mushroom', 'forest floor', 'leather'],
  other: ['honey', 'butter', 'bread', 'yeast', 'nuts', 'chocolate', 'coffee', 'tobacco']
} as const;

export const WINE_COLORS = {
  white: [
    'water white', 'pale lemon', 'lemon', 'medium lemon', 'deep lemon',
    'pale gold', 'medium gold', 'deep gold', 'amber', 'brown'
  ],
  rose: [
    'pale salmon', 'salmon', 'pale pink', 'pink', 'deep pink',
    'pale orange', 'orange', 'deep orange'
  ],
  red: [
    'pale ruby', 'ruby', 'medium ruby', 'deep ruby', 'pale garnet',
    'garnet', 'deep garnet', 'tawny', 'brown'
  ]
} as const;

export const QUALITY_LEVELS = [
  { value: 1, label: 'Poor', description: 'Major faults, undrinkable' },
  { value: 2, label: 'Below Average', description: 'Noticeable faults, unbalanced' },
  { value: 3, label: 'Acceptable', description: 'Sound wine, drinkable' },
  { value: 4, label: 'Good', description: 'Well-made, enjoyable' },
  { value: 5, label: 'Very Good', description: 'High quality, complex' },
  { value: 6, label: 'Outstanding', description: 'Exceptional quality' }
] as const;