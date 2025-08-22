'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Mic, Image, Sparkles, Trophy, Star, Gift, Wine, Zap, Target, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Gaming reward animations
const RewardAnimation = ({ reward, onComplete }: { reward: any, onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wine Discovered!</h2>
          <p className="text-lg text-purple-600 font-semibold">{reward.wine.name}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{reward.experience}</div>
              <div className="text-sm text-gray-600">XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">+{reward.petHappiness}</div>
              <div className="text-sm text-gray-600">Pet Happiness</div>
            </div>
          </div>

          <Badge className={`${reward.wine.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-purple-600'} text-white px-6 py-2`}>
            {reward.wine.rarity.charAt(0).toUpperCase() + reward.wine.rarity.slice(1)} Wine!
          </Badge>

          {reward.firstDiscovery && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-center text-yellow-800">
                <Star className="h-5 w-5 mr-2" />
                <span className="font-semibold">First Discovery Bonus!</span>
              </div>
              <div className="text-sm text-yellow-700 mt-1">+{reward.firstDiscoveryBonus} XP</div>
            </div>
          )}

          {reward.achievements && reward.achievements.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="font-semibold text-purple-800 mb-2">Achievement Unlocked!</div>
              {reward.achievements.map((achievement: string, index: number) => (
                <Badge key={index} className="bg-purple-600 text-white mr-2 mb-1">
                  {achievement}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link href="/collection">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              View Collection
            </Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={onComplete}>
            Discover Another
          </Button>
        </div>
      </div>
    </div>
  )
}

const CapturePreview = ({ mode, isCapturing }: { mode: 'camera' | 'voice', isCapturing: boolean }) => {
  return (
    <div className="relative bg-gray-900 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden">
      {/* Animated border when capturing */}
      {isCapturing && (
        <div className="absolute inset-0 border-4 border-purple-500 rounded-xl animate-pulse"></div>
      )}
      
      {/* Preview content */}
      <div className="text-center text-white">
        {mode === 'camera' ? (
          <div>
            <Camera className={`h-16 w-16 mx-auto mb-4 ${isCapturing ? 'text-purple-400 animate-pulse' : 'text-gray-400'}`} />
            <p className="text-lg font-semibold mb-2">
              {isCapturing ? 'Capturing Wine...' : 'Point at Wine Label'}
            </p>
            <p className="text-sm text-gray-300">
              Position the wine bottle or label in the center
            </p>
          </div>
        ) : (
          <div>
            <Mic className={`h-16 w-16 mx-auto mb-4 ${isCapturing ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
            <p className="text-lg font-semibold mb-2">
              {isCapturing ? 'Recording...' : 'Voice Wine Description'}
            </p>
            <p className="text-sm text-gray-300">
              Describe what you're tasting in detail
            </p>
          </div>
        )}
        
        {/* Recording timer */}
        {isCapturing && mode === 'voice' && (
          <div className="mt-4">
            <div className="bg-red-600 rounded-full px-4 py-1 text-sm font-bold animate-pulse">
              ● REC 00:15
            </div>
          </div>
        )}
      </div>
      
      {/* Gaming overlay effects */}
      {isCapturing && (
        <>
          <Sparkles className="absolute top-4 left-4 h-6 w-6 text-yellow-400 animate-bounce" />
          <Sparkles className="absolute top-4 right-4 h-6 w-6 text-pink-400 animate-bounce delay-100" />
          <Sparkles className="absolute bottom-4 left-4 h-6 w-6 text-blue-400 animate-bounce delay-200" />
          <Sparkles className="absolute bottom-4 right-4 h-6 w-6 text-green-400 animate-bounce delay-300" />
        </>
      )}
    </div>
  )
}

const QuickStats = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.todayDiscoveries}</div>
          <div className="text-sm text-gray-600">Today</div>
          <div className="flex justify-center mt-1">
            <Target className="h-4 w-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.streak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
          <div className="flex justify-center mt-1">
            <Zap className="h-4 w-4 text-green-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const CaptureBoosts = ({ boosts }: { boosts: any[] }) => {
  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Gift className="h-5 w-5 text-yellow-600 mr-2" />
          Active Boosts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {boosts.map((boost, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{boost.icon}</div>
                <div>
                  <div className="font-semibold text-sm">{boost.name}</div>
                  <div className="text-xs text-gray-600">{boost.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{boost.multiplier}x</div>
                <div className="text-xs text-gray-500">{boost.timeLeft}</div>
              </div>
            </div>
          ))}
          
          {boosts.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <Gift className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No active boosts</p>
              <p className="text-xs text-gray-400">Discover wines daily to earn boosts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CapturePage() {
  const [captureMode, setCaptureMode] = useState<'camera' | 'voice'>('camera')
  const [isCapturing, setIsCapturing] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [captureCount, setCaptureCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock data
  const mockStats = {
    todayDiscoveries: 3,
    streak: 7,
    totalWines: 47,
    xpToday: 320
  }

  const mockBoosts = [
    {
      icon: "🔥",
      name: "Hot Streak",
      description: "7+ day streak bonus",
      multiplier: 1.5,
      timeLeft: "Forever"
    },
    {
      icon: "🎯",
      name: "First Discovery",
      description: "Next rare wine bonus",
      multiplier: 2.0,
      timeLeft: "24h"
    }
  ]

  const mockReward = {
    wine: {
      name: "Château Margaux 2015",
      rarity: "legendary",
      region: "Bordeaux, France"
    },
    experience: 250,
    petHappiness: 15,
    firstDiscovery: true,
    firstDiscoveryBonus: 100,
    achievements: ["Regional Explorer", "Legendary Hunter"]
  }

  const startCapture = useCallback(() => {
    setIsCapturing(true)
    
    if (captureMode === 'camera') {
      // Simulate camera capture
      setTimeout(() => {
        setIsCapturing(false)
        setShowReward(true)
        setCaptureCount(prev => prev + 1)
      }, 2000)
    } else {
      // Simulate voice recording
      setTimeout(() => {
        setIsCapturing(false)
        setShowReward(true)
        setCaptureCount(prev => prev + 1)
      }, 3000)
    }
  }, [captureMode])

  const switchMode = (mode: 'camera' | 'voice') => {
    if (!isCapturing) {
      setCaptureMode(mode)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 animate-pulse"></div>
            <Wine className="h-12 w-12 text-purple-600 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Wine Discovery
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Snap a photo or record your tasting notes to instantly add wines to your collection!
        </p>
        
        <div className="flex justify-center gap-2">
          <Badge className="bg-green-100 text-green-800">+{mockStats.xpToday} XP Today</Badge>
          <Badge className="bg-blue-100 text-blue-800">{mockStats.streak} Day Streak</Badge>
          <Badge className="bg-purple-100 text-purple-800">{mockStats.totalWines} Total Wines</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Capture Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selector */}
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant={captureMode === 'camera' ? 'default' : 'outline'}
              onClick={() => switchMode('camera')}
              disabled={isCapturing}
              className={captureMode === 'camera' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <Camera className="h-5 w-5 mr-2" />
              Photo Capture
            </Button>
            <Button
              size="lg"
              variant={captureMode === 'voice' ? 'default' : 'outline'}
              onClick={() => switchMode('voice')}
              disabled={isCapturing}
              className={captureMode === 'voice' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <Mic className="h-5 w-5 mr-2" />
              Voice Notes
            </Button>
          </div>

          {/* Capture Preview */}
          <Card>
            <CardContent className="p-6">
              <CapturePreview mode={captureMode} isCapturing={isCapturing} />
              
              {/* Capture Controls */}
              <div className="flex justify-center mt-6">
                <Button
                  size="lg"
                  onClick={startCapture}
                  disabled={isCapturing}
                  className={`px-8 py-4 text-lg font-semibold ${
                    captureMode === 'camera' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  {isCapturing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      {captureMode === 'camera' ? 'Processing...' : 'Recording...'}
                    </>
                  ) : (
                    <>
                      {captureMode === 'camera' ? (
                        <Camera className="h-5 w-5 mr-2" />
                      ) : (
                        <Mic className="h-5 w-5 mr-2" />
                      )}
                      {captureMode === 'camera' ? 'Snap Photo' : 'Start Recording'}
                    </>
                  )}
                </Button>
              </div>
              
              {/* Helpful tips */}
              <div className="mt-4 text-center text-sm text-gray-600">
                {captureMode === 'camera' ? (
                  <p>💡 Tip: Make sure the wine label is clearly visible and well-lit</p>
                ) : (
                  <p>💡 Tip: Describe the appearance, aroma, taste, and finish</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Discoveries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
                Recent Discoveries ({captureCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {captureCount > 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: captureCount }, (_, i) => (
                    <div key={i} className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Wine className="h-8 w-8 text-purple-600 mr-3" />
                      <div className="flex-1">
                        <div className="font-semibold">Wine Discovery #{captureCount - i}</div>
                        <div className="text-sm text-gray-600">Just now • Processing...</div>
                      </div>
                      <Badge className="bg-purple-600">+250 XP</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wine className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No discoveries yet</p>
                  <p className="text-sm text-gray-400">Start capturing wines to see them here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <QuickStats stats={mockStats} />
          
          {/* Active Boosts */}
          <CaptureBoosts boosts={mockBoosts} />
          
          {/* Daily Challenge */}
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Discover 5 Wines</span>
                  <span className="text-sm text-gray-600">{mockStats.todayDiscoveries}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(mockStats.todayDiscoveries / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">+500 XP</div>
                <div className="text-sm text-gray-600">Completion Reward</div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pet Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-5 w-5 text-red-600 mr-2" />
                Pet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🐾</div>
                <div className="font-semibold">Vinny</div>
                <Badge className="bg-green-100 text-green-800">Happy</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Happiness:</span>
                  <span className="font-medium">92/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full w-[92%]"></div>
                </div>
              </div>
              
              <Link href="/pet">
                <Button size="sm" variant="outline" className="w-full mt-4">
                  Visit Pet
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reward Modal */}
      {showReward && (
        <RewardAnimation 
          reward={mockReward}
          onComplete={() => setShowReward(false)}
        />
      )}
    </div>
  )
}