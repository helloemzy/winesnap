'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetLeaderboard, UserPetWithDetails } from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star,
  TrendingUp,
  Swords,
  Brain,
  Wine,
  MapPin,
  Zap,
  RefreshCw
} from 'lucide-react';

interface PetLeaderboardsProps {
  showUserPet?: boolean;
}

const PetLeaderboards: React.FC<PetLeaderboardsProps> = ({ 
  showUserPet = true 
}) => {
  const { currentPet, viewLeaderboard } = usePetStore();
  const [activeCategory, setActiveCategory] = useState<'level' | 'prestige' | 'wine_knowledge' | 'battle_wins'>('level');
  const [leaderboardData, setLeaderboardData] = useState<PetLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock leaderboard data for demonstration
  const mockLeaderboards: Record<string, PetLeaderboard> = {
    level: {
      category: 'level',
      entries: [
        {
          rank: 1,
          pet: {
            id: '1',
            user_id: 'user1',
            species_id: 'terroir-phoenix',
            current_evolution_stage: 'phoenix-master',
            name: 'Aurelius',
            level: 47,
            health: 100,
            happiness: 95,
            energy: 88,
            total_experience: 22100,
            wine_knowledge_score: 1850,
            regions_discovered: ['Bordeaux', 'Burgundy', 'Champagne', 'Tuscany', 'Barolo', 'Napa Valley', 'Sonoma', 'Mosel'],
            grape_varieties_tasted: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Merlot', 'Sauvignon Blanc'],
            countries_explored: ['France', 'Italy', 'Spain', 'Germany', 'United States'],
            rare_wines_encountered: 25,
            french_expertise: 98,
            italian_expertise: 87,
            spanish_expertise: 65,
            german_expertise: 72,
            new_world_expertise: 81,
            last_fed_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString(),
            daily_streak: 45,
            longest_streak: 67,
            is_active: true,
            is_hungry: false,
            is_sleepy: false,
            mood: 'ecstatic',
            battle_wins: 23,
            battle_losses: 5,
            prestige_points: 4200,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            experience_to_next_level: 1900,
            total_expertise: 403,
            achievements_count: 15,
            species: {
              id: 'terroir-phoenix',
              name: 'Terroir Phoenix',
              description: 'A legendary wine companion',
              base_stats: { health: 150, happiness: 100, energy: 120 },
              rarity: 'legendary',
              created_at: new Date().toISOString()
            }
          } as UserPetWithDetails,
          score: 47,
          user_display_name: 'VintageViking'
        },
        {
          rank: 2,
          pet: {
            id: '2',
            user_id: 'user2',
            species_id: 'vintage-dragon',
            current_evolution_stage: 'elder-dragon',
            name: 'Bordeaux Belle',
            level: 42,
            health: 95,
            happiness: 88,
            energy: 92,
            total_experience: 17640,
            wine_knowledge_score: 1620,
            regions_discovered: ['Bordeaux', 'Burgundy', 'Rioja', 'Tuscany'],
            grape_varieties_tasted: ['Cabernet Sauvignon', 'Merlot', 'Tempranillo'],
            countries_explored: ['France', 'Spain', 'Italy'],
            rare_wines_encountered: 18,
            french_expertise: 92,
            italian_expertise: 65,
            spanish_expertise: 78,
            german_expertise: 35,
            new_world_expertise: 45,
            last_fed_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString(),
            daily_streak: 28,
            longest_streak: 42,
            is_active: true,
            is_hungry: false,
            is_sleepy: false,
            mood: 'very_happy',
            battle_wins: 19,
            battle_losses: 8,
            prestige_points: 3450,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            experience_to_next_level: 2360,
            total_expertise: 315,
            achievements_count: 12,
            species: {
              id: 'vintage-dragon',
              name: 'Vintage Dragon',
              description: 'A rare wine dragon',
              base_stats: { health: 120, happiness: 80, energy: 100 },
              rarity: 'rare',
              created_at: new Date().toISOString()
            }
          } as UserPetWithDetails,
          score: 42,
          user_display_name: 'ChateauChaser'
        }
        // Add more mock entries as needed
      ],
      user_rank: currentPet?.level ? Math.floor(Math.random() * 100) + 1 : undefined
    }
  };

  useEffect(() => {
    loadLeaderboard(activeCategory);
  }, [activeCategory]);

  const loadLeaderboard = async (category: typeof activeCategory) => {
    setIsLoading(true);
    try {
      // Use mock data for now
      const data = mockLeaderboards[category] || mockLeaderboards.level;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLeaderboardData(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'level': return <TrendingUp className="w-5 h-5" />;
      case 'prestige': return <Crown className="w-5 h-5" />;
      case 'wine_knowledge': return <Brain className="w-5 h-5" />;
      case 'battle_wins': return <Swords className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const getSpeciesEmoji = (speciesName: string) => {
    switch (speciesName) {
      case 'Terroir Phoenix': return '🔥';
      case 'Vintage Dragon': return '🐉';
      case 'Cellar Sprite': return '🧚';
      case 'Grape Guardian': return '🍇';
      default: return '🍷';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'level': return 'Top Levels';
      case 'prestige': return 'Most Prestigious';
      case 'wine_knowledge': return 'Wine Masters';
      case 'battle_wins': return 'Battle Champions';
      default: return 'Leaderboard';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'level': return 'Pets ranked by their current level and experience';
      case 'prestige': return 'Pets with the most prestige points earned';
      case 'wine_knowledge': return 'Pets with the highest wine knowledge scores';
      case 'battle_wins': return 'Most victorious pets in battle arena';
      default: return 'Pet rankings';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span>Pet Leaderboards</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">See how your wine companion ranks against others</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadLeaderboard(activeCategory)}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* User Pet Rank (if available) */}
      {showUserPet && currentPet && leaderboardData?.user_rank && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍷</span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800">{currentPet.name}</h3>
                  <p className="text-sm text-purple-600">Your Pet</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-600">
                    Rank #{leaderboardData.user_rank}
                  </Badge>
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  {activeCategory === 'level' && `Level ${currentPet.level}`}
                  {activeCategory === 'prestige' && `${currentPet.prestige_points} Prestige`}
                  {activeCategory === 'wine_knowledge' && `${currentPet.wine_knowledge_score} Knowledge`}
                  {activeCategory === 'battle_wins' && `${currentPet.battle_wins} Wins`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as typeof activeCategory)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="level" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Level</span>
              </TabsTrigger>
              <TabsTrigger value="prestige" className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Prestige</span>
              </TabsTrigger>
              <TabsTrigger value="wine_knowledge" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Knowledge</span>
              </TabsTrigger>
              <TabsTrigger value="battle_wins" className="flex items-center space-x-2">
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">Battles</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1">{getCategoryTitle(activeCategory)}</h3>
            <p className="text-gray-600">{getCategoryDescription(activeCategory)}</p>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">Loading leaderboard...</p>
              </motion.div>
            ) : leaderboardData ? (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {leaderboardData.entries.map((entry, index) => (
                  <motion.div
                    key={entry.pet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getRankBackground(entry.rank)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Pet Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-2xl">
                            {getSpeciesEmoji(entry.pet.species?.name || 'Unknown')}
                          </span>
                        </div>

                        {/* Pet Info */}
                        <div>
                          <h4 className="font-semibold text-lg">{entry.pet.name}</h4>
                          <p className="text-sm text-gray-600">
                            {entry.user_display_name} • {entry.pet.species?.name}
                          </p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <span>Level {entry.pet.level}</span>
                            <span>•</span>
                            <span>{entry.pet.regions_discovered.length} regions</span>
                            <span>•</span>
                            <span>{entry.pet.achievements_count} achievements</span>
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(activeCategory)}
                          <span className="text-2xl font-bold">
                            {activeCategory === 'level' && entry.pet.level}
                            {activeCategory === 'prestige' && entry.pet.prestige_points.toLocaleString()}
                            {activeCategory === 'wine_knowledge' && entry.pet.wine_knowledge_score.toLocaleString()}
                            {activeCategory === 'battle_wins' && entry.pet.battle_wins}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-1">
                          {activeCategory === 'level' && `${entry.pet.total_experience.toLocaleString()} XP`}
                          {activeCategory === 'prestige' && `${entry.pet.battle_wins}W/${entry.pet.battle_losses}L`}
                          {activeCategory === 'wine_knowledge' && `${entry.pet.total_expertise} expertise`}
                          {activeCategory === 'battle_wins' && `${Math.round((entry.pet.battle_wins / Math.max(1, entry.pet.battle_wins + entry.pet.battle_losses)) * 100)}% win rate`}
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats for Top 3 */}
                    {entry.rank <= 3 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4 text-center text-sm">
                        <div>
                          <MapPin className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                          <p className="font-medium">{entry.pet.regions_discovered.length}</p>
                          <p className="text-gray-500">Regions</p>
                        </div>
                        <div>
                          <Wine className="w-4 h-4 mx-auto text-red-600 mb-1" />
                          <p className="font-medium">{entry.pet.rare_wines_encountered}</p>
                          <p className="text-gray-500">Rare Wines</p>
                        </div>
                        <div>
                          <Zap className="w-4 h-4 mx-auto text-yellow-600 mb-1" />
                          <p className="font-medium">{entry.pet.daily_streak}</p>
                          <p className="text-gray-500">Streak</p>
                        </div>
                        <div>
                          <Star className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                          <p className="font-medium">{entry.pet.achievements_count}</p>
                          <p className="text-gray-500">Achievements</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No leaderboard data available</p>
                <Button 
                  variant="outline" 
                  onClick={() => loadLeaderboard(activeCategory)}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Leaderboard Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600">
            <p>Leaderboards update every hour. Rankings are based on active pets only.</p>
            <p className="mt-1">
              {activeCategory === 'level' && 'Level rankings consider total experience and current level.'}
              {activeCategory === 'prestige' && 'Prestige points are earned through battles and achievements.'}
              {activeCategory === 'wine_knowledge' && 'Knowledge scores reflect wine discovery and expertise.'}
              {activeCategory === 'battle_wins' && 'Battle rankings show wins in the pet battle arena.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetLeaderboards;