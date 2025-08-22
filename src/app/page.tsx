'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Wine, Sparkles, Trophy, Users, Camera, Mic, Heart, Star, Zap, Target, Gift, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Gaming animations and effects
const GamingHero = () => {
  const [sparklePositions, setSparklePositions] = useState<Array<{x: number, y: number, id: number}>>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [xp, setXP] = useState(0)

  useEffect(() => {
    // Animated sparkles effect
    const interval = setInterval(() => {
      setSparklePositions(prev => [
        ...prev.slice(-10),
        {
          x: Math.random() * 100,
          y: Math.random() * 100,
          id: Date.now() + Math.random()
        }
      ])
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 text-white">
      {/* Animated background sparkles */}
      {sparklePositions.map(sparkle => (
        <Sparkles 
          key={sparkle.id}
          className="absolute w-6 h-6 text-yellow-300 animate-pulse opacity-70"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDuration: '2s',
            animationDelay: '0s'
          }}
        />
      ))}
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Gaming Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 text-sm font-bold">
              🏆 #1 Wine Gaming Experience
            </Badge>
          </div>

          {/* Main Logo with Animation */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
              <Wine className="h-20 w-20 text-white relative z-10 drop-shadow-lg" />
            </div>
          </div>
          
          <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            WineSnap
          </h1>
          
          <p className="mb-4 text-2xl md:text-3xl font-semibold text-purple-100">
            Gotta Taste 'Em All!
          </p>
          
          <p className="mb-12 text-lg md:text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
            Transform wine discovery into an addictive gaming experience. Collect wines like Pokemon, 
            evolve your Tamagotchi wine pet, and become the ultimate wine master!
          </p>

          {/* Gaming Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-yellow-300">{currentLevel}</div>
              <div className="text-sm text-purple-200">Player Level</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-green-300">47</div>
              <div className="text-sm text-purple-200">Wines Caught</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-red-300">12</div>
              <div className="text-sm text-purple-200">Regions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl font-bold text-blue-300">8</div>
              <div className="text-sm text-purple-200">Battle Wins</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg shadow-lg transform hover:scale-105 transition-all">
                🎮 Start Your Journey
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-3 text-lg font-semibold">
                🍷 See Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Gaming Features Section
const GamingFeatures = () => {
  const features = [
    {
      icon: <Wine className="h-12 w-12 text-purple-500" />,
      title: "Pokemon-Style Collection",
      description: "Discover and collect wines like Pokemon cards. Each wine has rarity levels from Common to Legendary!",
      badge: "Gotta Catch 'Em All",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Heart className="h-12 w-12 text-red-500" />,
      title: "Tamagotchi Wine Pet",
      description: "Your wine companion grows, evolves, and battles based on your tasting adventures. Feed it new discoveries!",
      badge: "Virtual Pet",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: <Trophy className="h-12 w-12 text-yellow-500" />,
      title: "Epic Battles & Tournaments",
      description: "Battle friends with your wine pets! Compete in tournaments and climb the leaderboards.",
      badge: "PvP Combat",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Camera className="h-12 w-12 text-green-500" />,
      title: "Instant Wine Capture",
      description: "Snap photos or record voice notes to instantly add wines to your collection with AI recognition.",
      badge: "One-Tap Capture",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <Star className="h-12 w-12 text-indigo-500" />,
      title: "Achievement System",
      description: "Unlock badges, titles, and rewards. From 'First Sip' to 'Wine Grandmaster' - show off your progress!",
      badge: "Progress Rewards",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Users className="h-12 w-12 text-blue-500" />,
      title: "Social Gaming",
      description: "Join guilds, trade wine discoveries, and challenge friends. Build your wine gaming community!",
      badge: "Multiplayer",
      color: "from-blue-500 to-indigo-500"
    }
  ]

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
            🎮 Game Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why WineSnap is Addictive
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've transformed wine tasting from a hobby into a competitive gaming experience 
            that keeps you engaged and learning every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-xl group">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${feature.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-10`}>
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats Section
const StatsSection = () => {
  const stats = [
    { number: "50K+", label: "Wines in Database", icon: <Wine className="h-8 w-8" /> },
    { number: "15→65%", label: "User Retention Boost", icon: <TrendingUp className="h-8 w-8" /> },
    { number: "2.5x", label: "Daily Engagement", icon: <Zap className="h-8 w-8" /> },
    { number: "95%", label: "Keep Playing Daily", icon: <Target className="h-8 w-8" /> }
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Gaming Changes Everything
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Traditional wine apps have 15% retention. Our gaming approach achieves 65% 
            retention with users spending 2.5x more time discovering wines.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4 text-yellow-300">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-purple-200 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Gift className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Catch Your First Wine?
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of wine gamers who've discovered that learning about wine 
            can be as addictive as your favorite mobile game.
          </p>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-10 py-4 text-xl shadow-lg">
                  🚀 Start Free - Get Starter Pet
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-2 border-gray-600 text-white hover:bg-white hover:text-gray-900 px-10 py-4 text-xl font-semibold">
                  🎮 Try Demo
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-400">
              Free forever • No credit card required • Adopt your wine pet today
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function GamifiedHomePage() {
  return (
    <div className="min-h-screen">
      <GamingHero />
      <GamingFeatures />
      <StatsSection />
      <CTASection />
    </div>
  )
}