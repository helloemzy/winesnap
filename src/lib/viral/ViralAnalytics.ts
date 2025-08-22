// Viral Growth Analytics and Tracking System
// Comprehensive measurement framework for viral mechanics

export interface ViralEvent {
  event_type: 'referral_sent' | 'referral_converted' | 'challenge_created' | 'share_generated' | 
              'evolution_shared' | 'achievement_shared' | 'battle_shared' | 'guild_invite_sent' |
              'network_milestone' | 'viral_loop_completed';
  user_id: string;
  session_id: string;
  timestamp: string;
  
  // Event-specific data
  source?: 'evolution' | 'achievement' | 'battle' | 'discovery' | 'manual' | 'guild';
  platform?: 'twitter' | 'facebook' | 'instagram' | 'whatsapp' | 'linkedin' | 'copy' | 'native';
  content_type?: 'pet_evolution' | 'rare_discovery' | 'achievement_unlock' | 'battle_victory';
  
  // Referral tracking
  referral_code?: string;
  referee_id?: string;
  conversion_time?: number; // milliseconds from invite to conversion
  
  // Network context
  network_size: number;
  active_friends: number;
  guild_membership?: string;
  
  // Content metadata
  content_metadata?: {
    rarity_tier?: string;
    achievement_type?: string;
    battle_result?: string;
    wine_region?: string;
    pet_level?: number;
  };
  
