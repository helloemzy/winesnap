// Pet System Types for WineSnap Tamagotchi
export interface PetSpecies {
  id: string;
  name: string;
  description: string;
  base_stats: PetStats;
  evolution_requirements?: Record<string, any>;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  created_at: string;
}

export interface PetEvolutionStage {
  id: string;
  species_id: string;
  stage_number: number;
  name: string;
  description: string;
  sprite_url?: string;
  animation_urls?: Record<string, string>;
  stat_multipliers: PetStatMultipliers;
  evolution_requirements?: Record<string, any>;
  unlocked_abilities?: string[];
  created_at: string;
}

export interface PetStats {
  health: number;
  happiness: number;
  energy: number;
}

export interface PetStatMultipliers {
  health: number;
  happiness: number;
  energy: number;
}

export interface UserPet {
  id: string;
  user_id: string;
  species_id: string;
  current_evolution_stage: string;
  name: string;
  
  // Core stats (0-100)
  health: number;
  happiness: number;
  energy: number;
  
  // Experience and growth
  total_experience: number;
  level: number;
  
  // Wine-specific stats
  wine_knowledge_score: number;
  regions_discovered: string[];
  grape_varieties_tasted: string[];
  countries_explored: string[];
  rare_wines_encountered: number;
  
  // Skill trees (wine regions expertise)
  french_expertise: number;
  italian_expertise: number;
  spanish_expertise: number;
  german_expertise: number;
  new_world_expertise: number;
  
  // Engagement tracking
  last_fed_at: string;
  last_interaction_at: string;
  daily_streak: number;
  longest_streak: number;
  
  // Status
  is_active: boolean;
  is_hungry: boolean;
  is_sleepy: boolean;
  mood: PetMood;
  
  // Social features
  battle_wins: number;
  battle_losses: number;
  prestige_points: number;
  
  created_at: string;
  updated_at: string;
}

export type PetMood = 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy' | 'ecstatic';

export interface UserPetWithDetails extends UserPet {
  species?: PetSpecies;
  current_stage?: PetEvolutionStage;
  next_evolution_stage?: PetEvolutionStage;
  experience_to_next_level: number;
  total_expertise: number;
  achievements_count: number;
  recent_activities?: PetActivity[];
}

export interface PetEvolutionHistory {
  id: string;
  pet_id: string;
  from_stage: string | null;
  to_stage: string;
  evolved_at: string;
  trigger_data?: Record<string, any>;
}

export interface PetActivity {
  id: string;
  pet_id: string;
  activity_type: PetActivityType;
  wine_entry_id?: string;
  experience_gained: number;
  stats_changed?: Record<string, number>;
  metadata?: Record<string, any>;
  created_at: string;
}

export type PetActivityType = 'fed' | 'wine_tasting' | 'evolution' | 'skill_gain' | 'mood_change' | 'battle' | 'interaction';

export interface PetBattle {
  id: string;
  challenger_pet_id: string;
  opponent_pet_id: string;
  battle_type: 'friendly' | 'ranked' | 'tournament';
  winner_pet_id?: string;
  battle_data?: BattleData;
  experience_reward: number;
  prestige_reward: number;
  started_at: string;
  completed_at?: string;
}

export interface BattleData {
  rounds: BattleRound[];
  total_damage_dealt: Record<string, number>;
  skills_used: Record<string, string[]>;
  duration_seconds: number;
}

export interface BattleRound {
  round_number: number;
  challenger_action: BattleAction;
  opponent_action: BattleAction;
  challenger_damage: number;
  opponent_damage: number;
  challenger_health_remaining: number;
  opponent_health_remaining: number;
}

export interface BattleAction {
  type: 'attack' | 'defend' | 'special' | 'wine_knowledge';
  skill_used?: string;
  effectiveness: number;
  description: string;
}

export interface PetCareReminder {
  id: string;
  pet_id: string;
  reminder_type: 'feed' | 'interact' | 'wine_tasting';
  scheduled_for: string;
  sent_at?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface WinePetGrowthMapping {
  id: string;
  wine_region?: string;
  wine_country?: string;
  grape_variety?: string;
  quality_level?: 'faulty' | 'poor' | 'acceptable' | 'good' | 'very good' | 'outstanding';
  price_tier?: 'budget' | 'mid-range' | 'premium' | 'super-premium' | 'ultra-premium';
  
  // Growth effects
  base_experience: number;
  health_effect: number;
  happiness_effect: number;
  energy_effect: number;
  
  // Skill bonuses
  french_expertise_bonus: number;
  italian_expertise_bonus: number;
  spanish_expertise_bonus: number;
  german_expertise_bonus: number;
  new_world_expertise_bonus: number;
  
  // Special effects
  rarity_multiplier: number;
  evolution_catalyst: boolean;
  
  created_at: string;
}

export interface PetAchievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: 'evolution' | 'exploration' | 'social' | 'dedication' | 'mastery';
  requirements: Record<string, any>;
  rewards?: Record<string, any>;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  created_at: string;
}

