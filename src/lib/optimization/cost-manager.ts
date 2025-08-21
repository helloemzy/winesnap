// Cost optimization and tracking for voice processing

import { supabase } from '@/lib/supabase'
import { useState, useEffect, useCallback } from 'react'

export interface CostTrackingData {
  month: string
  whisper_requests: number
  whisper_cost: number
  gpt_requests: number
  gpt_cost: number
  total_cost: number
  audio_minutes_processed: number
  cache_hit_rate: number
  created_at: string
}

export interface CostLimits {
  monthly_limit: number
  daily_limit: number
  per_user_limit: number
  warning_threshold: number
}

export interface UsageStats {
  current_month_cost: number
  current_day_cost: number
  requests_today: number
  requests_this_month: number
  cache_hits_today: number
  cache_hit_rate: number
  avg_processing_time: number
  estimated_monthly_cost: number
}

class CostManager {
  private static instance: CostManager
  private costLimits: CostLimits = {
    monthly_limit: 30.0, // $30/month
    daily_limit: 2.0, // $2/day
    per_user_limit: 1.0, // $1 per user per day
    warning_threshold: 0.8 // 80%
  }

  private constructor() {}

  static getInstance(): CostManager {
    if (!CostManager.instance) {
      CostManager.instance = new CostManager()
    }
    return CostManager.instance
  }

  // Check if processing is allowed based on cost limits
  async checkCostLimits(userId: string): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentMonth = now.toISOString().slice(0, 7)

      // Get current usage
      const usage = await this.getUserUsageStats(userId)

      // Check monthly limit
      if (usage.current_month_cost >= this.costLimits.monthly_limit) {
        return {
          allowed: false,
          reason: `Monthly cost limit exceeded ($${this.costLimits.monthly_limit})`,
          remaining: 0
        }
      }

      // Check daily limit
      if (usage.current_day_cost >= this.costLimits.daily_limit) {
        return {
          allowed: false,
          reason: `Daily cost limit exceeded ($${this.costLimits.daily_limit})`,
          remaining: 0
        }
      }

      // Check per-user limit
      if (usage.current_day_cost >= this.costLimits.per_user_limit) {
        return {
          allowed: false,
          reason: `User daily limit exceeded ($${this.costLimits.per_user_limit})`,
          remaining: 0
        }
      }

      return {
        allowed: true,
        remaining: Math.min(
          this.costLimits.monthly_limit - usage.current_month_cost,
          this.costLimits.daily_limit - usage.current_day_cost,
          this.costLimits.per_user_limit - usage.current_day_cost
        )
      }

    } catch (error) {
      console.error('Error checking cost limits:', error)
      // Fail safe - allow processing but log the error
      return { allowed: true }
    }
  }

  // Record cost for a processing request
  async recordProcessingCost(
    userId: string,
    type: 'whisper' | 'gpt',
    cost: number,
    metadata: {
      audio_duration?: number
      tokens_used?: number
      processing_time?: number
      cache_hit?: boolean
    } = {}
  ): Promise<void> {
    try {
      const now = new Date()
      const month = now.toISOString().slice(0, 7)
      const date = now.toISOString().split('T')[0]

      // This would ideally be stored in a separate cost tracking table
      // For now, we'll use a simple approach with metadata
      const costRecord = {
        user_id: userId,
        processing_type: type,
        cost,
        month,
        date,
        metadata,
        created_at: now.toISOString()
      }

      // In a real implementation, you'd store this in a dedicated table
      console.log('Cost record:', costRecord)

    } catch (error) {
      console.error('Error recording cost:', error)
    }
  }

  // Get usage statistics for a user
  async getUserUsageStats(userId: string): Promise<UsageStats> {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentMonth = now.toISOString().slice(0, 7)

    // This is a simplified implementation
    // In production, you'd query actual cost tracking tables
    return {
      current_month_cost: 0.50, // Mock data
      current_day_cost: 0.05,
      requests_today: 2,
      requests_this_month: 15,
      cache_hits_today: 1,
      cache_hit_rate: 0.5,
      avg_processing_time: 2500, // ms
      estimated_monthly_cost: 2.5
    }
  }

  // Estimate cost before processing
  estimateProcessingCost(audioBlob: Blob): { whisperCost: number; gptCost: number; totalCost: number } {
    // Whisper pricing: $0.006 per minute
    const estimatedMinutes = Math.max(audioBlob.size / (1024 * 60), 0.1) // Minimum 0.1 minutes
    const whisperCost = estimatedMinutes * 0.006

    // GPT-4o-mini pricing (estimated)
    const gptCost = 0.001 // Estimated cost for WSET mapping

    return {
      whisperCost,
      gptCost,
      totalCost: whisperCost + gptCost
    }
  }

  // Check if user should be warned about approaching limits
  async checkWarningThresholds(userId: string): Promise<{
    shouldWarn: boolean
    warnings: string[]
  }> {
    const usage = await this.getUserUsageStats(userId)
    const warnings: string[] = []

    const monthlyUsagePercent = usage.current_month_cost / this.costLimits.monthly_limit
    const dailyUsagePercent = usage.current_day_cost / this.costLimits.daily_limit

    if (monthlyUsagePercent >= this.costLimits.warning_threshold) {
      warnings.push(
        `Monthly usage at ${Math.round(monthlyUsagePercent * 100)}% of limit ($${usage.current_month_cost}/$${this.costLimits.monthly_limit})`
      )
    }

    if (dailyUsagePercent >= this.costLimits.warning_threshold) {
      warnings.push(
        `Daily usage at ${Math.round(dailyUsagePercent * 100)}% of limit ($${usage.current_day_cost}/$${this.costLimits.daily_limit})`
      )
    }

    return {
      shouldWarn: warnings.length > 0,
      warnings
    }
  }

  // Update cost limits (admin function)
  updateCostLimits(newLimits: Partial<CostLimits>): void {
    this.costLimits = { ...this.costLimits, ...newLimits }
  }

  getCostLimits(): CostLimits {
    return { ...this.costLimits }
  }
}

