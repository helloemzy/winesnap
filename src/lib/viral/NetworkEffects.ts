// Network Effects Implementation
// Systems that make WineSnap more valuable with more active friends

import { UserPetWithDetails } from '@/types/pet';
import { viralAnalytics } from './ViralAnalytics';

export interface NetworkUser {
  id: string;
  displayName: string;
  pet?: UserPetWithDetails;
  lastActive: string;
  wineDiscoveries: number;
  region_expertise: Record<string, number>;
  achievements: number;
  isOnline: boolean;
  relationshipLevel: 'acquaintance' | 'friend' | 'close_friend' | 'wine_buddy';
}

export interface NetworkBenefits {
  discoveryRateMultiplier: number;
  evolutionSpeedBonus: number;
  battleMatchmakingQuality: number;
  exclusiveContentAccess: boolean;
  expertiseSharingBonus: number;
  collaborativeRewards: number;
}

export interface CollaborativeActivity {
  id: string;
  type: 'group_discovery' | 'wine_hunt' | 'study_session' | 'tasting_party';
  title: string;
  description: string;
  participants: NetworkUser[];
  required_participants: number;
  max_participants: number;
  rewards: {
    experience_multiplier: number;
    prestige_bonus: number;
    exclusive_rewards: string[];
  };
  duration_hours: number;
  created_at: string;
  starts_at: string;
}

export class NetworkEffectsEngine {
  private networkCache: Map<string, NetworkUser[]> = new Map();
  private benefitsCache: Map<string, NetworkBenefits> = new Map();
  
  // Calculate network benefits based on active friends
  calculateNetworkBenefits(userId: string, network: NetworkUser[]): NetworkBenefits {
    const cacheKey = `${userId}_${network.length}_${Date.now()}`;
    
    if (this.benefitsCache.has(cacheKey)) {
      return this.benefitsCache.get(cacheKey)!;
    }
    
    const activeFriends = network.filter(user => this.isActiveUser(user));
    const closeFriends = activeFriends.filter(user => user.relationshipLevel === 'wine_buddy');
    const totalExpertise = activeFriends.reduce((sum, user) => 
      sum + Object.values(user.region_expertise).reduce((a, b) => a + b, 0), 0
    );
    
    const networkSize = activeFriends.length;
    const avgExpertise = networkSize > 0 ? totalExpertise / networkSize : 0;
    
    // Base multipliers scale with network size
    const baseDiscoveryMultiplier = this.calculateDiscoveryMultiplier(networkSize, closeFriends.length);
    const evolutionBonus = this.calculateEvolutionBonus(networkSize, avgExpertise);
    const matchmakingQuality = this.calculateMatchmakingQuality(networkSize);
    
    const benefits: NetworkBenefits = {
      discoveryRateMultiplier: baseDiscoveryMultiplier,
      evolutionSpeedBonus: evolutionBonus,
      battleMatchmakingQuality: matchmakingQuality,
      exclusiveContentAccess: networkSize >= 5,
      expertiseSharingBonus: this.calculateExpertiseSharing(activeFriends),
      collaborativeRewards: this.calculateCollaborativeBonus(networkSize)
    };
    
    this.benefitsCache.set(cacheKey, benefits);
    
    // Track network effects for analytics
    viralAnalytics.trackViralEvent({
      event_type: 'network_milestone',
      user_id: userId,
      network_size: networkSize,
      active_friends: activeFriends.length,
      content_metadata: {
        close_friends: closeFriends.length,
        avg_expertise: Math.round(avgExpertise),
        discovery_multiplier: baseDiscoveryMultiplier,
        has_exclusive_access: benefits.exclusiveContentAccess
      }
    });
    
    return benefits;
  }

  private calculateDiscoveryMultiplier(networkSize: number, closeFriends: number): number {
    // Base formula: 1.0 + (networkSize * 0.05) + (closeFriends * 0.1)
    // Capped at 2.5x for solo discovery rate
    const baseBonus = Math.min(networkSize * 0.05, 0.75); // Max 0.75x from network size
    const closeBonus = Math.min(closeFriends * 0.1, 1.0); // Max 1.0x from close friends
    
    return Math.min(1.0 + baseBonus + closeBonus, 2.5);
  }