export interface UserPetAchievement {
  id: string;
  pet_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: PetAchievement;
}

export interface PetTrade {
  id: string;
  initiator_user_id: string;
  target_user_id: string;
  offered_items: TradeItem[];
  requested_items: TradeItem[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  expires_at: string;
  completed_at?: string;
  created_at: string;
}

export interface TradeItem {
  type: 'pet_experience' | 'rare_wine_discovery' | 'prestige_points' | 'achievement';
  item_id: string;
  quantity: number;
  metadata?: Record<string, any>;
}

// Pet interaction interfaces
export interface PetInteractionResult {
  success: boolean;
  message: string;
  stats_changed: Partial<PetStats>;
  experience_gained: number;
  mood_change?: PetMood;
  achievements_unlocked?: string[];
  evolution_triggered?: boolean;
}

export interface PetFeedingResult extends PetInteractionResult {
  wine_discovery_bonus: boolean;
  new_regions_discovered: string[];
  new_countries_explored: string[];
  expertise_gains: Record<string, number>;
}

// Pet evolution check result
export interface EvolutionCheckResult {
  can_evolve: boolean;
  next_stage?: PetEvolutionStage;
  missing_requirements?: Record<string, any>;
  evolution_story?: string;
}

// Pet care status
export interface PetCareStatus {
  needs_feeding: boolean;
  needs_interaction: boolean;
  hours_since_last_care: number;
  mood_trend: 'improving' | 'declining' | 'stable';
  upcoming_reminders: PetCareReminder[];
  recommended_actions: string[];
}

// Pet social features
export interface PetLeaderboard {
  category: 'level' | 'prestige' | 'wine_knowledge' | 'battle_wins';
  entries: PetLeaderboardEntry[];
  user_rank?: number;
}

export interface PetLeaderboardEntry {
  rank: number;
  pet: UserPetWithDetails;
  score: number;
  user_display_name: string;
}

// Pet battle matchmaking
export interface BattleMatchmakingResult {
  opponent_pet: UserPetWithDetails;
  estimated_win_probability: number;
  potential_rewards: {
    experience: number;
    prestige: number;
  };
  battle_preview: string;
}

// Wine tasting impact calculation
export interface WineTastingImpact {
  base_experience: number;
  bonus_experience: number;
  stat_effects: PetStats;
  expertise_gains: Record<string, number>;
  new_discoveries: {
    regions: string[];
    countries: string[];
    grape_varieties: string[];
  };
  rarity_multiplier: number;
  special_effects: string[];
}

// Pet creation/adoption
export interface PetCreationOptions {
  species_id: string;
  name: string;
  starter_bonuses?: Partial<PetStats>;
}

export interface PetAdoptionResult {
  success: boolean;
  pet?: UserPetWithDetails;
  error_message?: string;
  starter_achievements?: string[];
}

// Constants and enums
export const PET_STAT_LIMITS = {
  MIN: 0,
  MAX: 100
} as const;

export const EXPERTISE_LIMITS = {
  MIN: 0,
  MAX: 100
} as const;

export const EVOLUTION_LEVEL_REQUIREMENTS = {
  STAGE_2: 10,
  STAGE_3: 25,
  STAGE_4: 50
} as const;

export const WINE_REGIONS = {
  FRANCE: ['Bordeaux', 'Burgundy', 'Champagne', 'Rhône Valley', 'Loire Valley', 'Alsace'],
  ITALY: ['Tuscany', 'Piedmont', 'Veneto', 'Sicily', 'Emilia-Romagna'],
  SPAIN: ['Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas'],
  GERMANY: ['Mosel', 'Rheingau', 'Pfalz', 'Baden'],
  NEW_WORLD: ['Napa Valley', 'Barossa Valley', 'Marlborough', 'Stellenbosch', 'Mendoza']
} as const;

export const STAT_DECAY_RATES = {
  HAPPINESS: 2, // points per day
  ENERGY: 1,    // points per day
  HEALTH: 0.5   // points per day
} as const;

export const INTERACTION_COOLDOWNS = {
  FEEDING: 60 * 60 * 1000,      // 1 hour in milliseconds
  INTERACTION: 30 * 60 * 1000,   // 30 minutes in milliseconds
  BATTLE: 2 * 60 * 60 * 1000     // 2 hours in milliseconds
} as const;