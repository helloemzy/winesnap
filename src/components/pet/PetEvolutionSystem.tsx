'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPetWithDetails, EvolutionCheckResult, PetEvolutionStage } from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Star, 
  MapPin, 
  Award, 
  ArrowRight, 
  Wine,
  Crown,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface PetEvolutionSystemProps {
  pet?: UserPetWithDetails;
  onEvolutionComplete?: () => void;
}

const PetEvolutionSystem: React.FC<PetEvolutionSystemProps> = ({
  pet: propPet,
  onEvolutionComplete
}) => {
  const { currentPet, checkEvolution, evolvePet } = usePetStore();
  const pet = propPet || currentPet;
  
  const [evolutionCheck, setEvolutionCheck] = useState<EvolutionCheckResult | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);

  // Mock evolution stages for demonstration
  const mockEvolutionStages: PetEvolutionStage[] = [
    {
      id: 'grape-sprout',
      species_id: 'grape-guardian',
      stage_number: 1,
      name: 'Grape Sprout',
      description: 'A tiny sprout beginning its wine journey',
      stat_multipliers: { health: 1.0, happiness: 1.0, energy: 1.0 },
      evolution_requirements: { level: 1 },
      created_at: new Date().toISOString()
    },
    {
      id: 'vine-walker',
      species_id: 'grape-guardian',
      stage_number: 2,
      name: 'Vine Walker',
      description: 'Growing stronger with each tasting',
      stat_multipliers: { health: 1.2, happiness: 1.1, energy: 1.1 },
      evolution_requirements: { level: 10, regions_discovered: 3 },
      unlocked_abilities: ['Region Detection', 'Quality Sensing'],
      created_at: new Date().toISOString()
    },
    {
      id: 'wine-sage',
      species_id: 'grape-guardian',
      stage_number: 3,
      name: 'Wine Sage',
      description: 'A knowledgeable companion with deep wine wisdom',
      stat_multipliers: { health: 1.5, happiness: 1.3, energy: 1.2 },
      evolution_requirements: { level: 25, regions_discovered: 10, rare_wines: 5 },
      unlocked_abilities: ['Advanced Palate', 'Terroir Mastery', 'Vintage Prediction'],
      created_at: new Date().toISOString()
    },
    {
      id: 'master-sommelier',
      species_id: 'grape-guardian',
      stage_number: 4,
      name: 'Master Sommelier',
      description: 'The ultimate wine companion',
      stat_multipliers: { health: 2.0, happiness: 1.5, energy: 1.5 },
      evolution_requirements: { level: 50, regions_discovered: 20, rare_wines: 20, total_expertise: 300 },
      unlocked_abilities: ['Perfect Pairing', 'Wine Oracle', 'Legendary Taste', 'Master Guidance'],
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    if (pet) {
      const result = checkEvolution();
      setEvolutionCheck(result);
    }
  }, [pet, checkEvolution]);

  if (!pet) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No pet available for evolution
        </CardContent>
      </Card>
    );
  }

  const currentStage = mockEvolutionStages.find(stage => 
    stage.stage_number === (pet.level <= 10 ? 1 : pet.level <= 25 ? 2 : pet.level <= 50 ? 3 : 4)
  );

  const nextStage = mockEvolutionStages.find(stage => 
    stage.stage_number === (currentStage?.stage_number || 1) + 1
  );

  const allStages = mockEvolutionStages.filter(stage => stage.species_id === pet.species_id);

  const handleEvolution = async () => {
    if (!evolutionCheck?.can_evolve || isEvolving) return;

    setIsEvolving(true);
    setShowEvolutionAnimation(true);

    try {
      // Simulate evolution process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const success = await evolvePet();
      if (success) {
        onEvolutionComplete?.();
      }
    } catch (error) {
      console.error('Evolution failed:', error);
    } finally {
      setIsEvolving(false);
      setShowEvolutionAnimation(false);
    }
  };

  const getRequirementStatus = (requirement: string, current: any, required: any) => {
    const isMet = current >= required;
    return {
      isMet,
      current,
      required,
      percentage: Math.min(100, (current / required) * 100)
    };
  };

  const getStageIcon = (stageNumber: number, isCurrentStage: boolean, isUnlocked: boolean) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold";
    
    if (isCurrentStage) {
      return <div className={`${baseClasses} bg-purple-600 text-white`}>{stageNumber}</div>;
    } else if (isUnlocked) {
      return <div className={`${baseClasses} bg-green-500 text-white`}><CheckCircle className="w-5 h-5" /></div>;
    } else {
      return <div className={`${baseClasses} bg-gray-300 text-gray-600`}>{stageNumber}</div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Evolution Animation Overlay */}
      <AnimatePresence>
        {showEvolutionAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 360, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="text-8xl mb-4"
              >
                ✨
              </motion.div>
              <motion.h2
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-3xl font-bold text-white mb-2"
              >
                Evolution in Progress...
              </motion.h2>
              <p className="text-white/80">Your companion is transforming!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Pet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-purple-600" />
            <span>Evolution Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-2">
                <span className="text-4xl">
                  {pet.level <= 10 ? '🌱' : pet.level <= 25 ? '🌿' : pet.level <= 50 ? '🧙‍♂️' : '👑'}
                </span>
              </div>
              <h3 className="font-semibold">{pet.name}</h3>
              <Badge variant="outline">
                {currentStage?.name || 'Unknown Stage'}
              </Badge>
            </div>

            <div className="flex-1">
              <h4 className="font-semibold mb-4">Current Capabilities</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-green-600 mb-1" />
                  <p className="text-sm font-medium">Level {pet.level}</p>
                  <p className="text-xs text-gray-500">Experience</p>
                </div>
                <div className="text-center">
                  <MapPin className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-sm font-medium">{pet.regions_discovered.length}</p>
                  <p className="text-xs text-gray-500">Regions</p>
                </div>
                <div className="text-center">
                  <Wine className="w-5 h-5 mx-auto text-red-600 mb-1" />
                  <p className="text-sm font-medium">{pet.rare_wines_encountered}</p>
                  <p className="text-xs text-gray-500">Rare Wines</p>
                </div>
                <div className="text-center">
                  <Star className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                  <p className="text-sm font-medium">{pet.total_expertise}</p>
                  <p className="text-xs text-gray-500">Total Expertise</p>
                </div>
              </div>

              {currentStage?.unlocked_abilities && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Unlocked Abilities</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentStage.unlocked_abilities.map((ability, index) => (
                      <Badge key={index} variant="secondary">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Requirements */}
      {nextStage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <ArrowRight className="w-5 h-5" />
                <span>Next Evolution: {nextStage.name}</span>
              </span>
              {evolutionCheck?.can_evolve && (
                <Badge variant="default" className="bg-green-600">
                  Ready to Evolve!
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mb-2">
                  <span className="text-3xl">
                    {nextStage.stage_number === 2 ? '🌿' : 
                     nextStage.stage_number === 3 ? '🧙‍♂️' : '👑'}
                  </span>
                </div>
                <Badge variant="outline">{nextStage.name}</Badge>
              </div>

              <div className="flex-1">
                <p className="text-gray-600 mb-4">{nextStage.description}</p>
                
                {nextStage.unlocked_abilities && (
                  <div>
                    <h5 className="font-medium mb-2">New Abilities</h5>
                    <div className="flex flex-wrap gap-2">
                      {nextStage.unlocked_abilities.map((ability, index) => (
                        <Badge key={index} variant="outline" className="border-purple-300 text-purple-700">
                          <Zap className="w-3 h-3 mr-1" />
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements Check */}
            {evolutionCheck && !evolutionCheck.can_evolve && nextStage.evolution_requirements && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Evolution Requirements</h4>
                
                {Object.entries(nextStage.evolution_requirements).map(([req, required]) => {
                  let current: number;
                  let label: string;
                  let icon: React.ReactNode;

                  switch (req) {
                    case 'level':
                      current = pet.level;
                      label = 'Level';
                      icon = <TrendingUp className="w-4 h-4" />;
                      break;
                    case 'regions_discovered':
                      current = pet.regions_discovered.length;
                      label = 'Regions Discovered';
                      icon = <MapPin className="w-4 h-4" />;
                      break;
                    case 'rare_wines':
                      current = pet.rare_wines_encountered;
                      label = 'Rare Wines Tasted';
                      icon = <Wine className="w-4 h-4" />;
                      break;
                    case 'total_expertise':
                      current = pet.total_expertise;
                      label = 'Total Regional Expertise';
                      icon = <Star className="w-4 h-4" />;
                      break;
                    default:
                      return null;
                  }

                  const status = getRequirementStatus(req, current, required);

                  return (
                    <div key={req} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {icon}
                          <span className="font-medium">{label}</span>
                          {status.isMet && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <span className={`text-sm ${status.isMet ? 'text-green-600' : 'text-gray-600'}`}>
                          {current} / {required}
                        </span>
                      </div>
                      <Progress value={status.percentage} className="h-2" />
                      {!status.isMet && (
                        <p className="text-sm text-gray-500">
                          Need {required - current} more
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Evolution Button */}
            <div className="text-center">
              {evolutionCheck?.can_evolve ? (
                <Button
                  onClick={handleEvolution}
                  disabled={isEvolving}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isEvolving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Evolving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Evolve Now!
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button disabled size="lg" variant="outline">
                    <XCircle className="w-5 h-5 mr-2" />
                    Requirements Not Met
                  </Button>
                  <p className="text-sm text-gray-500">
                    Continue tasting wines to meet evolution requirements
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolution Path */}
      <Card>
        <CardHeader>
          <CardTitle>Evolution Path</CardTitle>
          <p className="text-gray-600">Track your companion's growth journey</p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex items-center justify-between">
              {allStages.map((stage, index) => {
                const isCurrentStage = currentStage?.id === stage.id;
                const isUnlocked = pet.level >= (stage.evolution_requirements?.level || 1);
                const isNext = nextStage?.id === stage.id;

                return (
                  <div key={stage.id} className="flex-1 text-center relative">
                    {/* Connection Line */}
                    {index < allStages.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                        isUnlocked ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                    
                    {/* Stage Icon */}
                    <div className="relative z-10 mb-3">
                      {getStageIcon(stage.stage_number, isCurrentStage, isUnlocked)}
                    </div>
                    
                    {/* Stage Info */}
                    <div className={`${isCurrentStage ? 'ring-2 ring-purple-300' : ''} 
                                  ${isNext && evolutionCheck?.can_evolve ? 'ring-2 ring-green-300' : ''}
                                  p-3 rounded-lg bg-white`}>
                      <h5 className="font-semibold text-sm mb-1">{stage.name}</h5>
                      <p className="text-xs text-gray-600 mb-2">{stage.description}</p>
                      
                      {stage.evolution_requirements?.level && (
                        <Badge variant="outline" className="text-xs">
                          Level {stage.evolution_requirements.level}+
                        </Badge>
                      )}
                      
                      {isCurrentStage && (
                        <Badge className="mt-1 text-xs bg-purple-600">
                          Current
                        </Badge>
                      )}
                      
                      {isNext && evolutionCheck?.can_evolve && (
                        <Badge className="mt-1 text-xs bg-green-600">
                          Ready!
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetEvolutionSystem;