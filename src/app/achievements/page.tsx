'use client'

import { useState } from 'react'
import { Trophy, Star, Lock, Share2, CheckCircle, Target, Gift, Crown, Award, Sparkles, Users, Wine, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Mock achievements data
const mockAchievements = [
  {
    id: 1,
    name: "First Sip",
    description: "Discover your first wine",
    category: "discovery",
    rarity: "common",
    xpReward: 50,
    prestigeReward: 10,
    icon: "🍷",
    isUnlocked: true,
    isCompleted: true,
    completedAt: "2024-01-15",
    progress: 1,
    requirement: 1,
    progressDescription: "Wines discovered"
  },
  {
    id: 2,
    name: "Wine Explorer",
    description: "Discover 10 different wines",
    category: "discovery",
    rarity: "common",
    xpReward: 200,
    prestigeReward: 25,
    icon: "🗺️",
    isUnlocked: true,
    isCompleted: true,
    completedAt: "2024-01-28",
    progress: 10,
    requirement: 10,
    progressDescription: "Wines discovered"
  },
  {
    id: 3,
    name: "Connoisseur",
    description: "Discover 50 different wines",
    category: "discovery",
    rarity: "uncommon",
    xpReward: 1000,
    prestigeReward: 100,
    icon: "🎯",
    isUnlocked: true,
    isCompleted: false,
    completedAt: null,
    progress: 47,
    requirement: 50,
    progressDescription: "Wines discovered"
  },
  {
    id: 4,
    name: "Master Taster",
    description: "Discover 200 different wines",
    category: "discovery",
    rarity: "rare",
    xpReward: 5000,
    prestigeReward: 500,
    icon: "👑",
    isUnlocked: true,
    isCompleted: false,
    completedAt: null,
    progress: 47,
    requirement: 200,
    progressDescription: "Wines discovered"
  },
  {
    id: 5,
    name: "Regional Explorer",
    description: "Discover wines from 5 different regions",
    category: "collection",
    rarity: "uncommon",
    xpReward: 300,
    prestigeReward: 50,
    icon: "🌍",
    isUnlocked: true,
    isCompleted: true,
    completedAt: "2024-02-05",
    progress: 5,
    requirement: 5,
    progressDescription: "Regions explored"
  },
  {
    id: 6,
    name: "World Traveler",
    description: "Discover wines from 10 different countries",
    category: "collection",
    rarity: "rare",
    xpReward: 750,
    prestigeReward: 100,
    icon: "✈️",
    isUnlocked: true,
    isCompleted: false,
    completedAt: null,
    progress: 4,
    requirement: 10,
    progressDescription: "Countries explored"
  },
  {
    id: 7,
    name: "Pet Parent",
    description: "Adopt your first pet",
    category: "dedication",
    rarity: "common",
    xpReward: 100,
    prestigeReward: 20,
    icon: "🐾",
    isUnlocked: true,
    isCompleted: true,
    completedAt: "2024-01-16",
    progress: 1,
    requirement: 1,
    progressDescription: "Pet adopted"
  },
  {
    id: 8,
    name: "Battle Champion",
    description: "Win 10 pet battles",
    category: "battle",
    rarity: "uncommon",
    xpReward: 750,
    prestigeReward: 100,
    icon: "⚔️",
    isUnlocked: true,
    isCompleted: false,
    completedAt: null,
    progress: 8,
    requirement: 10,
    progressDescription: "Battles won"
  },
  {
    id: 9,
    name: "Legendary Hunter",
    description: "Discover your first legendary wine",
    category: "mastery",
    rarity: "epic",
    xpReward: 2000,
    prestigeReward: 300,
    icon: "💎",
    isUnlocked: true,
    isCompleted: true,
    completedAt: "2024-02-01",
    progress: 1,
    requirement: 1,
    progressDescription: "Legendary wine discovered"
  },
  {
    id: 10,
    name: "Secret Achievement",
    description: "Hidden achievement - complete special conditions",
    category: "secret",
    rarity: "mythic",
    xpReward: 10000,
    prestigeReward: 1000,
    icon: "❓",
    isUnlocked: false,
    isCompleted: false,
    completedAt: null,
    progress: 0,
    requirement: 1,
    progressDescription: "Secret condition"
  }
]

// Achievement categories
const categories = [
  { id: 'all', name: 'All Achievements', icon: Trophy },
  { id: 'discovery', name: 'Discovery', icon: Wine },
  { id: 'collection', name: 'Collection', icon: Star },
  { id: 'battle', name: 'Battle', icon: Award },
  { id: 'dedication', name: 'Dedication', icon: Heart },
  { id: 'mastery', name: 'Mastery', icon: Crown },
  { id: 'secret', name: 'Secret', icon: Lock }
]

// Rarity colors and styles
const rarityStyles = {
  common: {
    border: "border-gray-300",
    bg: "bg-gray-50",
    text: "text-gray-700",
    badge: "bg-gray-500"
  },
  uncommon: {
    border: "border-green-300", 
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-green-500"
  },
  rare: {
    border: "border-blue-300",
    bg: "bg-blue-50", 
    text: "text-blue-700",
    badge: "bg-blue-500"
  },
  epic: {
    border: "border-purple-300",
    bg: "bg-purple-50",
    text: "text-purple-700", 
    badge: "bg-purple-500"
  },
  legendary: {
    border: "border-yellow-300",
    bg: "bg-gradient-to-r from-yellow-50 to-orange-50",
    text: "text-orange-700",
    badge: "bg-gradient-to-r from-yellow-400 to-orange-500"
  },
  mythic: {
    border: "border-pink-300",
    bg: "bg-gradient-to-r from-pink-50 to-red-50", 
    text: "text-red-700",
    badge: "bg-gradient-to-r from-pink-500 to-red-500"
  }
}

const AchievementCard = ({ achievement, onShare }: { achievement: any, onShare: (achievement: any) => void }) => {
  const rarity = achievement.rarity as keyof typeof rarityStyles
  const styles = rarityStyles[rarity]
  const progressPercentage = Math.min((achievement.progress / achievement.requirement) * 100, 100)

  return (
    <Card className={`${styles.border} ${styles.bg} transition-all duration-300 hover:shadow-lg ${!achievement.isUnlocked ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{achievement.isUnlocked ? achievement.icon : "🔒"}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-bold text-lg ${styles.text}`}>
                  {achievement.isUnlocked ? achievement.name : "???"}
                </h3>
                {achievement.isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {achievement.isUnlocked ? achievement.description : "Complete requirements to unlock"}
              </p>
              <Badge className={`${styles.badge} text-white text-xs`}>
                {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {achievement.isUnlocked && !achievement.isCompleted && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {achievement.progress}/{achievement.requirement}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {achievement.progressDescription}
            </div>
          </div>
        )}

        {achievement.isCompleted && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800 mb-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="font-semibold text-sm">Completed {achievement.completedAt}</span>
            </div>
            <div className="text-xs text-green-600">
              Earned +{achievement.xpReward} XP, +{achievement.prestigeReward} Prestige
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-medium">{achievement.xpReward} XP</span>
            </div>
            <div className="flex items-center">
              <Crown className="h-4 w-4 text-purple-500 mr-1" />
              <span className="font-medium">{achievement.prestigeReward}</span>
            </div>
          </div>

          {achievement.isCompleted && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onShare(achievement)}
              className="flex items-center gap-2"
            >
              <Share2 className="h-3 w-3" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const ShareModal = ({ achievement, onClose }: { achievement: any, onClose: () => void }) => {
  const shareText = `🏆 Achievement Unlocked! I just earned "${achievement.name}" in WineSnap! 🍷✨`
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{achievement.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Achievement</h2>
          <p className="text-gray-600">{achievement.name}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">{shareText}</p>
        </div>

        <div className="space-y-3">
          <Button className="w-full bg-blue-500 hover:bg-blue-600">
            <Share2 className="h-4 w-4 mr-2" />
            Share on Twitter
          </Button>
          <Button variant="outline" className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Share with Friends
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [shareAchievement, setShareAchievement] = useState<any>(null)

  const filteredAchievements = selectedCategory === 'all' 
    ? mockAchievements 
    : mockAchievements.filter(a => a.category === selectedCategory)

  const stats = {
    total: mockAchievements.length,
    completed: mockAchievements.filter(a => a.isCompleted).length,
    totalXP: mockAchievements.filter(a => a.isCompleted).reduce((sum, a) => sum + a.xpReward, 0),
    totalPrestige: mockAchievements.filter(a => a.isCompleted).reduce((sum, a) => sum + a.prestigeReward, 0)
  }

  const handleShare = (achievement: any) => {
    setShareAchievement(achievement)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-20 animate-pulse"></div>
            <Trophy className="h-12 w-12 text-yellow-600 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Achievements
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Complete challenges, earn rewards, and show off your wine mastery!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}/{stats.total}</div>
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-xs text-purple-500">{Math.round((stats.completed / stats.total) * 100)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalXP.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total XP</div>
            <div className="text-xs text-yellow-500">From achievements</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPrestige}</div>
            <div className="text-sm text-gray-600">Prestige Points</div>
            <div className="text-xs text-purple-500">Earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {mockAchievements.filter(a => a.rarity === 'legendary' && a.isCompleted).length}
            </div>
            <div className="text-sm text-gray-600">Legendary</div>
            <div className="text-xs text-red-500">Ultra rare</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map(category => {
          const IconComponent = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredAchievements.map(achievement => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
            onShare={handleShare}
          />
        ))}
      </div>

      {/* Daily/Weekly Challenges */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Target className="h-6 w-6 text-green-600 mr-2" />
          Active Challenges
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🎯</div>
                  <div>
                    <div className="font-semibold">Daily Discovery</div>
                    <div className="text-sm text-gray-600">Discover 3 wines today</div>
                  </div>
                </div>
                <Badge className="bg-green-500">2/3</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
              </div>
              <div className="text-xs text-gray-500">Resets in 8 hours</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">⚔️</div>
                  <div>
                    <div className="font-semibold">Battle Week</div>
                    <div className="text-sm text-gray-600">Win 5 battles this week</div>
                  </div>
                </div>
                <Badge variant="outline">1/5</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-blue-500 h-2 rounded-full w-1/5"></div>
              </div>
              <div className="text-xs text-gray-500">Resets in 4 days</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievement Tips */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
            Achievement Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Unlock More Achievements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Discover wines daily to unlock discovery achievements</li>
                <li>• Battle other players to earn combat badges</li>
                <li>• Explore different wine regions for collection rewards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Share Your Success</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Share completed achievements on social media</li>
                <li>• Challenge friends to beat your milestones</li>
                <li>• Join guilds to work toward group achievements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      {shareAchievement && (
        <ShareModal 
          achievement={shareAchievement} 
          onClose={() => setShareAchievement(null)} 
        />
      )}
    </div>
  )
}