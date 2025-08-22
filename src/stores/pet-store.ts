import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  UserPet, 
  UserPetWithDetails,
  PetActivity,
  PetEvolutionStage,
  PetSpecies,
  PetCareStatus,
  PetFeedingResult,
  PetInteractionResult,
  EvolutionCheckResult,
  PetLeaderboard,
  BattleMatchmakingResult,
  WinePetGrowthMapping,
  PetAchievement,
  UserPetAchievement,
  PetCareReminder
} from '@/types/pet';
import { WineTasting } from '@/types/wine';
import { PetGrowthEngine } from '@/lib/pet/pet-growth-engine';

interface PetState {
  // Current user's pet
  currentPet: UserPetWithDetails | null;
  
  // Static data
  petSpecies: PetSpecies[];
  evolutionStages: PetEvolutionStage[];
  growthMappings: WinePetGrowthMapping[];
  achievements: PetAchievement[];
  
  // Pet activities and history
  recentActivities: PetActivity[];
  evolutionHistory: any[];
  earnedAchievements: UserPetAchievement[];
  
  // Social features
  leaderboards: Record<string, PetLeaderboard>;
  nearbyPets: UserPetWithDetails[];
  
  // Care and reminders
  careStatus: PetCareStatus | null;
  pendingReminders: PetCareReminder[];
  
  // UI state
  isLoading: boolean;
  lastUpdated: Date | null;
  offlineQueue: any[];
  
  // Actions
  loadPetData: (userId: string) => Promise<void>;
  createPet: (speciesId: string, name: string) => Promise<void>;
  feedPetWithWine: (wineTasting: WineTasting) => Promise<PetFeedingResult>;
  interactWithPet: (interactionType: string) => Promise<PetInteractionResult>;
  checkEvolution: () => EvolutionCheckResult;
  evolvePet: () => Promise<boolean>;
  updatePetStats: () => Promise<void>;
  
  // Social actions
  battlePet: (opponentPetId: string) => Promise<void>;
  findBattleOpponent: () => Promise<BattleMatchmakingResult>;
  viewLeaderboard: (category: string) => Promise<PetLeaderboard>;
  
  // Care actions
  checkCareNeeds: () => PetCareStatus;
  scheduleCareReminder: (type: string, time: Date) => Promise<void>;
  acknowledgeCareReminder: (reminderId: string) => Promise<void>;
  
  // Offline actions
  queueOfflineAction: (action: any) => void;
  syncOfflineActions: () => Promise<void>;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPet: null,
      petSpecies: [],
      evolutionStages: [],
      growthMappings: [],
      achievements: [],
      recentActivities: [],
      evolutionHistory: [],
      earnedAchievements: [],
      leaderboards: {},
      nearbyPets: [],
      careStatus: null,
      pendingReminders: [],
      isLoading: false,
      lastUpdated: null,
      offlineQueue: [],
      
      // Load all pet-related data for a user
      loadPetData: async (userId: string) => {
        set({ isLoading: true });
        
        try {
          // This would make API calls to load pet data
          // For now, we'll simulate the data structure
          
          const mockPet: UserPetWithDetails = {
            id: 'pet-1',
            user_id: userId,
            species_id: 'species-1',
            current_evolution_stage: 'stage-1',
            name: 'Vino',
            health: 85,
            happiness: 92,
            energy: 78,
            total_experience: 1250,
            level: 8,
            wine_knowledge_score: 340,
            regions_discovered: ['Bordeaux', 'Tuscany', 'Napa Valley'],
            grape_varieties_tasted: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir'],
            countries_explored: ['France', 'Italy', 'United States'],
            rare_wines_encountered: 3,
            french_expertise: 45,
            italian_expertise: 30,
            spanish_expertise: 15,
            german_expertise: 10,
            new_world_expertise: 25,
            last_fed_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString(),
            daily_streak: 5,
            longest_streak: 12,
            is_active: true,
            is_hungry: false,
            is_sleepy: false,
            mood: 'very_happy',
            battle_wins: 2,
            battle_losses: 1,
            prestige_points: 150,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            experience_to_next_level: 350,
            total_expertise: 125,
            achievements_count: 8,
            species: {
              id: 'species-1',
              name: 'Grape Guardian',
              description: 'A loyal companion that grows stronger with every wine discovery',
              base_stats: { health: 100, happiness: 90, energy: 100 },
              rarity: 'common',
              created_at: new Date().toISOString()
            }
          };
          
          // Calculate care status
          const careStatus = get().checkCareNeeds();
          
          set({
            currentPet: mockPet,
            careStatus,
            lastUpdated: new Date(),
            isLoading: false
          });
          
        } catch (error) {
          console.error('Failed to load pet data:', error);
          set({ isLoading: false });
        }
      },
      
