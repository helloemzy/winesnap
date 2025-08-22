'use client'

import React, { useEffect, useState } from 'react'
import {
  Trophy,
  Star,
  Heart,
  Zap,
  Award,
  Target,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  Crown,
  Sparkles,
  Gift,
  Medal,
  Flame
} from 'lucide-react'
import { usePetStore } from '@/stores/pet-store'
import { useUIStore } from '@/stores/ui-store'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'discovery' | 'social' | 'streak' | 'expertise' | 'collection'
  progress?: number
  maxProgress?: number
  rewards?: {
    xp: number
    petBonus?: string
    unlocks?: string[]
  }
}

interface CaptureReward {
  type: 'xp' | 'achievement' | 'pet_evolution' | 'collection_milestone' | 'streak_bonus'
  title: string
  description: string
  icon: React.ComponentType<any>
  value: number | string
  color: string
  sound?: string
}

interface NotificationProps {
  rewards: CaptureReward[]
  achievements: Achievement[]
  isVisible: boolean
  onClose: () => void
}

export function CaptureNotifications({ 
  rewards, 
  achievements, 
  isVisible, 
  onClose 
}: NotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'display' | 'exit'>('enter')
  const { currentPet } = usePetStore()
  const { addToast } = useUIStore()

  // Auto-progress through notifications
  useEffect(() => {
    if (!isVisible) return

    const totalNotifications = rewards.length + achievements.length
    if (totalNotifications === 0) return

    const timer = setTimeout(() => {
      if (animationPhase === 'enter') {
        setAnimationPhase('display')
      } else if (animationPhase === 'display') {
        if (currentIndex < totalNotifications - 1) {
          setAnimationPhase('exit')
          setTimeout(() => {
            setCurrentIndex(prev => prev + 1)
            setAnimationPhase('enter')
          }, 300)
        } else {
          setAnimationPhase('exit')
          setTimeout(onClose, 500)
        }
      }
    }, animationPhase === 'enter' ? 500 : animationPhase === 'display' ? 3000 : 300)

    return () => clearTimeout(timer)
  }, [isVisible, currentIndex, animationPhase, rewards.length, achievements.length, onClose])

  // Play notification sounds
  useEffect(() => {
    if (!isVisible || animationPhase !== 'display') return

    const allNotifications = [...rewards, ...achievements]
    const current = allNotifications[currentIndex]
    
    if (current && 'sound' in current && current.sound) {
      playNotificationSound(current.sound)
    } else {
      // Default sounds based on type
      if ('type' in current) {
        const soundMap = {
          xp: 'xp-gain',
          achievement: 'achievement',
          pet_evolution: 'evolution',
          collection_milestone: 'milestone',
          streak_bonus: 'streak'
        }
        playNotificationSound(soundMap[current.type] || 'notification')
      }
    }
  }, [currentIndex, animationPhase, isVisible])

  const playNotificationSound = (soundType: string) => {
    // In production, play actual sound files
    if ('vibrate' in navigator) {
      const vibrationPatterns = {
        'xp-gain': [50, 50, 50],
        'achievement': [100, 50, 100, 50, 100],
        'evolution': [200, 100, 200, 100, 200],
        'milestone': [150, 75, 150],
        'streak': [25, 25, 25, 25, 25],
        'notification': [100]
      }
      navigator.vibrate(vibrationPatterns[soundType] || [100])
    }
  }

  if (!isVisible) return null

  const allNotifications = [...rewards, ...achievements]
  const currentNotification = allNotifications[currentIndex]

  if (!currentNotification) return null

  const isAchievement = 'category' in currentNotification
  const isReward = 'type' in currentNotification

  const getAnimationClasses = () => {
    const baseClasses = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-500"
    
    switch (animationPhase) {
      case 'enter':
        return `${baseClasses} opacity-0 scale-95`
      case 'display':
        return `${baseClasses} opacity-100 scale-100`
      case 'exit':
        return `${baseClasses} opacity-0 scale-105`
      default:
        return baseClasses
    }
  }

  const getNotificationColors = (notification: any) => {
    if (isAchievement) {
      const rarityColors = {
        common: 'from-gray-600 to-gray-800 border-gray-500',
        rare: 'from-blue-600 to-blue-800 border-blue-500',
        epic: 'from-purple-600 to-purple-800 border-purple-500',
        legendary: 'from-yellow-500 to-orange-600 border-yellow-500'
      }
      return rarityColors[notification.rarity] || rarityColors.common
    } else {
      const typeColors = {
        xp: 'from-green-600 to-green-800 border-green-500',
        achievement: 'from-purple-600 to-purple-800 border-purple-500',
        pet_evolution: 'from-pink-600 to-pink-800 border-pink-500',
        collection_milestone: 'from-blue-600 to-blue-800 border-blue-500',
        streak_bonus: 'from-orange-600 to-orange-800 border-orange-500'
      }
      return typeColors[notification.type] || typeColors.xp
    }
  }

  const renderRewardNotification = (reward: CaptureReward) => {
    const IconComponent = reward.icon

    return (
      <div className={`bg-gradient-to-br ${getNotificationColors(reward)} border-2 rounded-2xl p-8 max-w-sm w-full mx-4 text-center text-white shadow-2xl`}>
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="bg-white/20 rounded-full p-4">
            <IconComponent className="w-12 h-12" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-2">{reward.title}</h3>

        {/* Description */}
        <p className="text-white/80 mb-4 text-sm">{reward.description}</p>

        {/* Value */}
        <div className="text-3xl font-bold mb-4">
          {reward.type === 'xp' && '+'}
          {reward.value}
          {reward.type === 'xp' && ' XP'}
        </div>

        {/* Pet reaction */}
        {currentPet && (
          <div className="flex items-center justify-center text-sm text-white/70">
            <Heart className="w-4 h-4 mr-1" />
            <span>{currentPet.name} is excited!</span>
          </div>
        )}
      </div>
    )
  }

  const renderAchievementNotification = (achievement: Achievement) => {
    const IconComponent = achievement.icon

    return (
      <div className={`bg-gradient-to-br ${getNotificationColors(achievement)} border-2 rounded-2xl p-8 max-w-sm w-full mx-4 text-center text-white shadow-2xl relative overflow-hidden`}>
        {/* Rarity indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

        {/* Achievement badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            achievement.rarity === 'legendary' ? 'bg-yellow-500 text-black' :
            achievement.rarity === 'epic' ? 'bg-purple-500 text-white' :
            achievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {achievement.rarity.toUpperCase()}
          </div>
        </div>

        {/* Icon with rarity glow */}
        <div className="mb-4 flex justify-center">
          <div className={`bg-white/20 rounded-full p-4 ${
            achievement.rarity === 'legendary' ? 'shadow-lg shadow-yellow-500/50 animate-pulse' :
            achievement.rarity === 'epic' ? 'shadow-lg shadow-purple-500/50' :
            ''
          }`}>
            <IconComponent className="w-12 h-12" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2">Achievement Unlocked!</h3>
        <h4 className="text-lg font-semibold mb-2">{achievement.title}</h4>

        {/* Description */}
        <p className="text-white/80 mb-4 text-sm">{achievement.description}</p>

        {/* Progress bar if applicable */}
        {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
          <div className="mb-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
              />
            </div>
            <div className="text-xs text-white/70 mt-1">
              {achievement.progress} / {achievement.maxProgress}
            </div>
          </div>
        )}

        {/* Rewards */}
        {achievement.rewards && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-sm font-medium mb-2">Rewards:</div>
            <div className="flex justify-center items-center gap-2 text-sm">
              {achievement.rewards.xp && (
                <span className="bg-green-500/20 px-2 py-1 rounded">
                  +{achievement.rewards.xp} XP
                </span>
              )}
              {achievement.rewards.petBonus && (
                <span className="bg-pink-500/20 px-2 py-1 rounded">
                  {achievement.rewards.petBonus}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={getAnimationClasses()} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {isReward && renderRewardNotification(currentNotification as CaptureReward)}
        {isAchievement && renderAchievementNotification(currentNotification as Achievement)}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {allNotifications.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white' : 
              index < currentIndex ? 'bg-white/50' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white text-sm px-3 py-1 rounded-full bg-black/30 hover:bg-black/50"
      >
        Skip
      </button>
    </div>
  )
}

// Achievement definitions for wine capture system
export const WINE_ACHIEVEMENTS: Achievement[] = [
  // Discovery Achievements
  {
    id: 'first_capture',
    title: 'First Steps',
    description: 'Complete your first wine capture',
    icon: Star,
    rarity: 'common',
    category: 'discovery',
    rewards: { xp: 50, petBonus: 'Happy pet!' }
  },
  {
    id: 'voice_master',
    title: 'Voice Master',
    description: 'Record 10 voice tasting notes',
    icon: Trophy,
    rarity: 'rare',
    category: 'discovery',
    maxProgress: 10,
    rewards: { xp: 200, petBonus: 'Voice Recognition Boost' }
  },
  {
    id: 'camera_expert',
    title: 'Label Detective',
    description: 'Successfully capture 25 wine labels',
    icon: Target,
    rarity: 'rare',
    category: 'discovery',
    maxProgress: 25,
    rewards: { xp: 300, petBonus: 'Enhanced OCR' }
  },

  // Collection Achievements
  {
    id: 'region_explorer',
    title: 'World Explorer',
    description: 'Discover wines from 10 different regions',
    icon: MapPin,
    rarity: 'epic',
    category: 'collection',
    maxProgress: 10,
    rewards: { xp: 500, petBonus: 'Regional Expertise' }
  },
  {
    id: 'vintage_collector',
    title: 'Time Traveler',
    description: 'Collect wines from 5 different decades',
    icon: Calendar,
    rarity: 'epic',
    category: 'collection',
    maxProgress: 5,
    rewards: { xp: 600, petBonus: 'Vintage Wisdom' }
  },
  {
    id: 'grand_collection',
    title: 'Grand Collector',
    description: 'Build a collection of 100 wines',
    icon: Crown,
    rarity: 'legendary',
    category: 'collection',
    maxProgress: 100,
    rewards: { xp: 1000, petBonus: 'Master Collector Status' }
  },

  // Streak Achievements
  {
    id: 'daily_dedication',
    title: 'Daily Dedication',
    description: 'Capture wines for 7 days in a row',
    icon: Flame,
    rarity: 'rare',
    category: 'streak',
    maxProgress: 7,
    rewards: { xp: 250, petBonus: 'Streak Multiplier' }
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: Zap,
    rarity: 'legendary',
    category: 'streak',
    maxProgress: 30,
    rewards: { xp: 1500, petBonus: 'Legendary Dedication' }
  },

  // Expertise Achievements
  {
    id: 'bordeaux_expert',
    title: 'Bordeaux Connoisseur',
    description: 'Master Bordeaux wines',
    icon: Medal,
    rarity: 'epic',
    category: 'expertise',
    rewards: { xp: 400, petBonus: 'French Wine Expertise' }
  },
  {
    id: 'somm_level',
    title: 'Sommelier Level',
    description: 'Achieve expert-level knowledge',
    icon: Award,
    rarity: 'legendary',
    category: 'expertise',
    rewards: { xp: 2000, petBonus: 'Sommelier Status' }
  },

  // Social Achievements
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Share 10 wine discoveries',
    icon: Users,
    rarity: 'rare',
    category: 'social',
    maxProgress: 10,
    rewards: { xp: 300, petBonus: 'Social Boost' }
  }
]

// Hook for managing capture notifications and achievements
export function useCaptureGamification() {
  const [pendingRewards, setPendingRewards] = useState<CaptureReward[]>([])
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const { currentPet } = usePetStore()
  const { addToast } = useUIStore()

  // Add XP reward
  const addXPReward = (xp: number, source: string) => {
    setPendingRewards(prev => [...prev, {
      type: 'xp',
      title: `+${xp} XP`,
      description: `From ${source}`,
      icon: Star,
      value: xp,
      color: 'green'
    }])
  }

  // Add achievement
  const addAchievement = (achievementId: string) => {
    const achievement = WINE_ACHIEVEMENTS.find(a => a.id === achievementId)
    if (achievement) {
      setPendingAchievements(prev => [...prev, achievement])
    }
  }

  // Add collection milestone
  const addCollectionMilestone = (count: number) => {
    setPendingRewards(prev => [...prev, {
      type: 'collection_milestone',
      title: 'Collection Milestone!',
      description: `You now have ${count} wines in your collection`,
      icon: Trophy,
      value: count,
      color: 'blue'
    }])
  }

  // Add streak bonus
  const addStreakBonus = (days: number, bonus: number) => {
    setPendingRewards(prev => [...prev, {
      type: 'streak_bonus',
      title: `${days} Day Streak!`,
      description: `Streak bonus: +${bonus} XP`,
      icon: Flame,
      value: bonus,
      color: 'orange'
    }])
  }

  // Add pet evolution notification
  const addPetEvolution = (evolutionStage: string) => {
    setPendingRewards(prev => [...prev, {
      type: 'pet_evolution',
      title: 'Pet Evolved!',
      description: `${currentPet?.name} evolved to ${evolutionStage}`,
      icon: Sparkles,
      value: evolutionStage,
      color: 'pink'
    }])
  }

  // Show all pending notifications
  const showPendingNotifications = () => {
    if (pendingRewards.length > 0 || pendingAchievements.length > 0) {
      setShowNotifications(true)
    }
  }

  // Clear notifications
  const clearNotifications = () => {
    setShowNotifications(false)
    setPendingRewards([])
    setPendingAchievements([])
  }

  // Process capture rewards automatically
  useEffect(() => {
    if (pendingRewards.length > 0 || pendingAchievements.length > 0) {
      // Auto-show notifications after a short delay
      const timer = setTimeout(() => {
        setShowNotifications(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [pendingRewards.length, pendingAchievements.length])

  return {
    pendingRewards,
    pendingAchievements,
    showNotifications,
    addXPReward,
    addAchievement,
    addCollectionMilestone,
    addStreakBonus,
    addPetEvolution,
    showPendingNotifications,
    clearNotifications,
    CaptureNotifications: () => (
      <CaptureNotifications
        rewards={pendingRewards}
        achievements={pendingAchievements}
        isVisible={showNotifications}
        onClose={clearNotifications}
      />
    )
  }
}

export default CaptureNotifications