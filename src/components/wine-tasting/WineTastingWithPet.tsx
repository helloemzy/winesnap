'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WineTasting, WSETAssessment } from '@/types/wine';
import { UserPetWithDetails, PetFeedingResult, WineTastingImpact } from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wine, 
  Sparkles, 
  Heart, 
  Smile, 
  Zap,
  MapPin,
  Star,
  Trophy,
  TrendingUp,
  Gift,
  Volume2,
  Mic,
  Save
} from 'lucide-react';

interface WineTastingWithPetProps {
  onTastingComplete?: (tasting: WineTasting, petResult?: PetFeedingResult) => void;
}

const WineTastingWithPet: React.FC<WineTastingWithPetProps> = ({
  onTastingComplete
}) => {
  const { currentPet, feedPetWithWine, checkCareNeeds } = usePetStore();
  const [wineTasting, setWineTasting] = useState<Partial<WineTasting>>({
    wine_name: '',
    producer: '',
    vintage: new Date().getFullYear(),
    region: '',
    country: '',
    grape_varieties: [],
    quality_assessment: 'good'
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [petFeedingResult, setPetFeedingResult] = useState<PetFeedingResult | null>(null);
  const [predictedImpact, setPredictedImpact] = useState<WineTastingImpact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPetReaction, setShowPetReaction] = useState(false);

  const careStatus = currentPet ? checkCareNeeds() : null;

  // Mock wine regions and countries for autocomplete
  const wineRegions = [
    'Bordeaux', 'Burgundy', 'Champagne', 'Tuscany', 'Piedmont', 'Rioja',
    'Napa Valley', 'Sonoma', 'Barossa Valley', 'Marlborough', 'Stellenbosch'
  ];

  const wineCountries = [
    'France', 'Italy', 'Spain', 'Germany', 'United States', 'Australia',
    'New Zealand', 'South Africa', 'Chile', 'Argentina'
  ];

  const grapeVarieties = [
    'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Chardonnay', 'Sauvignon Blanc',
    'Riesling', 'Syrah', 'Grenache', 'Tempranillo', 'Sangiovese'
  ];

  // Predict how this wine will impact the pet
  useEffect(() => {
    if (currentPet && wineTasting.region && wineTasting.country && wineTasting.quality_assessment) {
      const mockImpact: WineTastingImpact = {
        base_experience: wineTasting.quality_assessment === 'outstanding' ? 35 : 
                        wineTasting.quality_assessment === 'very good' ? 25 : 15,
        bonus_experience: calculateBonusExperience(),
        stat_effects: {
          health: getQualityHealthBonus(wineTasting.quality_assessment),
          happiness: getQualityHappinessBonus(wineTasting.quality_assessment),
          energy: 5
        },
        expertise_gains: calculateExpertiseGains(),
        new_discoveries: calculateNewDiscoveries(),
        rarity_multiplier: wineTasting.quality_assessment === 'outstanding' ? 1.5 : 1.0,
        special_effects: []
      };
      setPredictedImpact(mockImpact);
    }
  }, [wineTasting, currentPet]);

  const calculateBonusExperience = (): number => {
    let bonus = 0;
    if (currentPet && wineTasting.region && !currentPet.regions_discovered.includes(wineTasting.region)) {
      bonus += 20; // New region bonus
    }
    if (currentPet && wineTasting.country && !currentPet.countries_explored.includes(wineTasting.country)) {
      bonus += 15; // New country bonus
    }
    return bonus;
  };

  const calculateExpertiseGains = (): Record<string, number> => {
    const gains: Record<string, number> = {
      french_expertise: 0,
      italian_expertise: 0,
      spanish_expertise: 0,
      german_expertise: 0,
      new_world_expertise: 0
    };

    if (!wineTasting.country) return gains;

    const baseGain = 5;
    if (wineTasting.country === 'France') gains.french_expertise = baseGain;
    else if (wineTasting.country === 'Italy') gains.italian_expertise = baseGain;
    else if (wineTasting.country === 'Spain') gains.spanish_expertise = baseGain;
    else if (wineTasting.country === 'Germany') gains.german_expertise = baseGain;
    else if (['United States', 'Australia', 'New Zealand', 'South Africa', 'Chile', 'Argentina'].includes(wineTasting.country)) {
      gains.new_world_expertise = baseGain;
    }

    return gains;
  };

  const calculateNewDiscoveries = () => {
    if (!currentPet) return { regions: [], countries: [], grape_varieties: [] };

    return {
      regions: wineTasting.region && !currentPet.regions_discovered.includes(wineTasting.region) 
        ? [wineTasting.region] : [],
      countries: wineTasting.country && !currentPet.countries_explored.includes(wineTasting.country) 
        ? [wineTasting.country] : [],
      grape_varieties: wineTasting.grape_varieties?.filter(grape => 
        !currentPet.grape_varieties_tasted.includes(grape)
      ) || []
    };
  };

  const getQualityHealthBonus = (quality: string): number => {
    switch (quality) {
      case 'outstanding': return 10;
      case 'very good': return 7;
      case 'good': return 5;
      case 'acceptable': return 3;
      default: return 0;
    }
  };

  const getQualityHappinessBonus = (quality: string): number => {
    switch (quality) {
      case 'outstanding': return 20;
      case 'very good': return 15;
      case 'good': return 10;
      case 'acceptable': return 5;
      default: return 0;
    }
  };

  const handleSubmitTasting = async () => {
    if (!currentPet || !wineTasting.wine_name) return;

    setIsSubmitting(true);
    setShowPetReaction(true);

    try {
      // Create complete wine tasting object
      const completeTasting: WineTasting = {
        id: `tasting-${Date.now()}`,
        user_id: currentPet.user_id,
        wine_name: wineTasting.wine_name!,
        producer: wineTasting.producer,
        vintage: wineTasting.vintage,
        region: wineTasting.region,
        country: wineTasting.country,
        grape_varieties: wineTasting.grape_varieties,
        quality_assessment: wineTasting.quality_assessment!,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Feed pet with wine tasting
      const result = await feedPetWithWine(completeTasting);
      setPetFeedingResult(result);

      // Simulate pet reaction animation
      setTimeout(() => {
        setShowPetReaction(false);
        onTastingComplete?.(completeTasting, result);
      }, 3000);

    } catch (error) {
      console.error('Failed to submit wine tasting:', error);
      setShowPetReaction(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPetMoodEmoji = () => {
    if (!currentPet) return '🍷';
    
    switch (currentPet.mood) {
      case 'ecstatic': return '🤩';
      case 'very_happy': return '😊';
      case 'happy': return '🙂';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      case 'very_sad': return '😢';
      default: return '🍷';
    }
  };

  if (!currentPet) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wine className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Pet Companion</h3>
          <p className="text-gray-600 mb-4">
            Adopt a wine pet to make your tasting journey more engaging and rewarding!
          </p>
          <Button onClick={() => window.location.href = '/pet/adopt'}>
            Adopt Your First Pet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Pet Status Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  scale: showPetReaction ? [1, 1.2, 1] : 1,
                  rotate: showPetReaction ? [0, 10, -10, 0] : 0 
                }}
                transition={{ duration: 0.5, repeat: showPetReaction ? Infinity : 0 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
              >
                <span className="text-3xl">
                  {showPetReaction ? '✨' : getPetMoodEmoji()}
                </span>
              </motion.div>
              
              <div>
                <h2 className="text-xl font-bold">{currentPet.name} is ready for tasting!</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{currentPet.health}/100</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Smile className="w-4 h-4 text-green-500" />
                    <span>{currentPet.happiness}/100</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Level {currentPet.level}</span>
                  </span>
                </div>
              </div>
            </div>

            {careStatus?.needs_feeding && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Hungry for wine!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wine Tasting Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wine className="w-6 h-6" />
            <span>Wine Tasting Entry</span>
          </CardTitle>
          <p className="text-gray-600">
            Share your wine tasting experience and watch your pet grow with each discovery!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Wine Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Wine Name *</label>
              <input
                type="text"
                value={wineTasting.wine_name || ''}
                onChange={(e) => setWineTasting({ ...wineTasting, wine_name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter wine name..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Producer</label>
              <input
                type="text"
                value={wineTasting.producer || ''}
                onChange={(e) => setWineTasting({ ...wineTasting, producer: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Wine producer..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vintage</label>
              <input
                type="number"
                value={wineTasting.vintage || ''}
                onChange={(e) => setWineTasting({ ...wineTasting, vintage: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <select
                value={wineTasting.region || ''}
                onChange={(e) => setWineTasting({ ...wineTasting, region: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select region...</option>
                {wineRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                value={wineTasting.country || ''}
                onChange={(e) => setWineTasting({ ...wineTasting, country: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select country...</option>
                {wineCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grape Varieties */}
          <div>
            <label className="block text-sm font-medium mb-2">Grape Varieties</label>
            <div className="flex flex-wrap gap-2">
              {grapeVarieties.map(grape => (
                <button
                  key={grape}
                  onClick={() => {
                    const varieties = wineTasting.grape_varieties || [];
                    const newVarieties = varieties.includes(grape)
                      ? varieties.filter(v => v !== grape)
                      : [...varieties, grape];
                    setWineTasting({ ...wineTasting, grape_varieties: newVarieties });
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    wineTasting.grape_varieties?.includes(grape)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {grape}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Assessment */}
          <div>
            <label className="block text-sm font-medium mb-2">Quality Assessment</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['poor', 'acceptable', 'good', 'very good', 'outstanding'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => setWineTasting({ ...wineTasting, quality_assessment: quality })}
                  className={`p-3 rounded-lg text-sm font-medium transition-all capitalize ${
                    wineTasting.quality_assessment === quality
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Recording */}
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Voice Notes</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              disabled={isRecording}
            >
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-red-500 rounded-full mr-2"
                  />
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Record Notes
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Volume2 className="w-4 h-4 mr-2" />
              Playback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pet Impact Preview */}
      {predictedImpact && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Sparkles className="w-5 h-5" />
              <span>Pet Growth Preview</span>
            </CardTitle>
            <p className="text-purple-600">See how this wine will affect {currentPet.name}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Experience</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  +{Math.floor((predictedImpact.base_experience + predictedImpact.bonus_experience) * predictedImpact.rarity_multiplier)}
                </p>
                <p className="text-sm text-gray-600">
                  Base: {predictedImpact.base_experience}, Bonus: {predictedImpact.bonus_experience}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-semibold">Health & Mood</span>
                </div>
                <div className="flex space-x-2">
                  <span className="text-red-600">+{predictedImpact.stat_effects.health}</span>
                  <span className="text-green-600">+{predictedImpact.stat_effects.happiness}</span>
                </div>
                <p className="text-sm text-gray-600">Health + Happiness</p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Discoveries</span>
                </div>
                <p className="text-sm">
                  {predictedImpact.new_discoveries.regions.length > 0 && (
                    <Badge variant="outline" className="mr-1">New Region!</Badge>
                  )}
                  {predictedImpact.new_discoveries.countries.length > 0 && (
                    <Badge variant="outline" className="mr-1">New Country!</Badge>
                  )}
                  {predictedImpact.new_discoveries.regions.length === 0 && 
                   predictedImpact.new_discoveries.countries.length === 0 && (
                    <span className="text-gray-600">No new discoveries</span>
                  )}
                </p>
              </div>
            </div>

            {/* Expertise Gains */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Regional Expertise Gains</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                {Object.entries(predictedImpact.expertise_gains).map(([expertise, gain]) => (
                  gain > 0 && (
                    <div key={expertise} className="text-center">
                      <p className="font-medium text-blue-600">+{gain}</p>
                      <p className="text-gray-600 capitalize">
                        {expertise.replace('_expertise', '').replace('_', ' ')}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmitTasting}
          disabled={!wineTasting.wine_name || isSubmitting}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Feeding {currentPet.name}...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 mr-2" />
              Feed {currentPet.name} with This Wine
            </>
          )}
        </Button>
      </div>

      {/* Pet Reaction Animation */}
      <AnimatePresence>
        {showPetReaction && petFeedingResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="max-w-md mx-4">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  {petFeedingResult.wine_discovery_bonus ? '🎉' : '😊'}
                </motion.div>
                
                <h3 className="text-xl font-bold mb-2">
                  {currentPet.name} {petFeedingResult.success ? 'loved' : 'tried'} the wine!
                </h3>
                
                <p className="text-gray-600 mb-4">{petFeedingResult.message}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-yellow-600">
                      +{petFeedingResult.experience_gained} XP
                    </p>
                    <p className="text-gray-500">Experience</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">
                      +{petFeedingResult.stats_changed.happiness}
                    </p>
                    <p className="text-gray-500">Happiness</p>
                  </div>
                </div>

                {petFeedingResult.wine_discovery_bonus && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-purple-800 font-semibold">🌟 Discovery Bonus!</p>
                    <p className="text-purple-600 text-sm">
                      New regions and countries discovered!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WineTastingWithPet;