      // Create a new pet
      createPet: async (speciesId: string, name: string) => {
        set({ isLoading: true });
        
        try {
          // API call to create pet would go here
          // For now, simulate pet creation
          console.log('Creating pet:', { speciesId, name });
          
          // After successful creation, reload pet data
          await get().loadPetData('current-user-id');
          
        } catch (error) {
          console.error('Failed to create pet:', error);
          set({ isLoading: false });
        }
      },
      
      // Feed pet with wine tasting
      feedPetWithWine: async (wineTasting: WineTasting) => {
        const { currentPet, growthMappings } = get();
        
        if (!currentPet) {
          throw new Error('No active pet found');
        }
        
        try {
          // Calculate the impact
          const impact = PetGrowthEngine.calculateWineTastingImpact(
            currentPet, 
            wineTasting, 
            growthMappings
          );
          
          // Apply the impact
          const result = PetGrowthEngine.applyWineTastingToPet(currentPet, impact);
          
          // Update pet state
          const updatedPet = {
            ...currentPet,
            health: Math.min(100, currentPet.health + impact.stat_effects.health),
            happiness: Math.min(100, currentPet.happiness + impact.stat_effects.happiness),
            energy: Math.min(100, currentPet.energy + impact.stat_effects.energy),
            total_experience: currentPet.total_experience + result.experience_gained,
            wine_knowledge_score: currentPet.wine_knowledge_score + Math.floor(result.experience_gained / 2),
            regions_discovered: [...new Set([...currentPet.regions_discovered, ...result.new_regions_discovered])],
            countries_explored: [...new Set([...currentPet.countries_explored, ...result.new_countries_explored])],
            last_fed_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString(),
            is_hungry: false,
            mood: result.mood_change || currentPet.mood
          };
          
          // Add activity log
          const newActivity: PetActivity = {
            id: `activity-${Date.now()}`,
            pet_id: currentPet.id,
            activity_type: 'wine_tasting',
            wine_entry_id: wineTasting.id,
            experience_gained: result.experience_gained,
            stats_changed: result.stats_changed,
            metadata: {
              wine_name: wineTasting.wine_name,
              wine_quality: wineTasting.quality_assessment,
              new_discoveries: {
                regions: result.new_regions_discovered,
                countries: result.new_countries_explored
              }
            },
            created_at: new Date().toISOString()
          };
          
          set(state => ({
            currentPet: updatedPet,
            recentActivities: [newActivity, ...state.recentActivities.slice(0, 19)], // Keep last 20 activities
            careStatus: get().checkCareNeeds(),
            lastUpdated: new Date()
          }));
          
          return result;
          
        } catch (error) {
          console.error('Failed to feed pet with wine:', error);
          throw error;
        }
      },
      