  private calculateEvolutionBonus(networkSize: number, avgExpertise: number): number {
    // Evolution speed increases with both network size and network quality
    const sizeBonus = Math.min(networkSize * 0.03, 0.5); // Max 0.5x from size
    const expertiseBonus = Math.min(avgExpertise / 1000, 0.5); // Max 0.5x from expertise
    
    return Math.min(sizeBonus + expertiseBonus, 1.0); // Max 100% evolution speed bonus
  }

  private calculateMatchmakingQuality(networkSize: number): number {
    // Quality improves with network size, affects battle opponent matching
    if (networkSize < 3) return 0.6; // Limited to AI opponents
    if (networkSize < 6) return 0.8; // Some friend-of-friend matching
    if (networkSize < 12) return 0.9; // Good friend network matching
    return 1.0; // Perfect matchmaking with tournaments
  }

  private calculateExpertiseSharing(activeFriends: NetworkUser[]): number {
    // Bonus based on complementary expertise in network
    const expertiseMap = new Map<string, number>();
    
    activeFriends.forEach(friend => {
      Object.entries(friend.region_expertise).forEach(([region, level]) => {
        expertiseMap.set(region, Math.max(expertiseMap.get(region) || 0, level));
      });
    });
    
    const totalNetworkExpertise = Array.from(expertiseMap.values()).reduce((a, b) => a + b, 0);
    return Math.min(totalNetworkExpertise / 500, 0.5); // Max 0.5x bonus from network expertise
  }

  private calculateCollaborativeBonus(networkSize: number): number {
    // Bonus rewards for collaborative activities
    if (networkSize < 3) return 0;
    if (networkSize < 6) return 0.2;
    if (networkSize < 12) return 0.4;
    return 0.6; // Max 60% bonus rewards for collaborative activities
  }

  private isActiveUser(user: NetworkUser): boolean {
    const lastActive = new Date(user.lastActive);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastActive > weekAgo;
  }

  // Generate collaborative activities based on network
  generateCollaborativeActivities(userId: string, network: NetworkUser[]): CollaborativeActivity[] {
    const activeFriends = network.filter(user => this.isActiveUser(user));
    const activities: CollaborativeActivity[] = [];
    
    if (activeFriends.length >= 3) {
      activities.push(this.createWineHuntActivity(activeFriends.slice(0, 5)));
    }
    
    if (activeFriends.length >= 2) {
      activities.push(this.createStudySessionActivity(activeFriends.slice(0, 4)));
    }
    
    if (activeFriends.length >= 4) {
      activities.push(this.createTastingPartyActivity(activeFriends.slice(0, 8)));
    }
    
    return activities;
  }

  private createWineHuntActivity(participants: NetworkUser[]): CollaborativeActivity {
    return {
      id: `wine_hunt_${Date.now()}`,
      type: 'wine_hunt',
      title: 'Regional Wine Hunt',
      description: 'Team up to discover rare wines from a specific region. Shared discoveries count for everyone!',
      participants,
      required_participants: 3,
      max_participants: 5,
      rewards: {
        experience_multiplier: 1.5,
        prestige_bonus: 200,
        exclusive_rewards: ['Collaborative Hunter Badge', 'Team Discovery Boost (7 days)']
      },
      duration_hours: 72,
      created_at: new Date().toISOString(),
      starts_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // Starts in 1 hour
    };
  }

  private createStudySessionActivity(participants: NetworkUser[]): CollaborativeActivity {
    return {
      id: `study_session_${Date.now()}`,
      type: 'study_session',
      title: 'WSET Study Group',
      description: 'Study together and share wine knowledge. Everyone benefits from the collective expertise!',
      participants,
      required_participants: 2,
      max_participants: 4,
      rewards: {
        experience_multiplier: 1.3,
        prestige_bonus: 150,
        exclusive_rewards: ['Study Buddy Badge', 'Knowledge Sharing Bonus']
      },
      duration_hours: 24,
      created_at: new Date().toISOString(),
      starts_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Starts in 30 minutes
    };
  }

  private createTastingPartyActivity(participants: NetworkUser[]): CollaborativeActivity {
    return {
      id: `tasting_party_${Date.now()}`,
      type: 'tasting_party',
      title: 'Virtual Tasting Party',
      description: 'Synchronize your wine tastings and share notes in real-time!',
      participants,
      required_participants: 4,
      max_participants: 8,
      rewards: {
        experience_multiplier: 2.0,
        prestige_bonus: 300,
        exclusive_rewards: ['Party Host Badge', 'Social Taster Title', 'Group Tasting Video']
      },
      duration_hours: 4,
      created_at: new Date().toISOString(),
      starts_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Starts in 2 hours
    };
  }

  // Friend recommendation engine based on wine preferences
  recommendFriends(userId: string, userProfile: any, potentialFriends: NetworkUser[]): NetworkUser[] {
    return potentialFriends
      .map(friend => ({
        ...friend,
        compatibilityScore: this.calculateCompatibility(userProfile, friend)
      }))
      .filter(friend => friend.compatibilityScore > 0.6)
      .sort((a, b) => (b as any).compatibilityScore - (a as any).compatibilityScore)
      .slice(0, 10);
  }

  private calculateCompatibility(user: any, friend: NetworkUser): number {
    let score = 0;
    
    // Wine region preference overlap
    if (user.region_expertise && friend.region_expertise) {
      const userRegions = Object.keys(user.region_expertise);
      const friendRegions = Object.keys(friend.region_expertise);
      const overlap = userRegions.filter(region => friendRegions.includes(region)).length;
      const union = new Set([...userRegions, ...friendRegions]).size;
      score += (overlap / union) * 0.4;
    }
    
    // Similar wine discovery activity level
    const userActivity = user.wineDiscoveries || 0;
    const friendActivity = friend.wineDiscoveries;
    const activityRatio = Math.min(userActivity, friendActivity) / Math.max(userActivity, friendActivity, 1);
    score += activityRatio * 0.3;
    
    // Pet level similarity (for balanced competitions)
    if (user.pet && friend.pet) {
      const levelDiff = Math.abs(user.pet.level - friend.pet.level);
      score += Math.max(0, (20 - levelDiff) / 20) * 0.2;
    }
    
    // Recent activity (prefer active users)
    score += this.isActiveUser(friend) ? 0.1 : 0;
    
    return Math.min(score, 1.0);
  }

  // Network-enhanced discovery system
  enhanceDiscoveryWithNetwork(
    userId: string, 
    network: NetworkUser[], 
    baseDiscoveryRate: number
  ): {
    enhancedRate: number;
    bonusSource: string;
    networkContributions: Array<{friendId: string; contribution: string; bonus: number}>;
  } {
    const activeFriends = network.filter(user => this.isActiveUser(user));
    const benefits = this.calculateNetworkBenefits(userId, network);
    
    const enhancedRate = baseDiscoveryRate * benefits.discoveryRateMultiplier;
    const networkContributions: Array<{friendId: string; contribution: string; bonus: number}> = [];
    
    // Calculate individual friend contributions
    activeFriends.forEach(friend => {
      const friendExpertise = Object.values(friend.region_expertise).reduce((a, b) => a + b, 0);
      if (friendExpertise > 50) {
        networkContributions.push({
          friendId: friend.id,
          contribution: 'Regional Expertise',
          bonus: Math.min(friendExpertise / 1000, 0.1)
        });
      }
      
      if (friend.wineDiscoveries > 100) {
        networkContributions.push({
          friendId: friend.id,
          contribution: 'Discovery Experience',
          bonus: 0.05
        });
      }
    });

    return {
      enhancedRate,
      bonusSource: `Network of ${activeFriends.length} active friends`,
      networkContributions
    };
  }

