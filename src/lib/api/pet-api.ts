import { supabase } from '@/lib/supabase';
import {
  UserPet,
  UserPetWithDetails,
  PetSpecies,
  PetEvolutionStage,
  PetActivity,
  PetBattle,
  PetCareReminder,
  WinePetGrowthMapping,
  PetAchievement,
  UserPetAchievement,
  PetTrade,
  PetCreationOptions,
  PetAdoptionResult,
  PetLeaderboard,
  BattleMatchmakingResult
} from '@/types/pet';
import { Database } from '@/types/supabase';

type PetRow = Database['public']['Tables']['user_pets']['Row'];
type PetInsert = Database['public']['Tables']['user_pets']['Insert'];
type PetUpdate = Database['public']['Tables']['user_pets']['Update'];

export class PetAPI {
  /**
   * Get user's active pet with full details
   */
  static async getUserPet(userId: string): Promise<UserPetWithDetails | null> {
    try {
      const { data: pet, error } = await supabase
        .from('user_pets')
        .select(`
          *,
          species:pet_species(*),
          current_stage:pet_evolution_stages!user_pets_current_evolution_stage_fkey(*),
          recent_activities:pet_activities(
            id, activity_type, experience_gained, stats_changed, metadata, created_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No pet found
        }
        throw error;
      }

      // Calculate derived fields
      const experienceToNextLevel = this.calculateExperienceToNextLevel(pet.level, pet.total_experience);
      const totalExpertise = pet.french_expertise + pet.italian_expertise + 
                           pet.spanish_expertise + pet.german_expertise + pet.new_world_expertise;

      // Get achievements count
      const { count: achievementsCount } = await supabase
        .from('user_pet_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('pet_id', pet.id);

      return {
        ...pet,
        experience_to_next_level: experienceToNextLevel,
        total_expertise: totalExpertise,
        achievements_count: achievementsCount || 0,
        recent_activities: pet.recent_activities?.slice(0, 10) || []
      };

    } catch (error) {
      console.error('Error fetching user pet:', error);
      throw error;
    }
  }

  /**
   * Create a new pet for user
   */
  static async createPet(userId: string, options: PetCreationOptions): Promise<PetAdoptionResult> {
    try {
      // Check if user already has an active pet
      const existingPet = await this.getUserPet(userId);
      if (existingPet) {
        return {
          success: false,
          error_message: 'You already have an active pet. Only one pet is allowed at a time.'
        };
      }

      // Get species info to validate
      const { data: species, error: speciesError } = await supabase
        .from('pet_species')
        .select('*')
        .eq('id', options.species_id)
        .single();

      if (speciesError || !species) {
        return {
          success: false,
          error_message: 'Invalid pet species selected.'
        };
      }

      // Get the first evolution stage for this species
      const { data: firstStage, error: stageError } = await supabase
        .from('pet_evolution_stages')
        .select('*')
        .eq('species_id', options.species_id)
        .eq('stage_number', 1)
        .single();

      if (stageError || !firstStage) {
        return {
          success: false,
          error_message: 'Could not initialize pet evolution stage.'
        };
      }

      // Create the pet
      const petData: PetInsert = {
        user_id: userId,
        species_id: options.species_id,
        current_evolution_stage: firstStage.id,
        name: options.name,
        health: species.base_stats.health + (options.starter_bonuses?.health || 0),
        happiness: species.base_stats.happiness + (options.starter_bonuses?.happiness || 0),
        energy: species.base_stats.energy + (options.starter_bonuses?.energy || 0),
        total_experience: 0,
        level: 1,
        wine_knowledge_score: 0,
        regions_discovered: [],
        grape_varieties_tasted: [],
        countries_explored: [],
        rare_wines_encountered: 0,
        french_expertise: 0,
        italian_expertise: 0,
        spanish_expertise: 0,
        german_expertise: 0,
        new_world_expertise: 0,
        daily_streak: 0,
        longest_streak: 0,
        is_active: true,
        is_hungry: false,
        is_sleepy: false,
        mood: 'happy',
        battle_wins: 0,
        battle_losses: 0,
        prestige_points: 0
      };

      const { data: createdPet, error: createError } = await supabase
        .from('user_pets')
        .insert(petData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Award the "First Pet" achievement
      await this.awardAchievement(createdPet.id, 'first-pet-achievement');

      // Get the full pet details
      const petWithDetails = await this.getUserPet(userId);

      return {
        success: true,
        pet: petWithDetails || undefined,
        starter_achievements: ['First Pet']
      };

    } catch (error) {
      console.error('Error creating pet:', error);
      return {
        success: false,
        error_message: 'Failed to create pet. Please try again.'
      };
    }
  }

  /**
   * Process wine tasting and update pet
   */
  static async processWineTasting(petId: string, wineEntryId: string): Promise<void> {
    try {
      // Call the database function to process wine tasting
      const { error } = await supabase.rpc('process_wine_tasting_for_pet', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_wine_entry_id: wineEntryId
      });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error processing wine tasting for pet:', error);
      throw error;
    }
  }

  /**
   * Update pet stats manually (for interactions)
   */
  static async updatePetStats(petId: string, updates: Partial<PetRow>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_pets')
        .update(updates)
        .eq('id', petId);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error updating pet stats:', error);
      throw error;
    }
  }

  /**
   * Log pet activity
   */
  static async logPetActivity(activity: Omit<PetActivity, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('pet_activities')
        .insert(activity);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error logging pet activity:', error);
      throw error;
    }
  }

  /**
   * Get pet activities history
   */
  static async getPetActivities(petId: string, limit: number = 20): Promise<PetActivity[]> {
    try {
      const { data, error } = await supabase
        .from('pet_activities')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching pet activities:', error);
      throw error;
    }
  }

  /**
   * Get all pet species
   */
  static async getPetSpecies(): Promise<PetSpecies[]> {
    try {
      const { data, error } = await supabase
        .from('pet_species')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching pet species:', error);
      throw error;
    }
  }

  /**
   * Get evolution stages for a species
   */
  static async getEvolutionStages(speciesId?: string): Promise<PetEvolutionStage[]> {
    try {
      let query = supabase
        .from('pet_evolution_stages')
        .select('*')
        .order('species_id')
        .order('stage_number');

      if (speciesId) {
        query = query.eq('species_id', speciesId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching evolution stages:', error);
      throw error;
    }
  }

  /**
   * Evolve pet to next stage
   */
  static async evolvePet(petId: string, nextStageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_pets')
        .update({
          current_evolution_stage: nextStageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', petId);

      if (error) {
        throw error;
      }

      // Log evolution in history
      await supabase
        .from('pet_evolution_history')
        .insert({
          pet_id: petId,
          to_stage: nextStageId,
          trigger_data: { evolved_at: new Date().toISOString() }
        });

    } catch (error) {
      console.error('Error evolving pet:', error);
      throw error;
    }
  }

  /**
   * Get wine-pet growth mappings
   */
  static async getGrowthMappings(): Promise<WinePetGrowthMapping[]> {
    try {
      const { data, error } = await supabase
        .from('wine_pet_growth_mappings')
        .select('*');

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching growth mappings:', error);
      throw error;
    }
  }

  /**
   * Get pet achievements
   */
  static async getPetAchievements(): Promise<PetAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('pet_achievements')
        .select('*')
        .order('category')
        .order('rarity');

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching pet achievements:', error);
      throw error;
    }
  }

  /**
   * Get user's earned achievements
   */
  static async getUserPetAchievements(petId: string): Promise<UserPetAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_pet_achievements')
        .select(`
          *,
          achievement:pet_achievements(*)
        `)
        .eq('pet_id', petId)
        .order('earned_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching user pet achievements:', error);
      throw error;
    }
  }

  /**
   * Award achievement to pet
   */
  static async awardAchievement(petId: string, achievementId: string): Promise<void> {
    try {
      // Check if already earned
      const { data: existing } = await supabase
        .from('user_pet_achievements')
        .select('id')
        .eq('pet_id', petId)
        .eq('achievement_id', achievementId)
        .single();

      if (existing) {
        return; // Already earned
      }

      const { error } = await supabase
        .from('user_pet_achievements')
        .insert({
          pet_id: petId,
          achievement_id: achievementId
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error awarding achievement:', error);
      // Don't throw - achievements are not critical
    }
  }

  /**
   * Get pet care reminders
   */
  static async getCareReminders(petId: string): Promise<PetCareReminder[]> {
    try {
      const { data, error } = await supabase
        .from('pet_care_reminders')
        .select('*')
        .eq('pet_id', petId)
        .is('acknowledged_at', null)
        .order('scheduled_for');

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error fetching care reminders:', error);
      throw error;
    }
  }

  /**
   * Schedule care reminder
   */
  static async scheduleCareReminder(
    petId: string,
    reminderType: string,
    scheduledFor: Date
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('pet_care_reminders')
        .insert({
          pet_id: petId,
          reminder_type: reminderType,
          scheduled_for: scheduledFor.toISOString()
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error scheduling care reminder:', error);
      throw error;
    }
  }

  /**
   * Get pet leaderboard
   */
  static async getLeaderboard(
    category: 'level' | 'prestige' | 'wine_knowledge' | 'battle_wins',
    limit: number = 50
  ): Promise<PetLeaderboard> {
    try {
      let orderColumn: string;
      switch (category) {
        case 'level':
          orderColumn = 'level';
          break;
        case 'prestige':
          orderColumn = 'prestige_points';
          break;
        case 'wine_knowledge':
          orderColumn = 'wine_knowledge_score';
          break;
        case 'battle_wins':
          orderColumn = 'battle_wins';
          break;
      }

      const { data, error } = await supabase
        .from('user_pets')
        .select(`
          *,
          profiles(display_name, username),
          species:pet_species(name),
          current_stage:pet_evolution_stages!user_pets_current_evolution_stage_fkey(name)
        `)
        .eq('is_active', true)
        .order(orderColumn, { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const entries = (data || []).map((pet, index) => ({
        rank: index + 1,
        pet: {
          ...pet,
          experience_to_next_level: this.calculateExperienceToNextLevel(pet.level, pet.total_experience),
          total_expertise: pet.french_expertise + pet.italian_expertise + 
                          pet.spanish_expertise + pet.german_expertise + pet.new_world_expertise,
          achievements_count: 0
        },
        score: pet[orderColumn],
        user_display_name: pet.profiles?.display_name || pet.profiles?.username || 'Anonymous'
      }));

      return {
        category,
        entries,
        user_rank: undefined // Would need current user's pet to calculate
      };

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Find battle opponent
   */
  static async findBattleOpponent(petId: string): Promise<BattleMatchmakingResult | null> {
    try {
      // Get current pet stats
      const { data: currentPet, error: petError } = await supabase
        .from('user_pets')
        .select('level, prestige_points, battle_wins, user_id')
        .eq('id', petId)
        .single();

      if (petError || !currentPet) {
        throw new Error('Could not find your pet');
      }

      // Find pets with similar level and prestige
      const { data: opponents, error: opponentsError } = await supabase
        .from('user_pets')
        .select(`
          *,
          profiles(display_name, username),
          species:pet_species(name),
          current_stage:pet_evolution_stages!user_pets_current_evolution_stage_fkey(name)
        `)
        .eq('is_active', true)
        .neq('user_id', currentPet.user_id)
        .gte('level', currentPet.level - 3)
        .lte('level', currentPet.level + 3)
        .limit(10);

      if (opponentsError || !opponents || opponents.length === 0) {
        return null;
      }

      // Pick a random opponent
      const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];

      // Calculate win probability based on stats
      const levelDiff = currentPet.level - randomOpponent.level;
      const prestigeDiff = currentPet.prestige_points - randomOpponent.prestige_points;
      const winRateDiff = (currentPet.battle_wins || 0) - (randomOpponent.battle_wins || 0);

      let winProbability = 0.5; // Base 50%
      winProbability += levelDiff * 0.1; // ±10% per level difference
      winProbability += prestigeDiff * 0.001; // Small bonus for prestige
      winProbability += winRateDiff * 0.01; // Small bonus for experience

      // Clamp between 10% and 90%
      winProbability = Math.max(0.1, Math.min(0.9, winProbability));

      return {
        opponent_pet: {
          ...randomOpponent,
          experience_to_next_level: this.calculateExperienceToNextLevel(randomOpponent.level, randomOpponent.total_experience),
          total_expertise: randomOpponent.french_expertise + randomOpponent.italian_expertise + 
                          randomOpponent.spanish_expertise + randomOpponent.german_expertise + randomOpponent.new_world_expertise,
          achievements_count: 0
        },
        estimated_win_probability: winProbability,
        potential_rewards: {
          experience: Math.floor(20 + randomOpponent.level * 2),
          prestige: Math.floor(10 + randomOpponent.prestige_points * 0.1)
        },
        battle_preview: `Face ${randomOpponent.name}, a level ${randomOpponent.level} ${randomOpponent.species?.name || 'pet'}!`
      };

    } catch (error) {
      console.error('Error finding battle opponent:', error);
      throw error;
    }
  }

  /**
   * Run pet stat decay check (called periodically)
   */
  static async runStatDecay(): Promise<void> {
    try {
      // Use the database function to handle stat decay
      const { error } = await supabase.rpc('decay_pet_stats');

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error running stat decay:', error);
      throw error;
    }
  }

  /**
   * Helper: Calculate experience needed for next level
   */
  private static calculateExperienceToNextLevel(currentLevel: number, totalExperience: number): number {
    const nextLevelRequirement = (currentLevel * currentLevel) * 100;
    return Math.max(0, nextLevelRequirement - totalExperience);
  }
}

// Export individual functions for easier use
export const {
  getUserPet,
  createPet,
  processWineTasting,
  updatePetStats,
  logPetActivity,
  getPetActivities,
  getPetSpecies,
  getEvolutionStages,
  evolvePet,
  getGrowthMappings,
  getPetAchievements,
  getUserPetAchievements,
  awardAchievement,
  getCareReminders,
  scheduleCareReminder,
  getLeaderboard,
  findBattleOpponent,
  runStatDecay
} = PetAPI;