      // Generic pet interaction
      interactWithPet: async (interactionType: string) => {
        const { currentPet } = get();
        
        if (!currentPet) {
          throw new Error('No active pet found');
        }
        
        try {
          // Simulate interaction effects based on type
          let statsChange = { health: 0, happiness: 0, energy: 0 };
          let experienceGained = 5;
          let message = '';
          
          switch (interactionType) {
            case 'pet':
              statsChange.happiness = 10;
              message = 'Your pet loved the attention!';
              break;
            case 'play':
              statsChange.happiness = 15;
              statsChange.energy = -5;
              experienceGained = 8;
              message = 'Your pet had fun playing!';
              break;
            case 'rest':
              statsChange.energy = 20;
              message = 'Your pet feels refreshed!';
              break;
            default:
              statsChange.happiness = 5;
              message = 'Your pet enjoyed the interaction!';
          }
          
          // Update pet stats
          const updatedPet = {
            ...currentPet,
            health: Math.max(0, Math.min(100, currentPet.health + statsChange.health)),
            happiness: Math.max(0, Math.min(100, currentPet.happiness + statsChange.happiness)),
            energy: Math.max(0, Math.min(100, currentPet.energy + statsChange.energy)),
            total_experience: currentPet.total_experience + experienceGained,
            last_interaction_at: new Date().toISOString()
          };
          
          // Add activity log
          const newActivity: PetActivity = {
            id: `activity-${Date.now()}`,
            pet_id: currentPet.id,
            activity_type: 'interaction',
            experience_gained: experienceGained,
            stats_changed: statsChange,
            metadata: { interaction_type: interactionType },
            created_at: new Date().toISOString()
          };
          
          set(state => ({
            currentPet: updatedPet,
            recentActivities: [newActivity, ...state.recentActivities.slice(0, 19)],
            careStatus: get().checkCareNeeds(),
            lastUpdated: new Date()
          }));
          
          const result: PetInteractionResult = {
            success: true,
            message,
            stats_changed: statsChange,
            experience_gained: experienceGained,
            achievements_unlocked: [],
            evolution_triggered: false
          };
          
          return result;
          
        } catch (error) {
          console.error('Failed to interact with pet:', error);
          throw error;
        }
      },
      
      // Check if pet can evolve
      checkEvolution: () => {
        const { currentPet, evolutionStages } = get();
        
        if (!currentPet) {
          return { can_evolve: false };
        }
        
        return PetGrowthEngine.checkEvolutionRequirements(currentPet, evolutionStages);
      },
      
      // Evolve pet
      evolvePet: async () => {
        const { currentPet, evolutionStages } = get();
        
        if (!currentPet) {
          return false;
        }
        
        const evolutionCheck = PetGrowthEngine.checkEvolutionRequirements(currentPet, evolutionStages);
        
        if (!evolutionCheck.can_evolve || !evolutionCheck.next_stage) {
          return false;
        }
        
        try {
          // Update pet to next evolution stage
          const evolvedPet = {
            ...currentPet,
            current_evolution_stage: evolutionCheck.next_stage.id,
            current_stage: evolutionCheck.next_stage
          };
          
          // Add evolution activity
          const evolutionActivity: PetActivity = {
            id: `evolution-${Date.now()}`,
            pet_id: currentPet.id,
            activity_type: 'evolution',
            experience_gained: 100,
            stats_changed: { health: 10, happiness: 25, energy: 10 },
            metadata: {
              from_stage: currentPet.current_evolution_stage,
              to_stage: evolutionCheck.next_stage.id,
              evolution_story: evolutionCheck.evolution_story
            },
            created_at: new Date().toISOString()
          };
          
          set(state => ({
            currentPet: evolvedPet,
            recentActivities: [evolutionActivity, ...state.recentActivities.slice(0, 19)],
            evolutionHistory: [...state.evolutionHistory, evolutionActivity],
            lastUpdated: new Date()
          }));
          
          return true;
          
        } catch (error) {
          console.error('Failed to evolve pet:', error);
          return false;
        }
      },
      
      // Update pet stats (handle decay)
      updatePetStats: async () => {
        const { currentPet } = get();
        
        if (!currentPet) {
          return;
        }
        
        try {
          const now = new Date();
          const lastInteraction = new Date(currentPet.last_interaction_at);
          const hoursElapsed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
          
          // Calculate stat decay
          const statChanges = PetGrowthEngine.calculateStatDecay(currentPet, hoursElapsed);
          
          if (Object.keys(statChanges).length > 0) {
            const updatedPet = {
              ...currentPet,
              ...statChanges
            };
            
            set({
              currentPet: updatedPet,
              careStatus: get().checkCareNeeds(),
              lastUpdated: now
            });
          }
          
        } catch (error) {
          console.error('Failed to update pet stats:', error);
        }
      },
      
