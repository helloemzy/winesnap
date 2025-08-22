'use client'

import { useState, useEffect } from 'react'
import { Heart, Zap, Brain, Users, Trophy, Star, Gift, Gamepad2, TrendingUp, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Mock pet data
const mockPet = {
  id: 1,
  name: "Vinny",
  species: "Vine Sprout",
  level: 12,
  experience: 2750,
  experienceToNext: 3000,
  evolutionStage: 2,
  health: 85,
  happiness: 92,
  energy: 67,
  intelligence: 78,
  sociability: 83,
  
  // Wine knowledge
  wineKnowledgeScore: 1240,
  regionsDiscovered: ["Bordeaux", "Tuscany", "Napa Valley", "Barossa Valley"],
  countriesExplored: ["France", "Italy", "USA", "Australia"],
  wineStylesMastered: ["Cabernet Sauvignon", "Chardonnay", "Pinot Noir"],
  
  // Regional expertise (0-100 scale)
  frenchExpertise: 85,
  italianExpertise: 62,
  spanishExpertise: 34,
  americanExpertise: 78,
  
  // Battle stats
  battleLevel: 8,
  battleWins: 15,
  battleLosses: 3,
  battleRating: 1250,
  
  // Status
  mood: "happy",
  isHungry: true,
  isSleepy: false,
  statusEffects: ["Well Fed", "Excited"],
  
  // Care
  lastFed: "2 hours ago",
  lastInteraction: "30 minutes ago",
  feedingStreak: 7,
  interactionStreak: 12,
  
  // Visual
  sprite: "/api/placeholder/200/200",
  colorScheme: "default",
  accessories: ["Wine Glass Charm", "Grape Crown"],
  
  // Milestones
  milestonesReached: 8,
  perfectTastings: 3,
  rareDiscoveries: 5,
  
  // Evolution info
  nextEvolution: {
    name: "Vine Guardian",
    requirements: {
      level: 15,
      wineDiscoveries: 50,
      regions: 6
    }
  }
}

const PetSprite = ({ pet, className = "w-32 h-32" }: { pet: any, className?: string }) => {
  const moodColors = {
    depressed: "text-gray-400",
    sad: "text-blue-400", 
    neutral: "text-gray-600",
    content: "text-green-500",
    happy: "text-green-400",
    very_happy: "text-yellow-400",
    joyful: "text-orange-400",
    ecstatic: "text-red-400"
  }

  return (
    <div className={`relative ${className} flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-full`}>
      {/* Pet sprite placeholder */}
      <div className="relative">
        <div className={`text-6xl ${moodColors[pet.mood as keyof typeof moodColors]}`}>
          🐾
        </div>
        
        {/* Status effects */}
        {pet.statusEffects.length > 0 && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-yellow-400 rounded-full p-1">
              <Star className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
        
        {/* Hungry indicator */}
        {pet.isHungry && (
          <div className="absolute -bottom-1 -left-1">
            <div className="bg-red-500 rounded-full p-1 animate-pulse">
              <Heart className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
        
        {/* Accessories */}
        {pet.accessories.length > 0 && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
            <span className="text-xl">👑</span>
          </div>
        )}
      </div>
    </div>
  )
}

const StatBar = ({ label, value, max, color = "bg-blue-500", showNumbers = true }: { 
  label: string, 
  value: number, 
  max: number, 
  color?: string,
  showNumbers?: boolean 
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showNumbers && (
          <span className="text-sm text-gray-500">{value}/{max}</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

const PetCareActions = ({ pet }: { pet: any }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        size="lg" 
        className={`${pet.isHungry ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
      >
        <Heart className="h-4 w-4 mr-2" />
        {pet.isHungry ? "Feed Now!" : "Feed"}
      </Button>
      
      <Button size="lg" variant="outline">
        <Heart className="h-4 w-4 mr-2" />
        Play
      </Button>
      
      <Button size="lg" variant="outline">
        <Brain className="h-4 w-4 mr-2" />
        Train
      </Button>
      
      <Button size="lg" variant="outline">
        <Gift className="h-4 w-4 mr-2" />
        Give Gift
      </Button>
    </div>
  )
}

const RegionalExpertise = ({ pet }: { pet: any }) => {
  const regions = [
    { name: "France", expertise: pet.frenchExpertise, color: "bg-blue-500", flag: "🇫🇷" },
    { name: "Italy", expertise: pet.italianExpertise, color: "bg-green-500", flag: "🇮🇹" },
    { name: "USA", expertise: pet.americanExpertise, color: "bg-red-500", flag: "🇺🇸" },
    { name: "Spain", expertise: pet.spanishExpertise, color: "bg-yellow-500", flag: "🇪🇸" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
          Regional Expertise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {regions.map(region => (
          <div key={region.name}>
            <StatBar 
              label={`${region.flag} ${region.name}`}
              value={region.expertise}
              max={100}
              color={region.color}
              showNumbers={false}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const BattleStats = ({ pet }: { pet: any }) => {
  const winRate = Math.round((pet.battleWins / (pet.battleWins + pet.battleLosses)) * 100)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
          Battle Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{pet.battleWins}</div>
            <div className="text-sm text-gray-600">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{pet.battleLosses}</div>
            <div className="text-sm text-gray-600">Losses</div>
          </div>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-purple-600">{winRate}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
        
        <div className="mb-4">
          <div className="text-center mb-2">
            <div className="text-xl font-bold text-blue-600">{pet.battleRating}</div>
            <div className="text-sm text-gray-600">Battle Rating</div>
          </div>
        </div>
        
        <Link href="/battle">
          <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
            <Gamepad2 className="h-4 w-4 mr-2" />
            Battle Arena
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

const EvolutionProgress = ({ pet }: { pet: any }) => {
  const { nextEvolution } = pet
  const levelProgress = (pet.level / nextEvolution.requirements.level) * 100
  const discoveryProgress = (pet.regionsDiscovered.length / nextEvolution.requirements.regions) * 100
  const overallProgress = (levelProgress + discoveryProgress) / 2
  
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Star className="h-5 w-5 text-purple-600 mr-2" />
          Evolution Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-1">Next Evolution</div>
          <div className="text-xl font-bold text-purple-600">{nextEvolution.name}</div>
        </div>
        
        <div className="space-y-3">
          <StatBar 
            label="Level Progress"
            value={pet.level}
            max={nextEvolution.requirements.level}
            color="bg-purple-500"
          />
          
          <StatBar 
            label="Regions Discovered"
            value={pet.regionsDiscovered.length}
            max={nextEvolution.requirements.regions}
            color="bg-pink-500"
          />
          
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</div>
            <div className="text-sm text-gray-600">Ready to Evolve</div>
          </div>
        </div>
        
        {overallProgress >= 100 ? (
          <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Star className="h-4 w-4 mr-2" />
            Evolve Now!
          </Button>
        ) : (
          <Button variant="outline" className="w-full mt-4" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Evolution Locked
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function PetPage() {
  const [pet] = useState(mockPet)
  const [showCareReminder, setShowCareReminder] = useState(true)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Wine Pet Care Center
        </h1>
        <p className="text-xl text-gray-600">
          Your companion grows stronger with every wine you discover!
        </p>
      </div>

      {/* Care Reminder */}
      {showCareReminder && pet.isHungry && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {pet.name} is hungry! Feed them to keep them happy and growing.
              </span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowCareReminder(false)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Pet Display */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Pet Sprite */}
                <div className="text-center">
                  <PetSprite pet={pet} className="w-40 h-40 mb-4" />
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
                    <Badge className="bg-purple-100 text-purple-800">{pet.species}</Badge>
                    <div className="text-sm text-gray-600">Level {pet.level} • Stage {pet.evolutionStage}</div>
                  </div>
                </div>

                {/* Pet Stats */}
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatBar 
                      label="Health" 
                      value={pet.health} 
                      max={100} 
                      color="bg-red-500" 
                    />
                    <StatBar 
                      label="Happiness" 
                      value={pet.happiness} 
                      max={100} 
                      color="bg-yellow-500" 
                    />
                    <StatBar 
                      label="Energy" 
                      value={pet.energy} 
                      max={100} 
                      color="bg-blue-500" 
                    />
                    <StatBar 
                      label="Intelligence" 
                      value={pet.intelligence} 
                      max={100} 
                      color="bg-purple-500" 
                    />
                  </div>
                  
                  {/* Experience Bar */}
                  <StatBar 
                    label="Experience" 
                    value={pet.experience} 
                    max={pet.experienceToNext} 
                    color="bg-green-500" 
                  />
                </div>
              </div>
              
              {/* Care Actions */}
              <div className="mt-8">
                <PetCareActions pet={pet} />
              </div>
            </CardContent>
          </Card>

          {/* Wine Knowledge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                Wine Knowledge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{pet.wineKnowledgeScore}</div>
                  <div className="text-sm text-gray-600">Knowledge Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{pet.regionsDiscovered.length}</div>
                  <div className="text-sm text-gray-600">Regions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{pet.countriesExplored.length}</div>
                  <div className="text-sm text-gray-600">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{pet.wineStylesMastered.length}</div>
                  <div className="text-sm text-gray-600">Wine Styles</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Recent Discoveries:</div>
                <div className="flex flex-wrap gap-2">
                  {pet.regionsDiscovered.slice(0, 4).map((region, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Evolution Progress */}
          <EvolutionProgress pet={pet} />
          
          {/* Regional Expertise */}
          <RegionalExpertise pet={pet} />
          
          {/* Battle Stats */}
          <BattleStats pet={pet} />
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 text-gray-600 mr-2" />
                Care Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Fed:</span>
                <span className="text-sm font-medium">{pet.lastFed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Interaction:</span>
                <span className="text-sm font-medium">{pet.lastInteraction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Feeding Streak:</span>
                <span className="text-sm font-medium text-green-600">{pet.feedingStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mood:</span>
                <Badge className="bg-green-100 text-green-800 capitalize">{pet.mood}</Badge>
              </div>
              
              {pet.statusEffects.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600 mb-2">Active Effects:</div>
                  {pet.statusEffects.map((effect, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 mr-2 mb-1 text-xs">
                      {effect}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Achievement Milestones */}
      <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
          Pet Achievements
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold">Perfect Tastings</div>
              <div className="text-2xl font-bold text-yellow-600">{pet.perfectTastings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">💎</div>
              <div className="font-semibold">Rare Discoveries</div>
              <div className="text-2xl font-bold text-purple-600">{pet.rareDiscoveries}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-semibold">Milestones</div>
              <div className="text-2xl font-bold text-blue-600">{pet.milestonesReached}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}