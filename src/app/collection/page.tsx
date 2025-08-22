'use client'

import { useState, useEffect } from 'react'
import { Wine, Search, Filter, Star, Trophy, Camera, Sparkles, Map, Globe, Clock, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Mock wine data - in real app this would come from database
const mockWineCollection = [
  {
    id: 1,
    name: "Château Margaux 2015",
    region: "Bordeaux, France",
    type: "Red Wine",
    rarity: "legendary",
    discovered: true,
    discoveryDate: "2024-01-15",
    rating: 4.8,
    image: "/api/placeholder/200/300",
    description: "Iconic Bordeaux first growth with exceptional elegance",
    alcContent: 13.5,
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"],
    tastingNotes: "Blackberry, cassis, cedar, graphite",
    region_expertise: 95,
    firstDiscovery: false
  },
  {
    id: 2,
    name: "Penfolds Grange 2018",
    region: "Barossa Valley, Australia",
    type: "Red Wine",
    rarity: "epic",
    discovered: true,
    discoveryDate: "2024-02-03",
    rating: 4.7,
    image: "/api/placeholder/200/300",
    description: "Australia's most famous Shiraz",
    alcContent: 14.5,
    grapeVarieties: ["Shiraz"],
    tastingNotes: "Dark chocolate, blackberry, spice",
    region_expertise: 78,
    firstDiscovery: true
  },
  {
    id: 3,
    name: "Dom Pérignon 2012",
    region: "Champagne, France",
    type: "Sparkling",
    rarity: "rare",
    discovered: true,
    discoveryDate: "2024-01-28",
    rating: 4.9,
    image: "/api/placeholder/200/300",
    description: "Prestigious Champagne house vintage",
    alcContent: 12.5,
    grapeVarieties: ["Chardonnay", "Pinot Noir"],
    tastingNotes: "Brioche, citrus, mineral",
    region_expertise: 88,
    firstDiscovery: false
  },
  {
    id: 4,
    name: "Screaming Eagle 2019",
    region: "Napa Valley, USA",
    type: "Red Wine",
    rarity: "mythic",
    discovered: false,
    discoveryDate: null,
    rating: null,
    image: "/api/placeholder/200/300",
    description: "Cult Napa Cabernet with legendary status",
    alcContent: 15.2,
    grapeVarieties: ["Cabernet Sauvignon"],
    tastingNotes: "???",
    region_expertise: 0,
    firstDiscovery: false
  },
  {
    id: 5,
    name: "Sauternes Château d'Yquem 2016",
    region: "Bordeaux, France",
    type: "Dessert Wine",
    rarity: "legendary",
    discovered: false,
    discoveryDate: null,
    rating: null,
    image: "/api/placeholder/200/300",
    description: "World's most prestigious dessert wine",
    alcContent: 14.0,
    grapeVarieties: ["Sémillon", "Sauvignon Blanc"],
    tastingNotes: "???",
    region_expertise: 0,
    firstDiscovery: false
  }
]

// Rarity color mapping
const rarityColors = {
  common: "from-gray-400 to-gray-600",
  uncommon: "from-green-400 to-green-600", 
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500",
  mythic: "from-pink-400 to-red-500"
}

// Rarity badges
const rarityBadges = {
  common: { label: "Common", color: "bg-gray-500" },
  uncommon: { label: "Uncommon", color: "bg-green-500" },
  rare: { label: "Rare", color: "bg-blue-500" },
  epic: { label: "Epic", color: "bg-purple-500" },
  legendary: { label: "Legendary", color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
  mythic: { label: "Mythic", color: "bg-gradient-to-r from-pink-500 to-red-500" }
}

const WineCollectionCard = ({ wine }: { wine: any }) => {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl group ${wine.discovered ? 'bg-white' : 'bg-gray-100 opacity-70'}`}>
      {/* Rarity glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${rarityColors[wine.rarity as keyof typeof rarityColors]} opacity-20 rounded-lg`}></div>
      
      {/* First discovery badge */}
      {wine.firstDiscovery && wine.discovered && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xs">
            🏆 First Discovery!
          </Badge>
        </div>
      )}

      {/* Rarity badge */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className={`${rarityBadges[wine.rarity as keyof typeof rarityBadges].color} text-white font-bold text-xs`}>
          {rarityBadges[wine.rarity as keyof typeof rarityBadges].label}
        </Badge>
      </div>

      <CardContent className="p-4 relative">
        {/* Wine image placeholder with mystery effect */}
        <div className="relative mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg aspect-[3/4] flex items-center justify-center">
          {wine.discovered ? (
            <div className="text-center">
              <Wine className={`h-12 w-12 mx-auto mb-2 text-purple-600`} />
              <div className="text-xs text-purple-600 font-medium">Wine Image</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="relative">
                <Wine className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">❓</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium">Undiscovered</div>
            </div>
          )}
        </div>

        {/* Wine details */}
        <div className="space-y-2">
          <h3 className={`font-bold text-sm ${wine.discovered ? 'text-gray-900' : 'text-gray-500'}`}>
            {wine.discovered ? wine.name : '???'}
          </h3>
          
          <div className="flex items-center gap-2 text-xs">
            <Map className="h-3 w-3 text-gray-500" />
            <span className={wine.discovered ? 'text-gray-600' : 'text-gray-400'}>
              {wine.discovered ? wine.region : '???'}
            </span>
          </div>

          {wine.discovered && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-gray-600">{wine.rating}/5.0</span>
                <Clock className="h-3 w-3 text-gray-500 ml-2" />
                <span className="text-gray-500">{wine.discoveryDate}</span>
              </div>
              
              <div className="text-xs text-gray-600 line-clamp-2">
                {wine.description}
              </div>

              <div className="flex gap-1 flex-wrap">
                {wine.grapeVarieties.map((grape: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {grape}
                  </Badge>
                ))}
              </div>
            </>
          )}

          {!wine.discovered && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Hints:</div>
              <div className="text-xs text-gray-600">{wine.description}</div>
              <div className="text-xs text-purple-600 font-medium">
                📍 Search in {wine.region.split(',')[1]?.trim() || 'Unknown Region'}
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-4">
          {wine.discovered ? (
            <Button size="sm" variant="outline" className="w-full text-xs">
              <Heart className="h-3 w-3 mr-1" />
              View Details
            </Button>
          ) : (
            <Button size="sm" className="w-full text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Camera className="h-3 w-3 mr-1" />
              Discover Wine
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const CollectionStats = ({ wines }: { wines: any[] }) => {
  const discovered = wines.filter(w => w.discovered)
  const total = wines.length
  const completion = Math.round((discovered.length / total) * 100)
  
  const rarityStats = wines.reduce((acc, wine) => {
    if (wine.discovered) {
      acc[wine.rarity] = (acc[wine.rarity] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{discovered.length}/{total}</div>
          <div className="text-sm text-gray-600">Wines Collected</div>
          <div className="text-xs text-purple-500">{completion}% Complete</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{rarityStats.legendary || 0}</div>
          <div className="text-sm text-gray-600">Legendary</div>
          <div className="text-xs text-yellow-500">Ultra Rare</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{discovered.filter(w => w.firstDiscovery).length}</div>
          <div className="text-sm text-gray-600">First Discoveries</div>
          <div className="text-xs text-green-500">World First</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{new Set(discovered.map(w => w.region.split(',')[1]?.trim())).size}</div>
          <div className="text-sm text-gray-600">Countries</div>
          <div className="text-xs text-blue-500">Explored</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CollectionPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRarity, setFilterRarity] = useState('all')
  const [filterDiscovered, setFilterDiscovered] = useState('all')

  const filteredWines = mockWineCollection.filter(wine => {
    const matchesSearch = wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wine.region.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRarity = filterRarity === 'all' || wine.rarity === filterRarity
    const matchesDiscovered = filterDiscovered === 'all' || 
                             (filterDiscovered === 'discovered' && wine.discovered) ||
                             (filterDiscovered === 'undiscovered' && !wine.discovered)
    
    return matchesSearch && matchesRarity && matchesDiscovered
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 animate-pulse"></div>
            <Trophy className="h-12 w-12 text-purple-600 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Wine Pokédex
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gotta taste 'em all! Discover, collect, and master wines from around the world.
        </p>
      </div>

      {/* Collection Stats */}
      <CollectionStats wines={mockWineCollection} />

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search wines, regions, or producers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
          </select>
          
          <select 
            value={filterDiscovered}
            onChange={(e) => setFilterDiscovered(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Wines</option>
            <option value="discovered">Discovered</option>
            <option value="undiscovered">Undiscovered</option>
          </select>
        </div>
      </div>

      {/* Quick Discovery Button */}
      <div className="text-center mb-8">
        <Link href="/capture">
          <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold">
            <Camera className="h-5 w-5 mr-2" />
            Discover New Wine
          </Button>
        </Link>
      </div>

      {/* Wine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWines.map(wine => (
          <WineCollectionCard key={wine.id} wine={wine} />
        ))}
      </div>

      {filteredWines.length === 0 && (
        <div className="text-center py-16">
          <div className="mb-4">
            <Wine className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No wines found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <Button onClick={() => {
            setSearchTerm('')
            setFilterRarity('all')
            setFilterDiscovered('all')
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Achievement Progress */}
      <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
          Collection Achievements
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Wine Explorer</span>
                <Badge className="bg-green-500">Complete!</Badge>
              </div>
              <div className="text-sm text-gray-600">Discover your first 10 wines</div>
              <div className="mt-2 bg-green-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Regional Master</span>
                <Badge variant="outline">3/5</Badge>
              </div>
              <div className="text-sm text-gray-600">Discover wines from 5 countries</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-3/5"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Legendary Hunter</span>
                <Badge variant="outline">1/3</Badge>
              </div>
              <div className="text-sm text-gray-600">Discover 3 Legendary wines</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}