      // Battle matchmaking
      findBattleOpponent: async () => {
        // Simulate finding an opponent
        return {
          opponent_pet: {} as UserPetWithDetails,
          estimated_win_probability: 0.6,
          potential_rewards: { experience: 50, prestige: 20 },
          battle_preview: 'A challenging opponent awaits!'
        };
      },
      
      // Battle pet
      battlePet: async (opponentPetId: string) => {
        console.log('Starting battle with pet:', opponentPetId);
        // Battle logic would go here
      },
      
      // View leaderboard
      viewLeaderboard: async (category: string) => {
        // Simulate leaderboard data
        return {
          category: category as any,
          entries: [],
          user_rank: 42
        };
      },
      
      // Check care needs
      checkCareNeeds: () => {
        const { currentPet } = get();
        
        if (!currentPet) {
          return {
            needs_feeding: false,
            needs_interaction: false,
            hours_since_last_care: 0,
            mood_trend: 'stable' as const,
            upcoming_reminders: [],
            recommended_actions: []
          };
        }
        
        const now = new Date();
        const lastInteraction = new Date(currentPet.last_interaction_at);
        const hoursElapsed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
        
        const needsFeeding = hoursElapsed > 24 || currentPet.is_hungry;
        const needsInteraction = hoursElapsed > 12;
        
        const recommendedActions = [];
        if (needsFeeding) recommendedActions.push('Feed your pet with a wine tasting');
        if (needsInteraction) recommendedActions.push('Spend time interacting with your pet');
        if (currentPet.energy < 30) recommendedActions.push('Let your pet rest');
        
        return {
          needs_feeding: needsFeeding,
          needs_interaction: needsInteraction,
          hours_since_last_care: hoursElapsed,
          mood_trend: currentPet.happiness > 70 ? 'improving' : currentPet.happiness < 30 ? 'declining' : 'stable',
          upcoming_reminders: get().pendingReminders,
          recommended_actions: recommendedActions
        };
      },
      
      // Schedule care reminder
      scheduleCareReminder: async (type: string, time: Date) => {
        const reminder: PetCareReminder = {
          id: `reminder-${Date.now()}`,
          pet_id: get().currentPet?.id || '',
          reminder_type: type as any,
          scheduled_for: time.toISOString(),
          created_at: new Date().toISOString()
        };
        
        set(state => ({
          pendingReminders: [...state.pendingReminders, reminder]
        }));
      },
      
      // Acknowledge care reminder
      acknowledgeCareReminder: async (reminderId: string) => {
        set(state => ({
          pendingReminders: state.pendingReminders.filter(r => r.id !== reminderId)
        }));
      },
      
      // Queue offline action
      queueOfflineAction: (action: any) => {
        set(state => ({
          offlineQueue: [...state.offlineQueue, { ...action, timestamp: Date.now() }]
        }));
      },
      
      // Sync offline actions
      syncOfflineActions: async () => {
        const { offlineQueue } = get();
        
        if (offlineQueue.length === 0) {
          return;
        }
        
        try {
          // Process each queued action
          for (const action of offlineQueue) {
            // Process action based on type
            console.log('Processing offline action:', action);
          }
          
          // Clear the queue after successful sync
          set({ offlineQueue: [] });
          
        } catch (error) {
          console.error('Failed to sync offline actions:', error);
        }
      }
    }),
    {
      name: 'pet-storage',
      partialize: (state) => ({
        currentPet: state.currentPet,
        recentActivities: state.recentActivities.slice(0, 10), // Only persist recent activities
        earnedAchievements: state.earnedAchievements,
        offlineQueue: state.offlineQueue,
        lastUpdated: state.lastUpdated
      })
    }
  )
);