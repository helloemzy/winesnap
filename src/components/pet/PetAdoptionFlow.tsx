'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetSpecies, PetEvolutionStage } from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Sparkles, 
  Star, 
  Heart, 
  Smile, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Wine,
  Award,
  Crown
} from 'lucide-react';

interface PetAdoptionFlowProps {
  onComplete?: (petId: string) => void;
  onCancel?: () => void;
}

const PetAdoptionFlow: React.FC<PetAdoptionFlowProps> = ({ 
  onComplete,
  onCancel 
}) => {
  const { createPet, isLoading } = usePetStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const [petName, setPetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Mock data - in real app this would come from the store/API
  const mockSpecies: (PetSpecies & { first_stage?: PetEvolutionStage })[] = [
    {
      id: 'grape-guardian',
      name: 'Grape Guardian',
      description: 'A loyal companion that grows stronger with every wine discovery. Perfect for beginners starting their wine journey.',
      base_stats: { health: 100, happiness: 90, energy: 100 },
      rarity: 'common',
      created_at: new Date().toISOString(),
      first_stage: {
        id: 'grape-sprout',
        species_id: 'grape-guardian',
        stage_number: 1,
        name: 'Grape Sprout',
        description: 'A tiny sprout beginning its wine journey',
        stat_multipliers: { health: 1.0, happiness: 1.0, energy: 1.0 },
        created_at: new Date().toISOString()
      }
    },
    {
      id: 'cellar-sprite',
      name: 'Cellar Sprite',
      description: 'A mystical creature that thrives in wine environments. More sensitive to wine quality and provides happiness bonuses.',
      base_stats: { health: 90, happiness: 100, energy: 80 },
      rarity: 'uncommon',
      created_at: new Date().toISOString(),
      first_stage: {
        id: 'young-sprite',
        species_id: 'cellar-sprite',
        stage_number: 1,
        name: 'Young Sprite',
        description: 'A playful spirit drawn to fine wines',
        stat_multipliers: { health: 1.0, happiness: 1.2, energy: 0.9 },
        created_at: new Date().toISOString()
      }
    },
    {
      id: 'vintage-dragon',
      name: 'Vintage Dragon',
      description: 'A rare and majestic pet that appreciates only the finest wines. Provides exceptional experience from high-quality wines.',
      base_stats: { health: 120, happiness: 80, energy: 100 },
      rarity: 'rare',
      created_at: new Date().toISOString(),
      first_stage: {
        id: 'dragon-hatchling',
        species_id: 'vintage-dragon',
        stage_number: 1,
        name: 'Dragon Hatchling',
        description: 'A young dragon with discerning taste',
        stat_multipliers: { health: 1.3, happiness: 0.9, energy: 1.1 },
        created_at: new Date().toISOString()
      }
    },
    {
      id: 'terroir-phoenix',
      name: 'Terroir Phoenix',
      description: 'A legendary creature that embodies the spirit of great wine regions. Extremely rare and powerful.',
      base_stats: { health: 150, happiness: 100, energy: 120 },
      rarity: 'legendary',
      created_at: new Date().toISOString(),
      first_stage: {
        id: 'phoenix-ember',
        species_id: 'terroir-phoenix',
        stage_number: 1,
        name: 'Phoenix Ember',
        description: 'A radiant spark of terroir essence',
        stat_multipliers: { health: 1.5, happiness: 1.2, energy: 1.3 },
        created_at: new Date().toISOString()
      }
    }
  ];

  const selectedSpecies = mockSpecies.find(s => s.id === selectedSpeciesId);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4 text-gray-500" />;
      case 'uncommon': return <Star className="w-4 h-4 text-green-500" />;
      case 'rare': return <Star className="w-4 h-4 text-blue-500" />;
      case 'legendary': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'legendary': return 'border-purple-300 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const handleCreatePet = async () => {
    if (!selectedSpeciesId || !petName.trim()) return;

    setIsCreating(true);
    try {
      await createPet(selectedSpeciesId, petName.trim());
      onComplete?.(selectedSpeciesId);
    } catch (error) {
      console.error('Failed to create pet:', error);
      // Handle error - show toast or error message
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1: return true; // Introduction
      case 2: return selectedSpeciesId !== ''; // Species selection
      case 3: return petName.trim().length >= 3; // Name input
      default: return false;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
          <span className="text-sm text-gray-500">Adopt Your Wine Pet</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-purple-600 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Introduction */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center">
              <CardHeader>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto mb-4"
                >
                  <Wine className="w-16 h-16 text-purple-600 mx-auto" />
                </motion.div>
                <CardTitle className="text-3xl font-bold mb-2">
                  Welcome to Wine Companions!
                </CardTitle>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Adopt your very own wine pet that will grow and evolve alongside your wine discovery journey. 
                  Your companion will gain experience from every wine you taste and develop expertise in different regions.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Grows with You</h3>
                    <p className="text-sm text-gray-600">Your pet gains experience from every wine tasting</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Evolves & Changes</h3>
                    <p className="text-sm text-gray-600">Unlock new forms as you explore wine regions</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Social Features</h3>
                    <p className="text-sm text-gray-600">Battle other pets and climb leaderboards</p>
                  </div>
                </div>

                <Button onClick={nextStep} size="lg" className="w-full max-w-xs mx-auto">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Species Selection */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Choose Your Wine Companion
                </CardTitle>
                <p className="text-gray-600 text-center">
                  Each species has unique traits and growth patterns. Choose the one that matches your wine journey!
                </p>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedSpeciesId} onValueChange={setSelectedSpeciesId}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockSpecies.map((species) => (
                      <motion.div
                        key={species.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Label
                          htmlFor={species.id}
                          className={`block cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-md ${
                            selectedSpeciesId === species.id 
                              ? 'border-purple-500 bg-purple-50' 
                              : getRarityColor(species.rarity)
                          }`}
                        >
                          <RadioGroupItem value={species.id} id={species.id} className="sr-only" />
                          
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg flex items-center space-x-2">
                                <span>{species.name}</span>
                                {getRarityIcon(species.rarity)}
                              </h3>
                              <Badge variant="outline" className="mt-1">
                                {species.rarity.charAt(0).toUpperCase() + species.rarity.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="text-4xl">
                              {species.rarity === 'legendary' ? '🔥' :
                               species.rarity === 'rare' ? '🐉' :
                               species.rarity === 'uncommon' ? '✨' : '🌱'}
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4 text-sm">
                            {species.description}
                          </p>

                          {/* Base Stats */}
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                              <p className="text-sm font-medium">{species.base_stats.health}</p>
                              <p className="text-xs text-gray-500">Health</p>
                            </div>
                            <div>
                              <Smile className="w-4 h-4 text-green-500 mx-auto mb-1" />
                              <p className="text-sm font-medium">{species.base_stats.happiness}</p>
                              <p className="text-xs text-gray-500">Happiness</p>
                            </div>
                            <div>
                              <Zap className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                              <p className="text-sm font-medium">{species.base_stats.energy}</p>
                              <p className="text-xs text-gray-500">Energy</p>
                            </div>
                          </div>
                        </Label>
                      </motion.div>
                    ))}
                  </div>
                </RadioGroup>

                {/* Selected Species Details */}
                {selectedSpecies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg"
                  >
                    <h4 className="font-semibold mb-2">Your Companion Will Start As:</h4>
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">
                        {selectedSpecies.rarity === 'legendary' ? '🔥' :
                         selectedSpecies.rarity === 'rare' ? '🐲' :
                         selectedSpecies.rarity === 'uncommon' ? '🧚' : '🌱'}
                      </div>
                      <div>
                        <h5 className="font-medium">{selectedSpecies.first_stage?.name}</h5>
                        <p className="text-sm text-gray-600">{selectedSpecies.first_stage?.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Name Your Pet */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Name Your Companion
                </CardTitle>
                <p className="text-gray-600 text-center">
                  Give your {selectedSpecies?.name} a unique name that reflects your wine journey together.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSpecies && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">
                        {selectedSpecies.rarity === 'legendary' ? '🔥' :
                         selectedSpecies.rarity === 'rare' ? '🐲' :
                         selectedSpecies.rarity === 'uncommon' ? '🧚' : '🌱'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedSpecies.first_stage?.name}
                    </h3>
                    <Badge variant="outline">
                      {selectedSpecies.rarity.charAt(0).toUpperCase() + selectedSpecies.rarity.slice(1)} {selectedSpecies.name}
                    </Badge>
                  </div>
                )}

                <div className="max-w-md mx-auto">
                  <Label htmlFor="pet-name" className="text-base font-medium">
                    Pet Name
                  </Label>
                  <Input
                    id="pet-name"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter a name for your companion..."
                    className="mt-2 text-lg text-center"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {petName.length}/20 characters (minimum 3)
                  </p>
                </div>

                {petName.length >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-green-800">
                      Perfect! <strong>{petName}</strong> will be your wine companion on this journey.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="flex space-x-4">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button 
              onClick={nextStep}
              disabled={!canProceedFromStep(currentStep)}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleCreatePet}
              disabled={!canProceedFromStep(currentStep) || isCreating}
              className="px-8"
            >
              {isCreating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isCreating ? 'Creating...' : 'Adopt Pet'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetAdoptionFlow;