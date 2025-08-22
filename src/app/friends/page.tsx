'use client'

import { useState } from 'react'
import { Users, Search, UserPlus, MessageCircle, Trophy, Swords, Gift, Crown, Star, Heart, Zap, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Mock friends data
const mockFriends = [
  {
    id: 1,
    username: "WineExplorer23",
    displayName: "Sarah Chen",
    level: 15,
    avatar: "🍇",
    status: "online",
    petName: "Grape Guardian",
    petLevel: 12,
    totalWines: 87,
    battleRating: 1450,
    lastActive: "2 hours ago",
    friendshipLevel: 3,
    sharedDiscoveries: 12,
    recentActivity: "Discovered Château Margaux 2015",
    badges: ["Wine Explorer", "Battle Champion"],
    canBattle: true,
    battleRecord: { wins: 23, losses: 8 }
  },
  {
    id: 2,
    username: "VintageHunter",
    displayName: "Marcus Johnson", 
    level: 22,
    avatar: "🍷",
    status: "offline",
    petName: "Vine Sage",
    petLevel: 18,
    totalWines: 134,
    battleRating: 1680,
    lastActive: "1 day ago",
    friendshipLevel: 5,
    sharedDiscoveries: 28,
    recentActivity: "Won guild tournament",
    badges: ["Master Taster", "Guild Champion", "Regional Expert"],
    canBattle: false,
    battleRecord: { wins: 45, losses: 12 }
  },
  {
    id: 3,
    username: "CellarMaster",
    displayName: "Emma Rodriguez",
    level: 11,
    avatar: "🏆",
    status: "online",
    petName: "Wine Sprite", 
    petLevel: 9,
    totalWines: 52,
    battleRating: 1280,
    lastActive: "Online",
    friendshipLevel: 2,
    sharedDiscoveries: 5,
    recentActivity: "Evolved pet to Stage 3",
    badges: ["Pet Parent", "Evolution Master"],
    canBattle: true,
    battleRecord: { wins: 15, losses: 7 }
  }
]

const mockFriendRequests = [
  {
    id: 1,
    username: "NewWineLover",
    displayName: "Alex Kim",
    level: 8,
    avatar: "🌟",
    totalWines: 23,
    mutualFriends: 2,
    requestTime: "2 days ago"
  },
  {
    id: 2,
    username: "BordeauxFan", 
    displayName: "Claire Martin",
    level: 19,
    avatar: "🇫🇷",
    totalWines: 98,
    mutualFriends: 1,
    requestTime: "5 hours ago"
  }
]

const mockRecommendedFriends = [
  {
    id: 1,
    username: "TuscanyTraveler",
    displayName: "Giovanni Rossi",
    level: 17,
    avatar: "🇮🇹",
    totalWines: 76,
    battleRating: 1380,
    commonInterests: ["Italian Wines", "Wine Travel", "Food Pairing"],
    mutualFriends: 3,
    reason: "Similar wine preferences"
  },
  {
    id: 2,
    username: "SparklingSpecialist",
    displayName: "Marie Dubois", 
    level: 20,
    avatar: "🥂",
    totalWines: 112,
    battleRating: 1520,
    commonInterests: ["Champagne", "Sparkling Wines", "Celebrations"],
    mutualFriends: 1,
    reason: "Active in your region"
  }
]

const FriendCard = ({ friend, onBattle, onTrade, onMessage }: { 
  friend: any, 
  onBattle: (friend: any) => void,
  onTrade: (friend: any) => void,
  onMessage: (friend: any) => void 
}) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="text-4xl">{friend.avatar}</div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(friend.status)} border-2 border-white`}></div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{friend.displayName}</h3>
              <p className="text-sm text-gray-600">@{friend.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-purple-100 text-purple-800 text-xs">
                  Level {friend.level}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {friend.totalWines} wines
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Last active</div>
            <div className="text-sm font-medium">{friend.lastActive}</div>
          </div>
        </div>

        {/* Friendship Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center">
              <Heart className="h-4 w-4 text-red-500 mr-1" />
              Friendship Level {friend.friendshipLevel}
            </span>
            <span className="text-xs text-gray-500">{friend.sharedDiscoveries} shared discoveries</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-pink-500 h-2 rounded-full"
              style={{ width: `${(friend.friendshipLevel / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Pet & Battle Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{friend.petLevel}</div>
            <div className="text-xs text-gray-600">{friend.petName}</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{friend.battleRating}</div>
            <div className="text-xs text-gray-600">Battle Rating</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Recent Activity</div>
          <div className="text-sm text-gray-700">{friend.recentActivity}</div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-4">
          {friend.badges.slice(0, 3).map((badge: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {badge}
            </Badge>
          ))}
          {friend.badges.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{friend.badges.length - 3} more
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onMessage(friend)}
            className="flex items-center justify-center"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Message
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onBattle(friend)}
            disabled={!friend.canBattle}
            className={`flex items-center justify-center ${friend.canBattle ? 'text-red-600 border-red-600 hover:bg-red-50' : ''}`}
          >
            <Swords className="h-3 w-3 mr-1" />
            Battle
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onTrade(friend)}
            className="flex items-center justify-center text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Gift className="h-3 w-3 mr-1" />
            Trade
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const FriendRequestCard = ({ request, onAccept, onDecline }: {
  request: any,
  onAccept: (id: number) => void,
  onDecline: (id: number) => void
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{request.avatar}</div>
            <div>
              <h4 className="font-semibold">{request.displayName}</h4>
              <p className="text-sm text-gray-600">@{request.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">Level {request.level}</Badge>
                <Badge variant="outline" className="text-xs">{request.totalWines} wines</Badge>
              </div>
              {request.mutualFriends > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {request.mutualFriends} mutual friends
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              onClick={() => onAccept(request.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDecline(request.id)}
            >
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const RecommendedFriendCard = ({ friend, onAddFriend }: {
  friend: any,
  onAddFriend: (id: number) => void
}) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{friend.avatar}</div>
            <div>
              <h4 className="font-semibold">{friend.displayName}</h4>
              <p className="text-sm text-gray-600">@{friend.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">Level {friend.level}</Badge>
                <Badge variant="outline" className="text-xs">{friend.totalWines} wines</Badge>
              </div>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={() => onAddFriend(friend.id)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Common interests:</div>
          <div className="flex flex-wrap gap-1">
            {friend.commonInterests.slice(0, 2).map((interest: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-blue-600">{friend.reason}</div>
      </CardContent>
    </Card>
  )
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('friends')
  const [searchTerm, setSearchTerm] = useState('')
  const [friends] = useState(mockFriends)
  const [friendRequests] = useState(mockFriendRequests)

  const handleBattle = (friend: any) => {
    // Navigate to battle page with friend
    console.log('Battle with', friend.username)
  }

  const handleTrade = (friend: any) => {
    // Open trade interface
    console.log('Trade with', friend.username)
  }

  const handleMessage = (friend: any) => {
    // Open chat interface
    console.log('Message', friend.username)
  }

  const handleAcceptRequest = (id: number) => {
    console.log('Accept request', id)
  }

  const handleDeclineRequest = (id: number) => {
    console.log('Decline request', id)
  }

  const handleAddFriend = (id: number) => {
    console.log('Add friend', id)
  }

  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            <Users className="h-12 w-12 text-blue-600 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Wine Friends
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with fellow wine enthusiasts, battle pets, and share discoveries!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{friends.length}</div>
            <div className="text-sm text-gray-600">Friends</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{friendRequests.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {friends.filter(f => f.canBattle).length}
            </div>
            <div className="text-sm text-gray-600">Online</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {friends.reduce((sum, f) => sum + f.sharedDiscoveries, 0)}
            </div>
            <div className="text-sm text-gray-600">Shared</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <Button
          variant={activeTab === 'friends' ? 'default' : 'outline'}
          onClick={() => setActiveTab('friends')}
          className={activeTab === 'friends' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <Users className="h-4 w-4 mr-2" />
          My Friends ({friends.length})
        </Button>
        
        <Button
          variant={activeTab === 'requests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('requests')}
          className={activeTab === 'requests' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Requests ({friendRequests.length})
        </Button>
        
        <Button
          variant={activeTab === 'discover' ? 'default' : 'outline'}
          onClick={() => setActiveTab('discover')}
          className={activeTab === 'discover' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          <Search className="h-4 w-4 mr-2" />
          Discover Friends
        </Button>
      </div>

      {/* Search Bar for Friends */}
      {activeTab === 'friends' && (
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'friends' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFriends.map(friend => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onBattle={handleBattle}
              onTrade={handleTrade}
              onMessage={handleMessage}
            />
          ))}
          
          {filteredFriends.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No friends found' : 'No friends yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try a different search term' : 'Start connecting with other wine enthusiasts!'}
              </p>
              <Button onClick={() => setActiveTab('discover')}>
                <Search className="h-4 w-4 mr-2" />
                Discover Friends
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {friendRequests.map(request => (
            <FriendRequestCard
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
            />
          ))}
          
          {friendRequests.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No pending requests</h3>
              <p className="text-gray-500">New friend requests will appear here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="space-y-8">
          {/* Search for users */}
          <div className="text-center mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by username or email..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Recommended Friends */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-600 mr-2" />
              Recommended for You
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockRecommendedFriends.map(friend => (
                <RecommendedFriendCard
                  key={friend.id}
                  friend={friend}
                  onAddFriend={handleAddFriend}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connect with Friends</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 h-auto py-4">
                <div className="text-center">
                  <MessageCircle className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-semibold">Invite via Message</div>
                  <div className="text-xs opacity-90">Share your friend code</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 border-purple-300 hover:bg-purple-50">
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-semibold">Find Nearby Players</div>
                  <div className="text-xs opacity-70">Discover local wine enthusiasts</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}