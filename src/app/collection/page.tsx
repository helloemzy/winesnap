'use client'

import { useState, useEffect } from 'react'
import { Wine, Search, Filter, Star, Trophy, Camera, Sparkles, Share2, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Mock wine collection data
const mockWineCollection = [
  {
    id: 1,
    name: "Château Margaux 2015",
    region: "Bordeaux, France",
    year: "2015",
    type: "Red Wine",
    rarity: "legendary",
    discovered: true,
    discoveryDate: "2024-01-15",
    rating: 95,
    photo: "📷",
    producer: "Château Margaux",
    tastingNotes: {
      appearance: ["Deep", "Ruby"],
      nose: ["Fruity", "Oaky", "Complex"],
      palate: ["Full", "Smooth", "Balanced"],
      finish: ["Long", "Complex"],
      quality: ["Outstanding"]
    },
    voiceNote: "Incredible wine with amazing complexity and elegance...",
    tradeable: true,
    private: false
  },
  {
    id: 2,
    name: "Penfolds Grange 2018",
    region: "Barossa Valley, Australia", 
    year: "2018",
    type: "Red Wine",
    rarity: "epic",
    discovered: true,
    discoveryDate: "2024-02-03",
    rating: 92,
    photo: "📷",
    producer: "Penfolds",
    tastingNotes: {
      appearance: ["Deep", "Purple"],
      nose: ["Fruity", "Spicy"],
      palate: ["Full", "Tannic"],
      finish: ["Long", "Warm"],
      quality: ["Very Good"]
    },
    voiceNote: "Bold Australian Shiraz with great structure...",
    tradeable: true,
    private: false
  },
  {
    id: 3,
    name: "Dom Pérignon 2012",
    region: "Champagne, France",
    year: "2012", 
    type: "Sparkling",
    rarity: "rare",
    discovered: true,
    discoveryDate: "2024-03-10",
    rating: 96,
    photo: "📷",
    producer: "Dom Pérignon",
    tastingNotes: {
      appearance: ["Pale", "Clear"],
      nose: ["Floral", "Fruity"],
      palate: ["Dry", "Light", "Smooth"],
      finish: ["Medium", "Clean"],
      quality: ["Outstanding"]
    },
    voiceNote: "Exceptional Champagne with beautiful finesse...",
    tradeable: false,
    private: true
  }
]

const RARITY_COLORS = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500', 
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
}

const RARITY_GRADIENTS = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600', 
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
}

// Trading Card Component
const WineCard = ({ wine }: { wine: any }) => {
  const [flipped, setFlipped] = useState(false)
  
  return (
    <div className="relative h-80 w-56 mx-auto perspective-1000" onClick={() => setFlipped(!flipped)}>
      <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${flipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className={`h-full bg-gradient-to-br ${RARITY_GRADIENTS[wine.rarity as keyof typeof RARITY_GRADIENTS]} shadow-xl hover:shadow-2xl transition-shadow border-4 border-white relative overflow-hidden`}>
            <CardContent className="p-0 h-full relative">
              {/* Rarity Badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge className={`${RARITY_COLORS[wine.rarity as keyof typeof RARITY_COLORS]} text-white font-bold text-xs`}>
                  {wine.rarity.toUpperCase()}
                </Badge>
              </div>

              {/* Privacy indicator */}
              {wine.private && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-gray-800 text-white">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                </div>
              )}

              {/* Wine photo placeholder */}
              <div className="h-32 bg-white/20 backdrop-blur-sm m-4 rounded-lg flex items-center justify-center text-4xl">
                {wine.photo}
              </div>

              {/* Wine info */}
              <div className="p-4 text-white">
                <h3 className="font-bold text-lg mb-1 text-shadow">{wine.name}</h3>
                <p className="text-sm opacity-90 mb-2">{wine.region} • {wine.year}</p>
                <p className="text-xs opacity-80 mb-3">{wine.producer}</p>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  <Star className="h-4 w-4 text-yellow-300 fill-current" />
                  <span className="ml-1 font-semibold">{wine.rating}</span>
                </div>

                {/* Quick tasting notes */}
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {wine.tastingNotes.palate?.slice(0, 2).map((note: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-white/20">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card number */}
              <div className="absolute bottom-2 right-2 text-white/70 text-xs font-mono">
                #{wine.id.toString().padStart(3, '0')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <Card className="h-full bg-white shadow-xl border-4 border-gray-200">
            <CardContent className="p-4 h-full overflow-y-auto">
              <h3 className="font-bold text-lg mb-2">{wine.name}</h3>
              
              {/* Detailed tasting notes */}
              <div className="space-y-3 text-sm">
                {Object.entries(wine.tastingNotes).map(([category, notes]) => (
                  <div key={category}>
                    <h4 className="font-semibold capitalize text-purple-600">{category}:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(notes as string[]).map((note: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Voice note */}
              {wine.voiceNote && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Voice Note:</h4>
                  <p className="text-xs italic text-gray-700">"{wine.voiceNote}"</p>
                </div>
              )}

              {/* Discovery date */}
              <div className="mt-4 text-xs text-gray-500">
                Discovered: {new Date(wine.discoveryDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CollectionPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'private' | 'public'>('private')

  const filteredWines = mockWineCollection.filter(wine => {
    const matchesSearch = wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wine.region.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || wine.rarity === selectedFilter
    const matchesViewMode = viewMode === 'private' || !wine.private
    
    return matchesSearch && matchesFilter && matchesViewMode
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">🃏 Wine Collection</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'private' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('private')}
              >
                <Lock className="h-4 w-4 mr-1" />
                My Cards
              </Button>
              <Button
                variant={viewMode === 'public' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setViewMode('public')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Public
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockWineCollection.length}
              </div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockWineCollection.filter(w => w.rarity === 'legendary' || w.rarity === 'epic').length}
              </div>
              <div className="text-sm text-gray-600">Rare Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockWineCollection.filter(w => w.tradeable).length}
              </div>
              <div className="text-sm text-gray-600">Tradeable</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search wines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'legendary', 'epic', 'rare', 'uncommon', 'common'].map((rarity) => (
                <Button
                  key={rarity}
                  variant={selectedFilter === rarity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(rarity)}
                  className="whitespace-nowrap"
                >
                  {rarity === 'all' ? 'All Cards' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="p-4">
        {filteredWines.length === 0 ? (
          <div className="text-center py-12">
            <Wine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No wines found</h3>
            <p className="text-gray-500 mb-4">Start capturing wines to build your collection!</p>
            <Link href="/capture">
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Capture First Wine
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWines.map((wine) => (
              <WineCard key={wine.id} wine={wine} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/capture">
          <Button 
            size="lg"
            className="rounded-full shadow-2xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-14 w-14"
          >
            <Camera className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  )
}