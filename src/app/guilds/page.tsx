'use client'

import { useState } from 'react'
import { Users, Crown, Trophy, Target, TrendingUp, Shield, Gift, Star, Swords, Plus, Search, Calendar, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Mock guild data
const mockGuilds = [
  {
    id: 1,
    name: "Wine Explorers United",
    description: "A community of passionate wine discoverers exploring the world one bottle at a time.",
    type: "casual",
    memberCount: 47,
    maxMembers: 100,
    level: 8,
    totalExperience: 125000,
    isPublic: true,
    requiresApproval: false,
    focusRegion: "Global",
    guildMaster: {
      username: "WineMaster2024",
      displayName: "Sarah Chen"
    },
    banner: "🍇",
    colorTheme: "#8B5CF6",
    weeklyGoal: {
      target: 200,
      current: 156,
      description: "Wine discoveries this week"
    },
    recentActivity: [
      "Marcus discovered Dom Pérignon 2012",
      "Emma won guild tournament",
      "Alex reached level 15"
    ],
    perks: ["10% XP Bonus", "Guild Storage", "Weekly Events"],
    isJoined: false
  },
  {
    id: 2,
    name: "Bordeaux Legends",
    description: "Elite guild focused on French wines, especially Bordeaux. Competitive players welcome!",
    type: "competitive",
    memberCount: 23,
    maxMembers: 30,
    level: 12,
    totalExperience: 200000,
    isPublic: true,
    requiresApproval: true,
    focusRegion: "France",
    guildMaster: {
      username: "BordeauxKing",
      displayName: "Pierre Dubois"
    },
    banner: "🇫🇷",
    colorTheme: "#DC2626",
    weeklyGoal: {
      target: 150,
      current: 89,
      description: "French wines discovered"
    },
    recentActivity: [
      "Guild won regional championship",
      "New member Claire joined",
      "Weekly French wine tasting event"
    ],
    perks: ["15% French Wine XP", "Battle Bonuses", "Expert Mentoring"],
    isJoined: false,
    requirements: ["Level 15+", "50+ French wines", "Battle rating 1200+"]
  },
  {
    id: 3,
    name: "Casual Sippers",
    description: "Relaxed guild for wine enthusiasts who enjoy discovering wines at their own pace.",
    type: "educational",
    memberCount: 89,
    maxMembers: 150,
    level: 6,
    totalExperience: 89000,
    isPublic: true,
    requiresApproval: false,
    focusRegion: "Global",
    guildMaster: {
      username: "ChillWineVibes",
      displayName: "Emma Johnson"
    },
    banner: "🌸",
    colorTheme: "#EC4899",
    weeklyGoal: {
      target: 300,
      current: 245,
      description: "Members helped with tastings"
    },
    recentActivity: [
      "Weekly beginner's wine guide published",
      "10 new members this week",
      "Educational wine pairing event"
    ],
    perks: ["Learning Resources", "Beginner Support", "Social Events"],
    isJoined: true,
    myRank: "Officer",
    contributionScore: 1250
  }
]

const myGuild = mockGuilds.find(g => g.isJoined)

// Mock referral data
const mockReferralData = {
  totalReferrals: 8,
  successfulReferrals: 5,
  pendingReferrals: 3,
  referralRewards: {
    xp: 2500,
    prestigePoints: 400,
    specialItems: 2
  },
  referralCode: "WINE-MASTER-2024",
  monthlyTarget: 10,
  recentReferrals: [
    {
      username: "NewWineLover", 
      status: "active",
      joinDate: "2024-02-10",
      level: 8,
      reward: "250 XP + Pet Accessory"
    },
    {
      username: "VintageSeeker",
      status: "active", 
      joinDate: "2024-02-08",
      level: 12,
      reward: "250 XP + Battle Boost"
    },
    {
      username: "CellarBuilder",
      status: "pending",
      joinDate: "2024-02-15",
      level: 3,
      reward: "Pending (Level 5 required)"
    }
  ]
}

const GuildCard = ({ guild, onJoin, onView }: {
  guild: any,
  onJoin: (guildId: number) => void,
  onView: (guildId: number) => void
}) => {
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'casual': return 'bg-green-100 text-green-800'
      case 'competitive': return 'bg-red-100 text-red-800'
      case 'educational': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${guild.isJoined ? 'ring-2 ring-purple-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{guild.banner}</div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{guild.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getTypeColor(guild.type)}>
                  {guild.type.charAt(0).toUpperCase() + guild.type.slice(1)}
                </Badge>
                <Badge variant="outline">Level {guild.level}</Badge>
                {guild.isJoined && (
                  <Badge className="bg-purple-600 text-white">Joined</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">{guild.memberCount}/{guild.maxMembers}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{guild.description}</p>

        {/* Guild Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{guild.totalExperience.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total XP</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{guild.focusRegion}</div>
            <div className="text-xs text-gray-600">Focus</div>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Weekly Goal</span>
            <span className="text-sm text-gray-600">
              {guild.weeklyGoal.current}/{guild.weeklyGoal.target}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((guild.weeklyGoal.current / guild.weeklyGoal.target) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{guild.weeklyGoal.description}</div>
        </div>

        {/* Guild Perks */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Guild Perks:</div>
          <div className="flex flex-wrap gap-1">
            {guild.perks.map((perk: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {perk}
              </Badge>
            ))}
          </div>
        </div>

        {/* Guild Master */}
        <div className="mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Crown className="h-4 w-4 text-yellow-600 mr-1" />
            <span>Led by {guild.guildMaster.displayName}</span>
          </div>
        </div>

        {/* Requirements */}
        {guild.requirements && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2 text-orange-600">Requirements:</div>
            <div className="space-y-1">
              {guild.requirements.map((req: string, index: number) => (
                <div key={index} className="text-xs text-gray-600 flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  {req}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {guild.isJoined ? (
            <>
              <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Users className="h-3 w-3 mr-1" />
                Guild Hub
              </Button>
              <Button size="sm" variant="outline" onClick={() => onView(guild.id)}>
                View Details
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => onJoin(guild.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {guild.requiresApproval ? 'Apply to Join' : 'Join Guild'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onView(guild.id)}>
                View
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const ReferralSection = () => {
  const [showReferralCode, setShowReferralCode] = useState(false)
  
  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{mockReferralData.successfulReferrals}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{mockReferralData.pendingReferrals}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{mockReferralData.referralRewards.xp}</div>
            <div className="text-sm text-gray-600">Bonus XP</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{mockReferralData.referralRewards.prestigePoints}</div>
            <div className="text-sm text-gray-600">Prestige</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Gift className="h-5 w-5 text-green-600 mr-2" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-green-700 font-mono tracking-wider">
                {showReferralCode ? mockReferralData.referralCode : '••••••••••••••••'}
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                size="sm"
                onClick={() => setShowReferralCode(!showReferralCode)}
                variant="outline"
              >
                {showReferralCode ? 'Hide Code' : 'Show Code'}
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Copy & Share
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Referral Progress This Month</div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${(mockReferralData.successfulReferrals / mockReferralData.monthlyTarget) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {mockReferralData.successfulReferrals}/{mockReferralData.monthlyTarget} successful referrals
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReferralData.recentReferrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🍷</div>
                  <div>
                    <div className="font-semibold">{referral.username}</div>
                    <div className="text-sm text-gray-600">
                      Joined {referral.joinDate} • Level {referral.level}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={referral.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {referral.status}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">{referral.reward}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function GuildsPage() {
  const [activeTab, setActiveTab] = useState('guilds')
  const [searchTerm, setSearchTerm] = useState('')
  const [guilds] = useState(mockGuilds)

  const handleJoinGuild = (guildId: number) => {
    console.log('Join guild', guildId)
  }

  const handleViewGuild = (guildId: number) => {
    console.log('View guild', guildId)
  }

  const filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guild.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 animate-pulse"></div>
            <Shield className="h-12 w-12 text-purple-600 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Guilds & Growth
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join wine guilds and grow the community through referrals!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={activeTab === 'guilds' ? 'default' : 'outline'}
          onClick={() => setActiveTab('guilds')}
          className={activeTab === 'guilds' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          <Shield className="h-4 w-4 mr-2" />
          Wine Guilds
        </Button>
        
        <Button
          variant={activeTab === 'referrals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('referrals')}
          className={activeTab === 'referrals' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Gift className="h-4 w-4 mr-2" />
          Referral Program
        </Button>
      </div>

      {/* My Guild Summary (if joined) */}
      {activeTab === 'guilds' && myGuild && (
        <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 text-yellow-600 mr-2" />
              My Guild: {myGuild.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{myGuild.level}</div>
                <div className="text-sm text-gray-600">Guild Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{myGuild.myRank}</div>
                <div className="text-sm text-gray-600">My Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{myGuild.contributionScore}</div>
                <div className="text-sm text-gray-600">Contribution</div>
              </div>
              <div className="text-center">
                <Link href="/guilds/my-guild">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Guild Hub
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content based on active tab */}
      {activeTab === 'guilds' && (
        <div className="space-y-8">
          {/* Search */}
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search guilds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Create Guild Button */}
          <div className="text-center">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Create New Guild
            </Button>
          </div>

          {/* Guilds Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuilds.map(guild => (
              <GuildCard
                key={guild.id}
                guild={guild}
                onJoin={handleJoinGuild}
                onView={handleViewGuild}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <ReferralSection />
      )}

      {/* Guild Benefits */}
      {activeTab === 'guilds' && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Star className="h-6 w-6 text-blue-600 mr-2" />
            Guild Benefits
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">XP Bonuses</h3>
              <p className="text-sm text-gray-600">Earn extra experience points for wine discoveries when in a guild</p>
            </div>
            
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community Events</h3>
              <p className="text-sm text-gray-600">Participate in guild-only events, tournaments, and challenges</p>
            </div>
            
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Exclusive Rewards</h3>
              <p className="text-sm text-gray-600">Access guild-exclusive items, badges, and prestige rewards</p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Benefits */}
      {activeTab === 'referrals' && (
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Gift className="h-6 w-6 text-green-600 mr-2" />
            Referral Rewards
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-1">250 XP</h3>
              <p className="text-sm text-gray-600">Per successful referral</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">👑</div>
              <h3 className="font-semibold mb-1">50 Prestige</h3>
              <p className="text-sm text-gray-600">Bonus prestige points</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-semibold mb-1">Special Items</h3>
              <p className="text-sm text-gray-600">Exclusive pet accessories</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold mb-1">Achievements</h3>
              <p className="text-sm text-gray-600">Referral milestone badges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}