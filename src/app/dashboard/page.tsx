'use client'

import { useState, useEffect } from 'react'
import { Wine, Camera, Heart, Trophy, Users, Star, Target, TrendingUp, Zap, Crown, Gift, Sparkles, Gamepad2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Mock user data - in real app this would come from auth store
const mockUser = {
  username: "WineExplorer2024",
  displayName: "Sarah Chen",
  level: 12,
  experience: 2750,
  experienceToNext: 3000,
  prestigeLevel: 1,
  prestigePoints: 150,
  
  // Gaming stats
  winesDiscovered: 47,
  totalRegions: 8,
  currentStreak: 7,
  longestStreak: 15,
  
  // Pet info
  pet: {
    name: "Vinny",
    species: "Grape Guardian", 
    level: 10,
    happiness: 92,
    health: 85,
    energy: 67,
    mood: "happy",
    isHungry: true,
    evolution: {
      stage: 2,
      nextStageName: "Wine Sage",
      progress: 75
    }
  },
  
  // Achievements
  recentAchievements: [
    { name: "Regional Explorer", icon: "🗺️", rarity: "uncommon" },
    { name: "Wine Lover", icon: "❤️", rarity: "common" }
  ],
  
  // Social
  friendCount: 12,
  guildName: "Wine Explorers United",
  guildRank: "Officer",
  
  // Battle
  battleRating: 1340,
  battleWins: 15,
  battleLosses: 3
}

// Daily challenges
const dailyChallenges = [
  {
    id: 1,
    title: "Daily Discovery",
    description: "Discover 3 wines today",
    progress: 2,
    target: 3,
    reward: "150 XP",
    icon: "🎯",
    type: "discovery"
  },
  {
    id: 2,
    title: "Pet Care",
    description: "Feed your pet 2 times",
    progress: 1,
    target: 2,
    reward: "100 XP",
    icon: "🐾",
    type: "pet"
  },
  {
    id: 3,
    title: "Social Butterfly",
    description: "Battle 1 friend today",
    progress: 0,
    target: 1,
    reward: "200 XP",
    icon: "⚔️",
    type: "battle"
  }
]

// Quick actions for mobile gaming
const quickActions = [
  {
    label: "Capture Wine",
    href: "/capture",
    icon: Camera,
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    badge: "Hot"
  },
  {
    label: "Feed Pet",
    href: "/pet",
    icon: Heart,
    color: "bg-gradient-to-r from-red-500 to-pink-500",
    badge: "Hungry!"
  },
  {
    label: "Battle Arena",
    href: "/battle",
    icon: Gamepad2,
    color: "bg-gradient-to-r from-purple-500 to-indigo-500",
    badge: null
  },
  {
    label: "View Collection", 
    href: "/collection",
    icon: Wine,
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    badge: null
  }
]

// Gaming notifications
const GameNotification = ({ notification, onDismiss }: { notification: any, onDismiss: () => void }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl mb-4 animate-in slide-in-from-top-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{notification.icon}</div>
          <div>
            <div className="font-semibold">{notification.title}</div>
            <div className="text-sm opacity-90">{notification.message}</div>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={onDismiss} className="text-white hover:bg-white/20">
          ✕
        </Button>
      </div>
    </div>
  )
}

// Mobile-friendly stat card
const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-purple-600", onClick }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string | number
  subtitle: string
  color?: string
  onClick?: () => void
}) => {
  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer active:scale-95' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-100`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-gray-900 truncate">{value}</div>
            <div className="text-sm text-gray-600 truncate">{title}</div>
            {subtitle && <div className="text-xs text-gray-500 truncate">{subtitle}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function GamingDashboard() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: "🏆",
      title: "Achievement Unlocked!",
      message: "You earned 'Regional Explorer'",
      timestamp: Date.now()
    }
  ])

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const levelProgress = (mockUser.experience / mockUser.experienceToNext) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <div className="font-bold text-lg">{mockUser.displayName}</div>
                <div className="text-purple-200 text-sm">@{mockUser.username}</div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white mb-1">
                Level {mockUser.level}
              </Badge>
              {mockUser.prestigeLevel > 0 && (
                <Badge className="bg-yellow-400 text-yellow-900">
                  Prestige {mockUser.prestigeLevel}
                </Badge>
              )}
            </div>
          </div>

          {/* XP Progress */}
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Experience</span>
              <span className="text-sm">{mockUser.experience.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="text-xs text-purple-200 mt-1">
              {mockUser.experienceToNext - mockUser.experience} XP to Level {mockUser.level + 1}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-4">
          {notifications.map(notification => (
            <GameNotification
              key={notification.id}
              notification={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          ))}
        </div>

        {/* Pet Status (Prominent for mobile) */}
        <div className="p-4">
          <Card className={`border-2 ${mockUser.pet.isHungry ? 'border-red-200 bg-red-50' : 'border-purple-200 bg-purple-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🐾</div>
                  <div>
                    <div className="font-bold">{mockUser.pet.name}</div>
                    <div className="text-sm text-gray-600">Level {mockUser.pet.level} {mockUser.pet.species}</div>
                  </div>
                </div>
                <Link href="/pet">
                  <Button size="sm" className={mockUser.pet.isHungry ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}>
                    {mockUser.pet.isHungry ? 'Feed Now!' : 'Visit'}
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">{mockUser.pet.health}</div>
                  <div className="text-xs text-gray-600">Health</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-500">{mockUser.pet.happiness}</div>
                  <div className="text-xs text-gray-600">Happy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">{mockUser.pet.energy}</div>
                  <div className="text-xs text-gray-600">Energy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link key={index} href={action.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 active:scale-95">
                    <CardContent className="p-4">
                      <div className={`${action.color} rounded-lg p-3 flex items-center justify-center mb-3 relative`}>
                        <IconComponent className="h-6 w-6 text-white" />
                        {action.badge && (
                          <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="font-semibold text-center text-sm">{action.label}</div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Gaming Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              icon={Wine}
              title="Wines Discovered"
              value={mockUser.winesDiscovered}
              subtitle={`${mockUser.totalRegions} regions`}
              color="text-purple-600"
              onClick={() => window.location.href = '/collection'}
            />
            <StatCard
              icon={Trophy}
              title="Battle Rating"
              value={mockUser.battleRating}
              subtitle={`${mockUser.battleWins}W/${mockUser.battleLosses}L`}
              color="text-red-600"
              onClick={() => window.location.href = '/battle'}
            />
            <StatCard
              icon={Users}
              title="Friends"
              value={mockUser.friendCount}
              subtitle="Online friends"
              color="text-blue-600"
              onClick={() => window.location.href = '/friends'}
            />
            <StatCard
              icon={Zap}
              title="Streak"
              value={`${mockUser.currentStreak} days`}
              subtitle={`Record: ${mockUser.longestStreak}`}
              color="text-green-600"
            />
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                Daily Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyChallenges.map(challenge => {
                const isCompleted = challenge.progress >= challenge.target
                const progressPercentage = (challenge.progress / challenge.target) * 100
                
                return (
                  <div key={challenge.id} className={`p-3 rounded-lg border-2 transition-all ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{challenge.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{challenge.title}</div>
                          <div className="text-xs text-gray-600">{challenge.description}</div>
                        </div>
                      </div>
                      <Badge className={isCompleted ? 'bg-green-500' : 'bg-gray-500'}>
                        {challenge.reward}
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>{challenge.progress}/{challenge.target}</span>
                      {isCompleted && <span className="text-green-600 font-semibold">Complete!</span>}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <div className="p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-600 mr-2" />
                  Recent Achievements
                </div>
                <Link href="/achievements">
                  <Button size="sm" variant="outline">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUser.recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{achievement.name}</div>
                      <Badge className={`text-xs ${achievement.rarity === 'uncommon' ? 'bg-green-500' : 'bg-gray-500'}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      Share
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guild Status */}
        <div className="p-4 pb-8">
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{mockUser.guildName}</div>
                    <div className="text-sm text-gray-600">{mockUser.guildRank}</div>
                  </div>
                </div>
                <Link href="/guilds">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Guild Hub
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}