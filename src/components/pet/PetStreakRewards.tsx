'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPetWithDetails } from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Calendar, 
  Trophy,
  Gift,
  Star,
  Zap,
  Heart,
  Crown,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';

interface StreakReward {
  day: number;
  type: 'experience' | 'stat_boost' | 'evolution_bonus' | 'special_item' | 'prestige';
  reward: {
    name: string;
    description: string;
    value: number;
    icon: React.ReactNode;
  };
  claimed: boolean;
}

interface PetStreakRewardsProps {
  pet?: UserPetWithDetails;
}

const PetStreakRewards: React.FC<PetStreakRewardsProps> = ({ pet: propPet }) => {
  const { currentPet, interactWithPet } = usePetStore();
  const pet = propPet || currentPet;
  
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [showRewardCelebration, setShowRewardCelebration] = useState<StreakReward | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Define streak rewards
  const streakRewards: StreakReward[] = [
    {
      day: 3,
      type: 'stat_boost',
      reward: {
        name: 'Happiness Boost',
        description: '+15 Happiness for your dedicated pet care',
        value: 15,
        icon: <Heart className="w-6 h-6 text-red-500" />
      },
      claimed: false
    },
    {
      day: 7,
      type: 'experience',
      reward: {
        name: 'Weekly Explorer',
        description: '+100 Experience points for consistent discovery',
        value: 100,
        icon: <Star className="w-6 h-6 text-yellow-500" />
      },
      claimed: false
    },
    {
      day: 14,
      type: 'prestige',
      reward: {
        name: 'Dedication Badge',
        description: '+50 Prestige points for two weeks of consistency',
        value: 50,
        icon: <Award className="w-6 h-6 text-purple-500" />
      },
      claimed: false
    },
    {
      day: 21,
      type: 'evolution_bonus',
      reward: {
        name: 'Evolution Catalyst',
        description: 'Reduces evolution requirements by 20%',
        value: 20,
        icon: <Zap className="w-6 h-6 text-blue-500" />
      },
      claimed: false
    },
    {
      day: 30,
      type: 'special_item',
      reward: {
        name: 'Master Taster Crown',
        description: 'Legendary accessory showing your commitment',
        value: 1,
        icon: <Crown className="w-6 h-6 text-gold-500" />
      },
      claimed: false
    },
    {
      day: 50,
      type: 'experience',
      reward: {
        name: 'Vintage Connoisseur',
        description: '+500 Experience and permanent 10% XP boost',
        value: 500,
        icon: <Trophy className="w-6 h-6 text-gold-600" />
      },
      claimed: false
    },
    {
      day: 100,
      type: 'special_item',
      reward: {
        name: 'Legendary Sommelier Status',
        description: 'Ultimate recognition of your wine journey mastery',
        value: 1,
        icon: <Crown className="w-6 h-6 text-rainbow" />
      },
      claimed: false
    }
  ];

  // Calculate time until streak reset (midnight)
  useEffect(() => {
    const updateTimeUntilReset = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      
      const timeDiff = midnight.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!pet) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-2" />
          <p>No pet available for streak tracking</p>
        </CardContent>
      </Card>
    );
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '🔥🔥🔥';
    if (streak >= 50) return '🔥🔥';
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '🌟';
    return '💫';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'text-red-600';
    if (streak >= 50) return 'text-orange-600';
    if (streak >= 30) return 'text-yellow-600';
    if (streak >= 14) return 'text-green-600';
    if (streak >= 7) return 'text-blue-600';
    if (streak >= 3) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getNextMilestone = () => {
    const availableRewards = streakRewards.filter(reward => 
      reward.day > pet.daily_streak && !claimedRewards.includes(reward.day)
    );
    return availableRewards.length > 0 ? availableRewards[0] : null;
  };

  const getAvailableRewards = () => {
    return streakRewards.filter(reward => 
      pet.daily_streak >= reward.day && !claimedRewards.includes(reward.day)
    );
  };

  const claimReward = async (reward: StreakReward) => {
    try {
      // Apply reward based on type
      switch (reward.type) {
        case 'stat_boost':
          await interactWithPet('streak_reward');
          break;
        case 'experience':
          // Experience would be added via API
          break;
        case 'prestige':
          // Prestige points would be added via API
          break;
        case 'evolution_bonus':
          // Evolution catalyst would be stored as special item
          break;
        case 'special_item':
          // Special items would be added to inventory
          break;
      }

      setClaimedRewards(prev => [...prev, reward.day]);
      setShowRewardCelebration(reward);
      
      // Hide celebration after 3 seconds
      setTimeout(() => setShowRewardCelebration(null), 3000);
      
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  const nextMilestone = getNextMilestone();
  const availableRewards = getAvailableRewards();
  const progressToNext = nextMilestone ? 
    ((pet.daily_streak - (nextMilestone.day - 1)) / 1) * 100 : 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Reward Celebration Modal */}
      <AnimatePresence>
        {showRewardCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                {showRewardCelebration.reward.icon}
              </motion.div>
              
              <h3 className="text-xl font-bold mb-2">🎉 Reward Claimed!</h3>
              <h4 className="font-semibold text-purple-800 mb-1">
                {showRewardCelebration.reward.name}
              </h4>
              <p className="text-sm text-gray-600">
                {showRewardCelebration.reward.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Streak Status */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center space-x-2">
            <Flame className={`w-6 h-6 ${getStreakColor(pet.daily_streak)}`} />
            <span>Wine Discovery Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="text-center">
            <motion.div
              animate={{ scale: pet.daily_streak > 0 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-2"
            >
              {getStreakEmoji(pet.daily_streak)}
            </motion.div>
            
            <div className="text-4xl font-bold mb-2">
              <span className={getStreakColor(pet.daily_streak)}>
                {pet.daily_streak}
              </span>
              <span className="text-gray-500 text-2xl ml-2">days</span>
            </div>
            
            <p className="text-gray-600">
              Personal best: <strong>{pet.longest_streak} days</strong>
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-2">
              <Clock className="w-4 h-4" />
              <span>Streak resets in {timeUntilReset}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="font-semibold">{pet.daily_streak}</p>
              <p className="text-sm text-gray-500">Current Streak</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-gold-600" />
              <p className="font-semibold">{pet.longest_streak}</p>
              <p className="text-sm text-gray-500">Personal Best</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Gift className="w-6 h-6 mx-auto mb-1 text-purple-600" />
              <p className="font-semibold">{availableRewards.length}</p>
              <p className="text-sm text-gray-500">Available Rewards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      {availableRewards.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Gift className="w-6 h-6" />
              <span>Rewards Ready to Claim!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRewards.map((reward) => (
                <motion.div
                  key={reward.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-lg border-2 border-green-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {reward.reward.icon}
                      <div>
                        <h4 className="font-semibold">{reward.reward.name}</h4>
                        <p className="text-sm text-gray-600">
                          {reward.day} day milestone
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Ready!
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {reward.reward.description}
                  </p>
                  
                  <Button
                    onClick={() => claimReward(reward)}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Claim Reward
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Milestone Progress */}
      {nextMilestone && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span>Next Milestone</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {nextMilestone.reward.icon}
                <div>
                  <h4 className="font-semibold">{nextMilestone.reward.name}</h4>
                  <p className="text-sm text-gray-600">
                    Reach {nextMilestone.day} day streak
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {nextMilestone.day - pet.daily_streak} days to go
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{pet.daily_streak} days</span>
                <span>{nextMilestone.day} days</span>
              </div>
              <Progress 
                value={(pet.daily_streak / nextMilestone.day) * 100} 
                className="h-3" 
              />
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              {nextMilestone.reward.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* All Milestones Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Milestone Rewards</CardTitle>
          <p className="text-gray-600">
            Earn amazing rewards for consistent wine discovery
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {streakRewards.map((reward) => {
              const isCompleted = pet.daily_streak >= reward.day;
              const isClaimed = claimedRewards.includes(reward.day);
              const isAvailable = isCompleted && !isClaimed;

              return (
                <div
                  key={reward.day}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isAvailable
                      ? 'border-green-200 bg-green-50'
                      : isClaimed
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {reward.reward.icon}
                      {isClaimed && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className={`font-semibold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {reward.reward.name}
                      </h4>
                      <p className={`text-sm ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {reward.day} day streak • {reward.reward.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isClaimed ? (
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Claimed
                      </Badge>
                    ) : isAvailable ? (
                      <Button
                        size="sm"
                        onClick={() => claimReward(reward)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Claim
                      </Button>
                    ) : isCompleted ? (
                      <Badge variant="outline">Ready</Badge>
                    ) : (
                      <Badge variant="ghost">
                        {reward.day - pet.daily_streak} days
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Streak Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Maintain Your Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Daily Activities</span>
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete at least one wine tasting daily</li>
                <li>• Voice record tasting notes for bonus points</li>
                <li>• Try wines from different regions</li>
                <li>• Rate wines for quality assessment</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span>Streak Bonuses</span>
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Higher streaks unlock better rewards</li>
                <li>• Streak multipliers boost pet experience</li>
                <li>• Special evolution bonuses at milestones</li>
                <li>• Prestige points for social recognition</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetStreakRewards;