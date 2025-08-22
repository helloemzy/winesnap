'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore } from '@/stores/pet-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PetDisplay from './PetDisplay';
import PetAdoptionFlow from './PetAdoptionFlow';
import PetCareCenter from './PetCareCenter';
import PetEvolutionSystem from './PetEvolutionSystem';
import PetBattleArena from './PetBattleArena';
import PetLeaderboards from './PetLeaderboards';
import PetStreakRewards from './PetStreakRewards';
import { 
  Heart,
  Trophy,
  Flame,
  Crown,
  Swords,
  Calendar,
  Settings,
  Plus,
  Sparkles,
  Wine,
  Star,
  TrendingUp
} from 'lucide-react';

const PetDashboard: React.FC = () => {
  const { 
    currentPet, 
    loadPetData, 
    checkCareNeeds, 
    isLoading,
    updatePetStats 
  } = usePetStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdoptionFlow, setShowAdoptionFlow] = useState(false);

  useEffect(() => {
    // Load pet data when component mounts
    const userId = 'current-user-id'; // This would come from auth context
    loadPetData(userId);

    // Set up periodic stat updates
    const interval = setInterval(() => {
      if (currentPet) {
        updatePetStats();
      }
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [loadPetData, updatePetStats, currentPet]);

  useEffect(() => {
    // Auto-switch to overview if pet is adopted
    if (currentPet && showAdoptionFlow) {
      setShowAdoptionFlow(false);
      setActiveTab('overview');
    }
  }, [currentPet, showAdoptionFlow]);

  const careStatus = currentPet ? checkCareNeeds() : null;

  // Show adoption flow if no pet
  if (!currentPet && !isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Wine className="w-20 h-20 mx-auto mb-4 text-purple-600" />
          <h1 className="text-4xl font-bold mb-2">Welcome to Wine Companions!</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Adopt your very own wine pet that will grow and evolve alongside your wine discovery journey.
            Your companion will learn from every tasting and become your personal sommelier guide.
          </p>
        </motion.div>

        {showAdoptionFlow ? (
          <PetAdoptionFlow
            onComplete={() => setShowAdoptionFlow(false)}
            onCancel={() => setShowAdoptionFlow(false)}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Grows with You</h3>
                  <p className="text-sm text-gray-600">
                    Your pet gains experience from every wine tasting and develops expertise in different regions
                  </p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Evolves & Changes</h3>
                  <p className="text-sm text-gray-600">
                    Unlock new forms and abilities as you explore wine regions and maintain daily streaks
                  </p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Social Features</h3>
                  <p className="text-sm text-gray-600">
                    Battle other pets, climb leaderboards, and show off your wine knowledge
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => setShowAdoptionFlow(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adopt Your First Pet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading your wine companion...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Pet Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Wine Companion Dashboard</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {currentPet && (
              <>
                <span className="flex items-center space-x-1">
                  <Wine className="w-4 h-4" />
                  <span>{currentPet.name}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Level {currentPet.level}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Flame className="w-4 h-4" />
                  <span>{currentPet.daily_streak} day streak</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          {careStatus?.needs_feeding && (
            <Badge variant="destructive" className="animate-pulse">
              Pet is Hungry!
            </Badge>
          )}
          {careStatus?.needs_interaction && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Needs Attention
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/wine-tasting'}
          >
            <Wine className="w-4 h-4 mr-2" />
            New Tasting
          </Button>
        </div>
      </motion.div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="care" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Care</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Evolution</span>
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center space-x-2">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Streaks</span>
          </TabsTrigger>
          <TabsTrigger value="battles" className="flex items-center space-x-2">
            <Swords className="w-4 h-4" />
            <span className="hidden sm:inline">Battle</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Rankings</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="space-y-6 mt-6">
              <PetDisplay pet={currentPet} showActions={true} />
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wine className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold">{currentPet?.wine_knowledge_score || 0}</p>
                    <p className="text-sm text-gray-600">Wine Knowledge</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-bold">{currentPet?.prestige_points || 0}</p>
                    <p className="text-sm text-gray-600">Prestige Points</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">
                      {(currentPet?.battle_wins || 0)}/{(currentPet?.battle_losses || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Battle Record</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">{currentPet?.longest_streak || 0}</p>
                    <p className="text-sm text-gray-600">Best Streak</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {currentPet?.recent_activities && currentPet.recent_activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentPet.recent_activities.slice(0, 5).map((activity, index) => (
                        <div key={activity.id || index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              {activity.activity_type === 'wine_tasting' && <Wine className="w-4 h-4 text-purple-600" />}
                              {activity.activity_type === 'interaction' && <Heart className="w-4 h-4 text-red-600" />}
                              {activity.activity_type === 'evolution' && <Sparkles className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium capitalize">
                                {activity.activity_type.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              +{activity.experience_gained} XP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="care" className="mt-6">
              <PetCareCenter pet={currentPet} />
            </TabsContent>

            <TabsContent value="evolution" className="mt-6">
              <PetEvolutionSystem 
                pet={currentPet} 
                onEvolutionComplete={() => {
                  // Refresh pet data after evolution
                  loadPetData('current-user-id');
                }} 
              />
            </TabsContent>

            <TabsContent value="streaks" className="mt-6">
              <PetStreakRewards pet={currentPet} />
            </TabsContent>

            <TabsContent value="battles" className="mt-6">
              <PetBattleArena 
                pet={currentPet}
                onBattleComplete={(result) => {
                  // Refresh pet data after battle
                  loadPetData('current-user-id');
                }}
              />
            </TabsContent>

            <TabsContent value="leaderboards" className="mt-6">
              <PetLeaderboards showUserPet={true} />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default PetDashboard;