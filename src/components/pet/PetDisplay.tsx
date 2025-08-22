'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPetWithDetails, PetMood } from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Smile, 
  Zap, 
  Star, 
  MapPin, 
  Award, 
  Utensils,
  PlayCircle,
  Moon,
  TrendingUp,
  Wine
} from 'lucide-react';

interface PetDisplayProps {
  pet?: UserPetWithDetails;
  compact?: boolean;
  showActions?: boolean;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ 
  pet: propPet, 
  compact = false, 
  showActions = true 
}) => {
  const { currentPet, interactWithPet, feedPetWithWine, checkCareNeeds } = usePetStore();
  const pet = propPet || currentPet;
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastInteractionResult, setLastInteractionResult] = useState<string>('');

  if (!pet) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            <Wine className="w-16 h-16 mx-auto mb-2" />
            <p>No pet companion yet</p>
            <p className="text-sm">Adopt your first wine pet to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const careStatus = checkCareNeeds();
  
  // Handle pet interactions
  const handleInteraction = async (interactionType: string) => {
    if (isInteracting) return;
    
    setIsInteracting(true);
    try {
      const result = await interactWithPet(interactionType);
      setLastInteractionResult(result.message);
      
      // Clear message after 3 seconds
      setTimeout(() => setLastInteractionResult(''), 3000);
      
    } catch (error) {
      console.error('Failed to interact with pet:', error);
      setLastInteractionResult('Something went wrong. Please try again.');
    } finally {
      setIsInteracting(false);
    }
  };

  // Get mood emoji and animation
  const getMoodDisplay = (mood: PetMood) => {
    const moodConfig = {
      'ecstatic': { emoji: '🤩', color: 'text-purple-500', animation: 'animate-bounce' },
      'very_happy': { emoji: '😊', color: 'text-green-500', animation: 'animate-pulse' },
      'happy': { emoji: '🙂', color: 'text-green-400', animation: '' },
      'neutral': { emoji: '😐', color: 'text-yellow-500', animation: '' },
      'sad': { emoji: '😔', color: 'text-orange-500', animation: '' },
      'very_sad': { emoji: '😢', color: 'text-red-500', animation: 'animate-pulse' }
    };
    
    return moodConfig[mood] || moodConfig.neutral;
  };

  const moodDisplay = getMoodDisplay(pet.mood);
  
  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Pet Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className={`text-2xl ${moodDisplay.animation}`}>
                  {moodDisplay.emoji}
                </span>
              </div>
              <div className="absolute -top-1 -right-1">
                <Badge variant="secondary" className="text-xs px-1">
                  Lv.{pet.level}
                </Badge>
              </div>
            </div>
            
            {/* Pet Info */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{pet.name}</h3>
              <p className="text-sm text-gray-600">{pet.species?.name}</p>
              
              {/* Quick Stats */}
              <div className="flex space-x-3 mt-2">
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span className="text-xs">{pet.health}/100</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Smile className="w-3 h-3 text-green-500" />
                  <span className="text-xs">{pet.happiness}/100</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <span className="text-xs">{pet.energy}/100</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Pet Display */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{pet.name}</CardTitle>
              <p className="text-gray-600">{pet.species?.name} • Level {pet.level}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={careStatus.needs_feeding ? 'destructive' : 'secondary'}>
                  {pet.mood.replace('_', ' ').toUpperCase()}
                </Badge>
                {careStatus.needs_feeding && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Hungry
                  </Badge>
                )}
                {careStatus.needs_interaction && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Needs Attention
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Pet Avatar */}
            <motion.div 
              className="relative"
              animate={{ 
                scale: pet.mood === 'ecstatic' ? [1, 1.1, 1] : 1,
                rotate: pet.is_sleepy ? -10 : 0 
              }}
              transition={{ 
                duration: 2, 
                repeat: pet.mood === 'ecstatic' ? Infinity : 0 
              }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
                <span className={`text-4xl ${moodDisplay.animation}`}>
                  {moodDisplay.emoji}
                </span>
              </div>
              
              {/* Status indicators */}
              {pet.is_hungry && (
                <motion.div 
                  className="absolute -top-2 -right-2 text-2xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🍽️
                </motion.div>
              )}
              
              {pet.is_sleepy && (
                <motion.div 
                  className="absolute -top-2 -left-2 text-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💤
                </motion.div>
              )}
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Message */}
          <AnimatePresence>
            {lastInteractionResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-green-800"
              >
                {lastInteractionResult}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pet Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Health</span>
              </div>
              <Progress value={pet.health} className="h-2" />
              <p className="text-xs text-gray-600">{pet.health}/100</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Smile className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Happiness</span>
              </div>
              <Progress value={pet.happiness} className="h-2" />
              <p className="text-xs text-gray-600">{pet.happiness}/100</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Energy</span>
              </div>
              <Progress value={pet.energy} className="h-2" />
              <p className="text-xs text-gray-600">{pet.energy}/100</p>
            </div>
          </div>
          
          {/* Experience Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Experience</span>
              </div>
              <span className="text-xs text-gray-600">
                {pet.total_experience} XP (Next: {pet.experience_to_next_level})
              </span>
            </div>
            <Progress 
              value={(pet.total_experience % (pet.level * 100)) / (pet.level * 100) * 100} 
              className="h-2" 
            />
          </div>
          
          {/* Wine Knowledge Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-purple-800">Wine Knowledge</p>
              <p className="text-2xl font-bold text-purple-900">{pet.wine_knowledge_score}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Total Expertise</p>
              <p className="text-2xl font-bold text-purple-900">{pet.total_expertise}</p>
            </div>
          </div>
          
          {/* Discovery Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <MapPin className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className="text-lg font-semibold">{pet.regions_discovered.length}</p>
              <p className="text-xs text-gray-600">Regions</p>
            </div>
            <div>
              <Wine className="w-5 h-5 mx-auto text-red-600 mb-1" />
              <p className="text-lg font-semibold">{pet.grape_varieties_tasted.length}</p>
              <p className="text-xs text-gray-600">Grape Varieties</p>
            </div>
            <div>
              <Award className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
              <p className="text-lg font-semibold">{pet.achievements_count}</p>
              <p className="text-xs text-gray-600">Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      {showActions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pet Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={careStatus.needs_feeding ? "default" : "outline"}
                onClick={() => handleInteraction('pet')}
                disabled={isInteracting}
                className="flex items-center space-x-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Pet</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleInteraction('play')}
                disabled={isInteracting || pet.energy < 20}
                className="flex items-center space-x-2"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Play</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleInteraction('rest')}
                disabled={isInteracting}
                className="flex items-center space-x-2"
              >
                <Moon className="w-4 h-4" />
                <span>Rest</span>
              </Button>
              
              <Button
                variant={careStatus.recommended_actions.length > 0 ? "default" : "outline"}
                onClick={() => window.location.href = '/wine-journal'}
                className="flex items-center space-x-2"
              >
                <Wine className="w-4 h-4" />
                <span>Wine Tasting</span>
              </Button>
            </div>
            
            {/* Care Recommendations */}
            {careStatus.recommended_actions.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">Care Recommendations:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {careStatus.recommended_actions.map((action, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PetDisplay;