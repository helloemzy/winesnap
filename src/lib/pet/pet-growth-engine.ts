import { 
  UserPet, 
  WineTastingImpact, 
  PetInteractionResult, 
  PetFeedingResult,
  WinePetGrowthMapping,
  EvolutionCheckResult,
  PetEvolutionStage,
  PetMood,
  STAT_DECAY_RATES,
  PET_STAT_LIMITS,
  EXPERTISE_LIMITS,
  WINE_REGIONS
} from '@/types/pet';
import { WineTasting } from '@/types/wine';

/**
 * Core pet growth engine that handles all wine tasting to pet development mechanics
 */
export class PetGrowthEngine {
  /**
   * Calculate the impact of a wine tasting on pet growth
   */
  static calculateWineTastingImpact(
    pet: UserPet,
    wineTasting: WineTasting,
    growthMappings: WinePetGrowthMapping[]
  ): WineTastingImpact {
    // Find the best matching growth mapping
    const mapping = this.findBestGrowthMapping(wineTasting, growthMappings);
    
    // Calculate base experience
    let baseExperience = mapping?.base_experience || 10;
    
    // Calculate bonuses for new discoveries
    const newDiscoveries = this.calculateNewDiscoveries(pet, wineTasting);
    let bonusExperience = 0;
    
    // New region bonus
    if (newDiscoveries.regions.length > 0) {
      bonusExperience += 20 * newDiscoveries.regions.length;
    }
    
    // New country bonus
    if (newDiscoveries.countries.length > 0) {
      bonusExperience += 15 * newDiscoveries.countries.length;
    }
    
    // New grape variety bonus
    if (newDiscoveries.grape_varieties.length > 0) {
      bonusExperience += 10 * newDiscoveries.grape_varieties.length;
    }
    
    // Quality bonus
    const qualityBonus = this.getQualityExperienceBonus(wineTasting.quality_assessment);
    bonusExperience += qualityBonus;
    
    // Calculate stat effects
    const statEffects = {
      health: Math.max(0, (mapping?.health_effect || 5) + this.getQualityHealthBonus(wineTasting.quality_assessment)),
      happiness: Math.max(0, (mapping?.happiness_effect || 10) + this.getQualityHappinessBonus(wineTasting.quality_assessment)),
      energy: Math.max(0, (mapping?.energy_effect || 0) + this.getQualityEnergyBonus(wineTasting.quality_assessment))
    };
    
    // Calculate expertise gains
    const expertiseGains = this.calculateExpertiseGains(wineTasting, mapping);
    
    // Calculate rarity multiplier
    const rarityMultiplier = mapping?.rarity_multiplier || 1.0;
    
    // Special effects
    const specialEffects = this.calculateSpecialEffects(wineTasting, mapping, newDiscoveries);
    
    return {
      base_experience: baseExperience,
      bonus_experience: bonusExperience,
      stat_effects: statEffects,
      expertise_gains: expertiseGains,
      new_discoveries: newDiscoveries,
      rarity_multiplier: rarityMultiplier,
      special_effects: specialEffects
    };
  }
  
  /**
   * Apply wine tasting impact to pet and return feeding result
   */
  static applyWineTastingToPet(
    pet: UserPet,
    impact: WineTastingImpact
  ): PetFeedingResult {
    const totalExperience = Math.floor(
      (impact.base_experience + impact.bonus_experience) * impact.rarity_multiplier
    );
    
    // Update pet stats
    const newHealth = Math.min(PET_STAT_LIMITS.MAX, pet.health + impact.stat_effects.health);
    const newHappiness = Math.min(PET_STAT_LIMITS.MAX, pet.happiness + impact.stat_effects.happiness);
    const newEnergy = Math.min(PET_STAT_LIMITS.MAX, pet.energy + impact.stat_effects.energy);
    
    // Calculate new mood based on happiness
    const newMood = this.calculateMoodFromHappiness(newHappiness);
    
    // Update wine-specific stats
    const newWineKnowledgeScore = pet.wine_knowledge_score + Math.floor(totalExperience / 2);
    
    // Update expertise scores
    const newExpertiseScores = {
      french_expertise: Math.min(EXPERTISE_LIMITS.MAX, pet.french_expertise + (impact.expertise_gains.french_expertise || 0)),
      italian_expertise: Math.min(EXPERTISE_LIMITS.MAX, pet.italian_expertise + (impact.expertise_gains.italian_expertise || 0)),
      spanish_expertise: Math.min(EXPERTISE_LIMITS.MAX, pet.spanish_expertise + (impact.expertise_gains.spanish_expertise || 0)),
      german_expertise: Math.min(EXPERTISE_LIMITS.MAX, pet.german_expertise + (impact.expertise_gains.german_expertise || 0)),
      new_world_expertise: Math.min(EXPERTISE_LIMITS.MAX, pet.new_world_expertise + (impact.expertise_gains.new_world_expertise || 0))
    };
    
    // Check for level up
    const newTotalExperience = pet.total_experience + totalExperience;
    const newLevel = this.calculateLevelFromExperience(newTotalExperience);
    const leveledUp = newLevel > pet.level;
    
    // Update discovery arrays
    const newRegionsDiscovered = [...new Set([...pet.regions_discovered, ...impact.new_discoveries.regions])];
    const newCountriesExplored = [...new Set([...pet.countries_explored, ...impact.new_discoveries.countries])];
    const newGrapeVarietiesTasted = [...new Set([...pet.grape_varieties_tasted, ...impact.new_discoveries.grape_varieties])];
    
    return {
      success: true,
      message: this.generateFeedingMessage(impact, leveledUp),
      stats_changed: {
        health: impact.stat_effects.health,
        happiness: impact.stat_effects.happiness,
        energy: impact.stat_effects.energy
      },
      experience_gained: totalExperience,
      mood_change: newMood !== pet.mood ? newMood : undefined,
      achievements_unlocked: [], // This would be calculated by achievement engine
      evolution_triggered: false, // This would be calculated by evolution engine
      wine_discovery_bonus: impact.new_discoveries.regions.length > 0 || 
                            impact.new_discoveries.countries.length > 0 || 
                            impact.new_discoveries.grape_varieties.length > 0,
      new_regions_discovered: impact.new_discoveries.regions,
      new_countries_explored: impact.new_discoveries.countries,
      expertise_gains: impact.expertise_gains
    };
  }
  
  /**
   * Calculate pet stat decay over time
   */
  static calculateStatDecay(pet: UserPet, hoursElapsed: number): Partial<UserPet> {
    const daysFraction = hoursElapsed / 24;
    
    const healthDecay = Math.floor(STAT_DECAY_RATES.HEALTH * daysFraction);
    const happinessDecay = Math.floor(STAT_DECAY_RATES.HAPPINESS * daysFraction);
    const energyDecay = Math.floor(STAT_DECAY_RATES.ENERGY * daysFraction);
    
    const newHealth = Math.max(PET_STAT_LIMITS.MIN, pet.health - healthDecay);
    const newHappiness = Math.max(PET_STAT_LIMITS.MIN, pet.happiness - happinessDecay);
    const newEnergy = Math.max(PET_STAT_LIMITS.MIN, pet.energy - energyDecay);
    
    const newMood = this.calculateMoodFromHappiness(newHappiness);
    const isHungry = hoursElapsed > 24;
    const isSleepy = hoursElapsed > 48;
    
    return {
      health: newHealth,
      happiness: newHappiness,
      energy: newEnergy,
      mood: newMood,
      is_hungry: isHungry,
      is_sleepy: isSleepy
    };
  }
  
  /**
   * Check if pet can evolve
   */
  static checkEvolutionRequirements(
    pet: UserPet,
    evolutionStages: PetEvolutionStage[]
  ): EvolutionCheckResult {
    // Find the next evolution stage
    const currentStage = evolutionStages.find(stage => stage.id === pet.current_evolution_stage);
    if (!currentStage) {
      return { can_evolve: false };
    }
    
    const nextStage = evolutionStages.find(
      stage => stage.species_id === currentStage.species_id && 
               stage.stage_number === currentStage.stage_number + 1
    );
    
    if (!nextStage) {
      return { can_evolve: false }; // Already at maximum evolution
    }
    
    // Check requirements
    const requirements = nextStage.evolution_requirements || {};
    const missingRequirements: Record<string, any> = {};
    
    // Check level requirement
    if (requirements.level && pet.level < requirements.level) {
      missingRequirements.level = requirements.level - pet.level;
    }
    
    // Check regions discovered requirement
    if (requirements.regions_discovered && pet.regions_discovered.length < requirements.regions_discovered) {
      missingRequirements.regions_discovered = requirements.regions_discovered - pet.regions_discovered.length;
    }
    
    // Check rare wines requirement
    if (requirements.rare_wines && pet.rare_wines_encountered < requirements.rare_wines) {
      missingRequirements.rare_wines = requirements.rare_wines - pet.rare_wines_encountered;
    }
    
    // Check total expertise requirement
    if (requirements.total_expertise) {
      const totalExpertise = pet.french_expertise + pet.italian_expertise + 
                           pet.spanish_expertise + pet.german_expertise + pet.new_world_expertise;
      if (totalExpertise < requirements.total_expertise) {
        missingRequirements.total_expertise = requirements.total_expertise - totalExpertise;
      }
    }
    
    const canEvolve = Object.keys(missingRequirements).length === 0;
    
    return {
      can_evolve: canEvolve,
      next_stage: nextStage,
      missing_requirements: canEvolve ? undefined : missingRequirements,
      evolution_story: canEvolve ? this.generateEvolutionStory(currentStage, nextStage) : undefined
    };
  }
  
  /**
   * Private helper methods
   */
  private static findBestGrowthMapping(
    wineTasting: WineTasting,
    mappings: WinePetGrowthMapping[]
  ): WinePetGrowthMapping | undefined {
    // Score mappings based on how well they match the wine
    const scoredMappings = mappings.map(mapping => {
      let score = 0;
      
      // Exact region match gets highest priority
      if (mapping.wine_region === wineTasting.region) score += 10;
      
      // Country match gets medium priority
      if (mapping.wine_country === wineTasting.country) score += 5;
      
      // Quality level match
      if (mapping.quality_level === wineTasting.quality_assessment) score += 3;
      
      // Grape variety match (if the mapping specifies one)
      if (mapping.grape_variety && wineTasting.grape_varieties?.includes(mapping.grape_variety)) {
        score += 2;
      }
      
      return { mapping, score };
    });
    
    // Sort by score and return the best match
    scoredMappings.sort((a, b) => b.score - a.score);
    return scoredMappings[0]?.mapping;
  }
  
  private static calculateNewDiscoveries(pet: UserPet, wineTasting: WineTasting) {
    const discoveries = {
      regions: [] as string[],
      countries: [] as string[],
      grape_varieties: [] as string[]
    };
    
    // Check for new region
    if (wineTasting.region && !pet.regions_discovered.includes(wineTasting.region)) {
      discoveries.regions.push(wineTasting.region);
    }
    
    // Check for new country
    if (wineTasting.country && !pet.countries_explored.includes(wineTasting.country)) {
      discoveries.countries.push(wineTasting.country);
    }
    
    // Check for new grape varieties
    if (wineTasting.grape_varieties) {
      const newGrapes = wineTasting.grape_varieties.filter(
        grape => !pet.grape_varieties_tasted.includes(grape)
      );
      discoveries.grape_varieties.push(...newGrapes);
    }
    
    return discoveries;
  }
  
  private static getQualityExperienceBonus(quality: string): number {
    switch (quality) {
      case 'outstanding': return 25;
      case 'very good': return 15;
      case 'good': return 10;
      case 'acceptable': return 5;
      case 'poor': return -5;
      case 'faulty': return -10;
      default: return 0;
    }
  }
  
  private static getQualityHealthBonus(quality: string): number {
    switch (quality) {
      case 'outstanding': return 5;
      case 'very good': return 3;
      case 'good': return 2;
      case 'acceptable': return 1;
      case 'poor': return -2;
      case 'faulty': return -5;
      default: return 0;
    }
  }
  
  private static getQualityHappinessBonus(quality: string): number {
    switch (quality) {
      case 'outstanding': return 15;
      case 'very good': return 10;
      case 'good': return 5;
      case 'acceptable': return 3;
      case 'poor': return -5;
      case 'faulty': return -10;
      default: return 0;
    }
  }
  
  private static getQualityEnergyBonus(quality: string): number {
    switch (quality) {
      case 'outstanding': return 5;
      case 'very good': return 3;
      case 'good': return 2;
      case 'acceptable': return 1;
      default: return 0;
    }
  }
  
  private static calculateExpertiseGains(
    wineTasting: WineTasting,
    mapping: WinePetGrowthMapping | undefined
  ): Record<string, number> {
    const gains: Record<string, number> = {
      french_expertise: 0,
      italian_expertise: 0,
      spanish_expertise: 0,
      german_expertise: 0,
      new_world_expertise: 0
    };
    
    if (!wineTasting.country) return gains;
    
    // Base expertise gain based on country
    const baseGain = 5;
    
    if (wineTasting.country === 'France') {
      gains.french_expertise = mapping?.french_expertise_bonus || baseGain;
    } else if (wineTasting.country === 'Italy') {
      gains.italian_expertise = mapping?.italian_expertise_bonus || baseGain;
    } else if (wineTasting.country === 'Spain') {
      gains.spanish_expertise = mapping?.spanish_expertise_bonus || baseGain;
    } else if (wineTasting.country === 'Germany') {
      gains.german_expertise = mapping?.german_expertise_bonus || baseGain;
    } else if (['United States', 'Australia', 'New Zealand', 'South Africa', 'Chile', 'Argentina'].includes(wineTasting.country)) {
      gains.new_world_expertise = mapping?.new_world_expertise_bonus || baseGain;
    }
    
    return gains;
  }
  
  private static calculateSpecialEffects(
    wineTasting: WineTasting,
    mapping: WinePetGrowthMapping | undefined,
    newDiscoveries: { regions: string[]; countries: string[]; grape_varieties: string[] }
  ): string[] {
    const effects: string[] = [];
    
    // Quality-based effects
    if (wineTasting.quality_assessment === 'outstanding') {
      effects.push('Your pet was amazed by this exceptional wine!');
    }
    
    // New discovery effects
    if (newDiscoveries.regions.length > 0) {
      effects.push(`Discovered ${newDiscoveries.regions.length} new wine region(s)!`);
    }
    
    if (newDiscoveries.countries.length > 0) {
      effects.push(`Explored ${newDiscoveries.countries.length} new wine country(ies)!`);
    }
    
    // Evolution catalyst
    if (mapping?.evolution_catalyst) {
      effects.push('This wine has mysterious properties that may trigger evolution...');
    }
    
    // Rarity multiplier effects
    if (mapping && mapping.rarity_multiplier > 1.5) {
      effects.push('This rare wine provided extraordinary growth benefits!');
    }
    
    return effects;
  }
  
  private static calculateMoodFromHappiness(happiness: number): PetMood {
    if (happiness >= 90) return 'ecstatic';
    if (happiness >= 70) return 'very_happy';
    if (happiness >= 50) return 'happy';
    if (happiness >= 30) return 'neutral';
    if (happiness >= 10) return 'sad';
    return 'very_sad';
  }
  
  private static calculateLevelFromExperience(experience: number): number {
    // Level formula: level = floor(sqrt(experience / 100)) + 1
    // This means: Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }
  
  private static generateFeedingMessage(impact: WineTastingImpact, leveledUp: boolean): string {
    const messages = [];
    
    if (leveledUp) {
      messages.push("🎉 Your pet leveled up!");
    }
    
    if (impact.new_discoveries.regions.length > 0) {
      messages.push(`🗺️ Discovered ${impact.new_discoveries.regions.join(', ')}!`);
    }
    
    if (impact.bonus_experience > 20) {
      messages.push("⭐ Your pet gained exceptional experience from this tasting!");
    } else if (impact.bonus_experience > 10) {
      messages.push("🌟 Your pet learned something new from this wine!");
    }
    
    if (impact.stat_effects.happiness > 15) {
      messages.push("😊 Your pet absolutely loved this wine!");
    } else if (impact.stat_effects.happiness > 5) {
      messages.push("🙂 Your pet enjoyed this tasting!");
    }
    
    return messages.length > 0 ? messages.join(' ') : "Your pet appreciated this wine tasting.";
  }
  
  private static generateEvolutionStory(currentStage: PetEvolutionStage, nextStage: PetEvolutionStage): string {
    return `Your ${currentStage.name} is ready to evolve into a ${nextStage.name}! Through dedicated wine exploration and growing expertise, your pet has reached a new level of sophistication. This evolution will unlock new abilities and enhance your pet's connection to the world of wine.`;
  }
}