  // Pet social features that require network
  getPetSocialFeatures(userId: string, pet: UserPetWithDetails, network: NetworkUser[]): {
    available: string[];
    locked: string[];
    requirements: Record<string, string>;
  } {
    const activeFriends = network.filter(user => this.isActiveUser(user));
    const petsInNetwork = activeFriends.filter(friend => friend.pet).length;
    
    const available: string[] = [];
    const locked: string[] = [];
    const requirements: Record<string, string> = {};
    
    // Pet playdates (requires 1+ friends with pets)
    if (petsInNetwork >= 1) {
      available.push('Pet Playdates');
    } else {
      locked.push('Pet Playdates');
      requirements['Pet Playdates'] = 'Need 1 friend with an active pet';
    }
    
    // Pet breeding (requires 3+ friends with pets)
    if (petsInNetwork >= 3) {
      available.push('Pet Breeding');
    } else {
      locked.push('Pet Breeding');
      requirements['Pet Breeding'] = `Need ${3 - petsInNetwork} more friends with pets`;
    }
    
    // Group evolution ceremonies (requires 5+ active friends)
    if (activeFriends.length >= 5) {
      available.push('Group Evolution Ceremonies');
    } else {
      locked.push('Group Evolution Ceremonies');
      requirements['Group Evolution Ceremonies'] = `Need ${5 - activeFriends.length} more active friends`;
    }
    
    // Pet tournaments (requires 8+ friends for brackets)
    if (activeFriends.length >= 8) {
      available.push('Friend Pet Tournaments');
    } else {
      locked.push('Friend Pet Tournaments');
      requirements['Friend Pet Tournaments'] = `Need ${8 - activeFriends.length} more active friends`;
    }
    
    return { available, locked, requirements };
  }

  // Knowledge sharing network effects
  calculateKnowledgeSharing(
    userId: string,
    network: NetworkUser[],
    targetRegion: string
  ): {
    networkExpertise: number;
    mentors: NetworkUser[];
    apprentices: NetworkUser[];
    learningBonus: number;
  } {
    const activeFriends = network.filter(user => this.isActiveUser(user));
    
    // Calculate network expertise in target region
    const networkExpertise = activeFriends.reduce((max, friend) => 
      Math.max(max, friend.region_expertise[targetRegion] || 0), 0
    );
    
    // Find potential mentors (higher expertise)
    const mentors = activeFriends.filter(friend => 
      (friend.region_expertise[targetRegion] || 0) > 70
    );
    
    // Find potential apprentices (lower expertise)  
    const apprentices = activeFriends.filter(friend => 
      (friend.region_expertise[targetRegion] || 0) < 30
    );
    
    // Calculate learning bonus from mentors
    const learningBonus = mentors.length > 0 ? 
      Math.min(mentors.length * 0.1 + (networkExpertise / 1000), 0.5) : 0;
    
    return {
      networkExpertise,
      mentors,
      apprentices,
      learningBonus
    };
  }

  // Viral invitation targeting based on network gaps
  generateViralTargeting(userId: string, network: NetworkUser[]): {
    recommendations: string[];
    incentives: string[];
    targetAudience: string[];
  } {
    const activeFriends = network.filter(user => this.isActiveUser(user));
    const recommendations: string[] = [];
    const incentives: string[] = [];
    const targetAudience: string[] = [];
    
    // Analyze network gaps
    if (activeFriends.length < 3) {
      recommendations.push('Invite close friends to unlock collaborative features');
      incentives.push('2x evolution speed with 3+ active friends');
      targetAudience.push('Close friends who enjoy wine');
    }
    
    if (activeFriends.length < 5) {
      recommendations.push('Build your wine community for exclusive content');
      incentives.push('Unlock premium discovery bonuses at 5 friends');
      targetAudience.push('Wine enthusiasts from social media');
    }
    
    if (activeFriends.length < 10) {
      recommendations.push('Create a wine learning group for maximum benefits');
      incentives.push('Access to exclusive tournaments at 10 friends');
      targetAudience.push('Local wine club members, coworkers');
    }
    
    // Check for expertise gaps
    const regions = ['french', 'italian', 'spanish', 'german', 'new_world'];
    const weakRegions = regions.filter(region => {
      const networkStrength = activeFriends.reduce((max, friend) => 
        Math.max(max, friend.region_expertise[region] || 0), 0
      );
      return networkStrength < 50;
    });
    
    if (weakRegions.length > 0) {
      recommendations.push(`Invite experts in ${weakRegions.join(', ')} wines`);
      targetAudience.push('Regional wine specialists', 'Sommeliers', 'Wine educators');
    }
    
    return { recommendations, incentives, targetAudience };
  }
}

// Singleton instance
export const networkEffects = new NetworkEffectsEngine();

export default NetworkEffectsEngine;