// Cache management for voice processing
class CacheManager {
  private static instance: CacheManager
  private maxCacheAge = 30 * 24 * 60 * 60 * 1000 // 30 days
  private maxCacheSize = 1000 // Maximum cached items

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // Check if audio hash exists in cache
  async getCachedResult(audioHash: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('voice_processing_cache')
        .select('*')
        .eq('audio_hash', audioHash)
        .single()

      if (error || !data) return null

      // Check if cache entry is still valid
      const cacheAge = Date.now() - new Date(data.created_at).getTime()
      if (cacheAge > this.maxCacheAge) {
        // Remove expired cache entry
        await this.removeCacheEntry(audioHash)
        return null
      }

      return {
        transcript: data.transcript,
        wsetMapping: data.wset_mapping,
        confidence: data.processing_confidence,
        fromCache: true
      }
    } catch (error) {
      console.error('Error getting cached result:', error)
      return null
    }
  }

  // Store result in cache
  async setCachedResult(
    audioHash: string,
    transcript: string,
    wsetMapping: any,
    confidence: number
  ): Promise<void> {
    try {
      // First, clean up old cache entries if we're at the limit
      await this.cleanupCache()

      const { error } = await supabase
        .from('voice_processing_cache')
        .insert({
          audio_hash: audioHash,
          transcript,
          wset_mapping: wsetMapping,
          processing_confidence: confidence
        })

      if (error) {
        console.error('Error caching result:', error)
      }
    } catch (error) {
      console.error('Error setting cached result:', error)
    }
  }

  // Remove specific cache entry
  private async removeCacheEntry(audioHash: string): Promise<void> {
    await supabase
      .from('voice_processing_cache')
      .delete()
      .eq('audio_hash', audioHash)
  }

  // Clean up old cache entries
  private async cleanupCache(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.maxCacheAge).toISOString()

      // Remove old entries
      await supabase
        .from('voice_processing_cache')
        .delete()
        .lt('created_at', cutoffDate)

      // Check if we still have too many entries
      const { count } = await supabase
        .from('voice_processing_cache')
        .select('*', { count: 'exact', head: true })

      if (count && count > this.maxCacheSize) {
        // Remove oldest entries
        const { data: oldestEntries } = await supabase
          .from('voice_processing_cache')
          .select('audio_hash')
          .order('created_at', { ascending: true })
          .limit(count - this.maxCacheSize)

        if (oldestEntries) {
          const hashesToDelete = oldestEntries.map(entry => entry.audio_hash)
          await supabase
            .from('voice_processing_cache')
            .delete()
            .in('audio_hash', hashesToDelete)
        }
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error)
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    totalEntries: number
    cacheHitRate: number
    avgConfidence: number
    oldestEntry: string | null
    newestEntry: string | null
  }> {
    try {
      const { count } = await supabase
        .from('voice_processing_cache')
        .select('*', { count: 'exact', head: true })

      const { data: stats } = await supabase
        .from('voice_processing_cache')
        .select('processing_confidence, created_at')
        .order('created_at')

      if (!stats || stats.length === 0) {
        return {
          totalEntries: 0,
          cacheHitRate: 0,
          avgConfidence: 0,
          oldestEntry: null,
          newestEntry: null
        }
      }

      const avgConfidence = stats.reduce((sum, entry) => sum + entry.processing_confidence, 0) / stats.length

      return {
        totalEntries: count || 0,
        cacheHitRate: 0, // Would need separate tracking
        avgConfidence,
        oldestEntry: stats[0]?.created_at || null,
        newestEntry: stats[stats.length - 1]?.created_at || null
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return {
        totalEntries: 0,
        cacheHitRate: 0,
        avgConfidence: 0,
        oldestEntry: null,
        newestEntry: null
      }
    }
  }

  // Clear all cache (admin function)
  async clearCache(): Promise<void> {
    await supabase.from('voice_processing_cache').delete().neq('id', '')
  }
}

// Export singletons
export const costManager = CostManager.getInstance()
export const cacheManager = CacheManager.getInstance()

// React hooks
export function useCostTracking(userId?: string) {
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsageData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const [usageStats, warningCheck] = await Promise.all([
        costManager.getUserUsageStats(userId),
        costManager.checkWarningThresholds(userId)
      ])

      setUsage(usageStats)
      setWarnings(warningCheck.warnings)
    } catch (error) {
      console.error('Error loading usage data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadUsageData()
    
    // Reload every 5 minutes
    const interval = setInterval(loadUsageData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadUsageData])

  const checkLimits = useCallback(async () => {
    if (!userId) return { allowed: false, reason: 'No user ID' }
    return costManager.checkCostLimits(userId)
  }, [userId])

  return {
    usage,
    warnings,
    loading,
    checkLimits,
    refresh: loadUsageData
  }
}

export function useCacheStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const cacheStats = await cacheManager.getCacheStats()
        setStats(cacheStats)
      } catch (error) {
        console.error('Error loading cache stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return { stats, loading }
}

export default { costManager, cacheManager }