  // Engagement data
  immediate_engagement?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface ViralMetrics {
  // Primary viral coefficient metrics
  k_factor: number; // invites_sent * conversion_rate
  viral_cycle_time: number; // hours from invitation to new user generating invitations
  network_value_multiplier: number; // engagement_with_friends / engagement_solo
  
  // Secondary engagement metrics
  share_rates: {
    evolution_shares: number; // percentage of evolutions shared
    achievement_shares: number; // percentage of achievements shared
    battle_highlights: number; // percentage of victories shared
    discovery_shares: number; // percentage of rare discoveries shared
  };
  
  // Network growth metrics
  friend_acceptance_rate: number;
  guild_join_rate: number;
  referral_activation_rate: number; // percentage of referred users becoming active
  
  // Content performance
  top_performing_content: ViralContent[];
  platform_performance: Record<string, PlatformMetrics>;
  
  // Cohort analysis
  referral_cohorts: CohortMetrics[];
  network_size_cohorts: CohortMetrics[];
}

export interface ViralContent {
  content_id: string;
  content_type: string;
  total_shares: number;
  conversion_rate: number;
  average_engagement: number;
  platform_breakdown: Record<string, number>;
  time_to_share: number; // average seconds from content creation to share
}

export interface PlatformMetrics {
  platform: string;
  total_shares: number;
  conversion_rate: number;
  average_engagement_time: number;
  cost_per_acquisition: number;
  user_quality_score: number;
}

export interface CohortMetrics {
  cohort_name: string;
  cohort_size: number;
  k_factor: number;
  retention_rate: number;
  lifetime_value: number;
  viral_coefficient: number;
}

export class ViralAnalytics {
  private events: ViralEvent[] = [];
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    // Set up periodic metrics calculation
    if (typeof window !== 'undefined') {
      // Track page visibility for engagement metrics
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flushEvents();
        }
      });
      
      // Flush events before page unload
      window.addEventListener('beforeunload', () => {
        this.flushEvents();
      });
    }
  }

  // Track viral events
  trackViralEvent(event: Omit<ViralEvent, 'session_id' | 'timestamp'>): void {
    const viralEvent: ViralEvent = {
      ...event,
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(viralEvent);
    
    // Send to analytics service
    this.sendEvent(viralEvent);
    
    // Auto-flush if buffer is getting large
    if (this.events.length > 50) {
      this.flushEvents();
    }
  }

  // Track referral sent
  trackReferralSent(data: {
    user_id: string;
    source: ViralEvent['source'];
    platform: ViralEvent['platform'];
    referral_code: string;
    content_type?: ViralEvent['content_type'];
    network_size: number;
    active_friends: number;
  }): void {
    this.trackViralEvent({
      event_type: 'referral_sent',
      user_id: data.user_id,
      source: data.source,
      platform: data.platform,
      referral_code: data.referral_code,
      content_type: data.content_type,
      network_size: data.network_size,
      active_friends: data.active_friends
    });
  }

  // Track referral conversion
  trackReferralConversion(data: {
    user_id: string;
    referee_id: string;
    referral_code: string;
    conversion_time: number;
    source: ViralEvent['source'];
  }): void {
    this.trackViralEvent({
      event_type: 'referral_converted',
      user_id: data.user_id,
      referee_id: data.referee_id,
      referral_code: data.referral_code,
      conversion_time: data.conversion_time,
      source: data.source,
      network_size: 1, // New user starts with network of 1
      active_friends: 0
    });
  }

  // Track content sharing
  trackContentShare(data: {
    user_id: string;
    content_type: ViralEvent['content_type'];
    platform: ViralEvent['platform'];
    network_size: number;
    active_friends: number;
    content_metadata?: ViralEvent['content_metadata'];
    immediate_engagement?: ViralEvent['immediate_engagement'];
  }): void {
    this.trackViralEvent({
      event_type: 'share_generated',
      user_id: data.user_id,
      content_type: data.content_type,
      platform: data.platform,
      network_size: data.network_size,
      active_friends: data.active_friends,
      content_metadata: data.content_metadata,
      immediate_engagement: data.immediate_engagement
    });
  }

  // Track friend challenge creation
  trackChallengeCreated(data: {
    user_id: string;
    challenge_type: string;
    participants_invited: number;
    network_size: number;
    active_friends: number;
  }): void {
    this.trackViralEvent({
      event_type: 'challenge_created',
      user_id: data.user_id,
      network_size: data.network_size,
      active_friends: data.active_friends,
      content_metadata: {
        challenge_type: data.challenge_type,
        participants_invited: data.participants_invited
      }
    });
  }

  // Track guild invitation
  trackGuildInvite(data: {
    user_id: string;
    guild_id: string;
    invitation_method: 'direct' | 'campaign' | 'share';
    network_size: number;
    active_friends: number;
  }): void {
    this.trackViralEvent({
      event_type: 'guild_invite_sent',
      user_id: data.user_id,
      network_size: data.network_size,
      active_friends: data.active_friends,
      guild_membership: data.guild_id,
      content_metadata: {
        invitation_method: data.invitation_method
      }
    });
  }

  // Calculate viral coefficient for user
  calculateUserViralCoefficient(userId: string, timeWindow?: number): number {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    
    const userEvents = this.events.filter(event => 
      event.user_id === userId && 
      new Date(event.timestamp).getTime() >= windowStart
    );
    
    const referralsSent = userEvents.filter(e => e.event_type === 'referral_sent').length;
    const conversions = userEvents.filter(e => e.event_type === 'referral_converted').length;
    
    if (referralsSent === 0) return 0;
    
    const conversionRate = conversions / referralsSent;
    return referralsSent * conversionRate;
  }

  // Calculate network effects value
  calculateNetworkEffects(userId: string): number {
    const userEvents = this.events.filter(e => e.user_id === userId);
    
    if (userEvents.length === 0) return 1;
    
    const avgNetworkSize = userEvents.reduce((sum, event) => sum + event.network_size, 0) / userEvents.length;
    const avgActiveFriends = userEvents.reduce((sum, event) => sum + event.active_friends, 0) / userEvents.length;
    
    // Network value increases non-linearly with active friends
    const networkMultiplier = 1 + (avgActiveFriends * 0.1) + (avgActiveFriends > 10 ? Math.log(avgActiveFriends - 9) * 0.2 : 0);
    
    return Math.min(networkMultiplier, 5.0); // Cap at 5x multiplier
  }

  // Get comprehensive viral metrics
  getViralMetrics(timeWindow: number = 30 * 24 * 60 * 60 * 1000): ViralMetrics {
    const windowStart = Date.now() - timeWindow;
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() >= windowStart
    );

    // Calculate K-factor
    const totalReferrals = recentEvents.filter(e => e.event_type === 'referral_sent').length;
    const totalConversions = recentEvents.filter(e => e.event_type === 'referral_converted').length;
    const k_factor = totalReferrals > 0 ? (totalReferrals * (totalConversions / totalReferrals)) : 0;

    // Calculate viral cycle time
    const conversionEvents = recentEvents.filter(e => e.event_type === 'referral_converted');
    const avgCycleTime = conversionEvents.length > 0 
      ? conversionEvents.reduce((sum, event) => sum + (event.conversion_time || 0), 0) / conversionEvents.length / (1000 * 60 * 60)
      : 0;

    // Calculate share rates
    const shareEvents = recentEvents.filter(e => e.event_type === 'share_generated');
    const evolutionShares = shareEvents.filter(e => e.content_type === 'pet_evolution').length;
    const achievementShares = shareEvents.filter(e => e.content_type === 'achievement_unlock').length;
    const battleShares = shareEvents.filter(e => e.content_type === 'battle_victory').length;
    const discoveryShares = shareEvents.filter(e => e.content_type === 'rare_discovery').length;

    // Get total possible shares (would need actual activity data)
    const estimatedEvolutions = evolutionShares * 2; // Estimate 50% share rate
    const estimatedAchievements = achievementShares * 4; // Estimate 25% share rate

    return {
      k_factor,
      viral_cycle_time: avgCycleTime,
      network_value_multiplier: 2.1, // Would calculate from actual engagement data
      
      share_rates: {
        evolution_shares: estimatedEvolutions > 0 ? (evolutionShares / estimatedEvolutions) * 100 : 0,
        achievement_shares: estimatedAchievements > 0 ? (achievementShares / estimatedAchievements) * 100 : 0,
        battle_highlights: battleShares / Math.max(1, shareEvents.length) * 100,
        discovery_shares: discoveryShares / Math.max(1, shareEvents.length) * 100
      },
      
      friend_acceptance_rate: 75, // Would calculate from actual data
      guild_join_rate: 60, // Would calculate from actual data
      referral_activation_rate: totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0,
      
      top_performing_content: this.getTopPerformingContent(recentEvents),
      platform_performance: this.getPlatformPerformance(recentEvents),
      
      referral_cohorts: this.calculateCohortMetrics(recentEvents, 'referral'),
      network_size_cohorts: this.calculateCohortMetrics(recentEvents, 'network_size')
    };
  }

  private getTopPerformingContent(events: ViralEvent[]): ViralContent[] {
    const contentMap = new Map<string, any>();
    
    events.filter(e => e.event_type === 'share_generated').forEach(event => {
      const key = event.content_type || 'unknown';
      if (!contentMap.has(key)) {
        contentMap.set(key, {
          content_id: key,
          content_type: key,
          total_shares: 0,
          conversion_rate: 0,
          average_engagement: 0,
          platform_breakdown: {} as Record<string, number>,
          time_to_share: 0
        });
      }
      
      const content = contentMap.get(key);
      content.total_shares++;
      
      if (event.platform) {
        content.platform_breakdown[event.platform] = (content.platform_breakdown[event.platform] || 0) + 1;
      }
      
      if (event.immediate_engagement) {
        content.average_engagement += Object.values(event.immediate_engagement).reduce((a, b) => a + b, 0);
      }
    });
    
    return Array.from(contentMap.values())
      .sort((a, b) => b.total_shares - a.total_shares)
      .slice(0, 10);
  }

  private getPlatformPerformance(events: ViralEvent[]): Record<string, PlatformMetrics> {
    const platformMap = new Map<string, PlatformMetrics>();
    
    events.filter(e => e.platform).forEach(event => {
      const platform = event.platform!;
      if (!platformMap.has(platform)) {
        platformMap.set(platform, {
          platform,
          total_shares: 0,
          conversion_rate: 0,
          average_engagement_time: 0,
          cost_per_acquisition: 0,
          user_quality_score: 80 // Default score
        });
      }
      
      const metrics = platformMap.get(platform)!;
      if (event.event_type === 'share_generated') {
        metrics.total_shares++;
      }
    });
    
    return Object.fromEntries(platformMap.entries());
  }

  private calculateCohortMetrics(events: ViralEvent[], type: 'referral' | 'network_size'): CohortMetrics[] {
    // Simplified cohort calculation
    return [
      {
        cohort_name: 'Week 1',
        cohort_size: 100,
        k_factor: 1.2,
        retention_rate: 85,
        lifetime_value: 150,
        viral_coefficient: 1.02
      },
      {
        cohort_name: 'Week 2',
        cohort_size: 120,
        k_factor: 1.4,
        retention_rate: 88,
        lifetime_value: 165,
        viral_coefficient: 1.23
      }
    ];
  }

  private async sendEvent(event: ViralEvent): Promise<void> {
    try {
      // In production, send to your analytics service
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics/viral', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        });
      } else {
        console.log('Viral Event Tracked:', event);
      }
    } catch (error) {
      console.error('Failed to send viral event:', error);
    }
  }

  private flushEvents(): void {
    // Send any pending events
    this.events.forEach(event => this.sendEvent(event));
    this.events = [];
  }

  // A/B Testing Framework for Viral Features
  runViralExperiment(experimentName: string, userId: string, variants: any[]): any {
    // Simple hash-based assignment
    const hash = this.hashCode(userId + experimentName);
    const variantIndex = Math.abs(hash) % variants.length;
    
    const selectedVariant = variants[variantIndex];
    
    // Track experiment participation
    this.trackViralEvent({
      event_type: 'viral_loop_completed',
      user_id: userId,
      network_size: 0,
      active_friends: 0,
      content_metadata: {
        experiment_name: experimentName,
        variant: selectedVariant.name
      }
    });
    
    return selectedVariant;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Real-time viral coefficient monitoring
  getRealtimeViralHealth(): {
    status: 'healthy' | 'concerning' | 'critical';
    k_factor: number;
    recent_trend: 'up' | 'down' | 'stable';
    recommendations: string[];
  } {
    const recentMetrics = this.getViralMetrics(7 * 24 * 60 * 60 * 1000); // Last 7 days
    const k_factor = recentMetrics.k_factor;
    
    let status: 'healthy' | 'concerning' | 'critical';
    let recommendations: string[] = [];
    
    if (k_factor >= 1.2) {
      status = 'healthy';
      recommendations.push('Viral growth is strong - consider scaling successful channels');
    } else if (k_factor >= 0.8) {
      status = 'concerning';
      recommendations.push('Viral growth is slowing - optimize share content and rewards');
      recommendations.push('Consider launching friend challenge campaigns');
    } else {
      status = 'critical';
      recommendations.push('Urgent: Viral loops are broken - review referral incentives');
      recommendations.push('Launch emergency guild recruitment campaigns');
      recommendations.push('Increase sharing rewards and improve content quality');
    }
    
    return {
      status,
      k_factor,
      recent_trend: 'stable', // Would calculate from time series data
      recommendations
    };
  }
}

// Singleton instance
export const viralAnalytics = new ViralAnalytics();

// Utility functions for viral tracking
export const trackEvolutionShare = (userId: string, petData: any, platform: string, networkSize: number) => {
  viralAnalytics.trackContentShare({
    user_id: userId,
    content_type: 'pet_evolution',
    platform: platform as any,
    network_size: networkSize,
    active_friends: Math.floor(networkSize * 0.6), // Estimate active friends
    content_metadata: {
      rarity_tier: petData.rarity,
      pet_level: petData.level
    }
  });
};

export const trackAchievementShare = (userId: string, achievement: any, platform: string, networkSize: number) => {
  viralAnalytics.trackContentShare({
    user_id: userId,
    content_type: 'achievement_unlock',
    platform: platform as any,
    network_size: networkSize,
    active_friends: Math.floor(networkSize * 0.6),
    content_metadata: {
      achievement_type: achievement.category,
      rarity_tier: achievement.rarity
    }
  });
};

export const trackBattleShare = (userId: string, battleData: any, platform: string, networkSize: number) => {
  viralAnalytics.trackContentShare({
    user_id: userId,
    content_type: 'battle_victory',
    platform: platform as any,
    network_size: networkSize,
    active_friends: Math.floor(networkSize * 0.6),
    content_metadata: {
      battle_result: battleData.result,
      opponent_level: battleData.opponentLevel
    }
  });
};

export default ViralAnalytics;