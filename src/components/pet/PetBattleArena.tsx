'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPetWithDetails, 
  BattleMatchmakingResult, 
  PetBattle, 
  BattleRound,
  BattleAction 
} from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Swords, 
  Shield, 
  Zap, 
  Star,
  Trophy,
  Target,
  Brain,
  Wine,
  Clock,
  CheckCircle
} from 'lucide-react';

interface PetBattleArenaProps {
  pet?: UserPetWithDetails;
  onBattleComplete?: (result: any) => void;
}

const PetBattleArena: React.FC<PetBattleArenaProps> = ({
  pet: propPet,
  onBattleComplete
}) => {
  const { currentPet, findBattleOpponent, battlePet } = usePetStore();
  const pet = propPet || currentPet;
  
  const [battleState, setBattleState] = useState<'idle' | 'matchmaking' | 'battle' | 'complete'>('idle');
  const [opponent, setOpponent] = useState<BattleMatchmakingResult | null>(null);
  const [currentBattle, setCurrentBattle] = useState<PetBattle | null>(null);
  const [battleRounds, setBattleRounds] = useState<BattleRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [animatingAction, setAnimatingAction] = useState<string | null>(null);

  if (!pet) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Swords className="w-12 h-12 mx-auto mb-2" />
          <p>No pet available for battle</p>
        </CardContent>
      </Card>
    );
  }

  const findOpponent = async () => {
    setBattleState('matchmaking');
    try {
      const matchResult = await findBattleOpponent();
      setOpponent(matchResult);
      setBattleState('idle');
    } catch (error) {
      console.error('Failed to find opponent:', error);
      setBattleState('idle');
    }
  };

  const startBattle = async () => {
    if (!opponent) return;
    
    setBattleState('battle');
    setPlayerHealth(pet.health);
    setOpponentHealth(opponent.opponent_pet.health);
    setCurrentRound(0);
    setBattleRounds([]);
    
    // Simulate battle progression
    simulateBattleRounds();
  };

  const simulateBattleRounds = () => {
    const rounds: BattleRound[] = [];
    let pHealth = pet.health;
    let oHealth = opponent!.opponent_pet.health;
    let roundNum = 1;

    while (pHealth > 0 && oHealth > 0 && roundNum <= 10) {
      // Generate random battle actions
      const playerAction = generateBattleAction(pet, 'player');
      const opponentAction = generateBattleAction(opponent!.opponent_pet, 'opponent');
      
      // Calculate damage
      const playerDamage = calculateDamage(playerAction, pet, opponent!.opponent_pet);
      const opponentDamage = calculateDamage(opponentAction, opponent!.opponent_pet, pet);
      
      pHealth = Math.max(0, pHealth - opponentDamage);
      oHealth = Math.max(0, oHealth - playerDamage);

      const round: BattleRound = {
        round_number: roundNum,
        challenger_action: playerAction,
        opponent_action: opponentAction,
        challenger_damage: playerDamage,
        opponent_damage: opponentDamage,
        challenger_health_remaining: pHealth,
        opponent_health_remaining: oHealth
      };

      rounds.push(round);
      roundNum++;
    }

    setBattleRounds(rounds);
    setBattleResult(pHealth > oHealth ? 'win' : 'lose');
    
    // Animate battle rounds
    animateBattleSequence(rounds);
  };

  const generateBattleAction = (pet: UserPetWithDetails, side: 'player' | 'opponent'): BattleAction => {
    const actions = ['attack', 'defend', 'special', 'wine_knowledge'] as const;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const actionDescriptions = {
      attack: `${pet.name} attacks with wine expertise!`,
      defend: `${pet.name} uses defensive wine knowledge!`,
      special: `${pet.name} uses a special regional technique!`,
      wine_knowledge: `${pet.name} dazzles with wine knowledge!`
    };

    return {
      type: randomAction,
      skill_used: getRandomSkill(pet),
      effectiveness: 0.7 + Math.random() * 0.3,
      description: actionDescriptions[randomAction]
    };
  };

  const getRandomSkill = (pet: UserPetWithDetails): string => {
    const skills = [];
    if (pet.french_expertise > 20) skills.push('French Wine Mastery');
    if (pet.italian_expertise > 20) skills.push('Italian Wine Knowledge');
    if (pet.spanish_expertise > 20) skills.push('Spanish Wine Expertise');
    if (pet.german_expertise > 20) skills.push('German Wine Precision');
    if (pet.new_world_expertise > 20) skills.push('New World Innovation');
    
    return skills.length > 0 ? skills[Math.floor(Math.random() * skills.length)] : 'Basic Wine Knowledge';
  };

  const calculateDamage = (action: BattleAction, attacker: UserPetWithDetails, defender: UserPetWithDetails): number => {
    let baseDamage = 15;
    
    // Action type modifiers
    switch (action.type) {
      case 'attack':
        baseDamage *= 1.2;
        break;
      case 'special':
        baseDamage *= 1.5;
        break;
      case 'wine_knowledge':
        baseDamage *= (attacker.wine_knowledge_score / 100) * 0.5 + 1;
        break;
      case 'defend':
        baseDamage *= 0.5;
        break;
    }

    // Level and expertise modifiers
    const levelModifier = attacker.level / defender.level;
    const expertiseModifier = attacker.total_expertise / Math.max(1, defender.total_expertise);
    
    const finalDamage = baseDamage * action.effectiveness * levelModifier * (1 + expertiseModifier * 0.1);
    
    return Math.max(5, Math.min(35, Math.round(finalDamage)));
  };

  const animateBattleSequence = async (rounds: BattleRound[]) => {
    for (let i = 0; i < rounds.length; i++) {
      setCurrentRound(i);
      
      // Animate player action
      setAnimatingAction('player');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update health after player action
      setOpponentHealth(rounds[i].opponent_health_remaining);
      
      if (rounds[i].opponent_health_remaining <= 0) break;
      
      // Animate opponent action
      setAnimatingAction('opponent');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update health after opponent action
      setPlayerHealth(rounds[i].challenger_health_remaining);
      
      if (rounds[i].challenger_health_remaining <= 0) break;
      
      setAnimatingAction(null);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setBattleState('complete');
  };

  const resetBattle = () => {
    setBattleState('idle');
    setOpponent(null);
    setCurrentBattle(null);
    setBattleRounds([]);
    setBattleResult(null);
    setAnimatingAction(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Battle Arena Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span>Pet Battle Arena</span>
          </CardTitle>
          <p className="text-gray-600">Challenge other wine pets to friendly battles!</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍷</span>
              </div>
              <div>
                <h3 className="font-semibold">{pet.name}</h3>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>Level {pet.level}</span>
                  <span>•</span>
                  <span>{pet.battle_wins}W / {pet.battle_losses}L</span>
                  <span>•</span>
                  <span>{pet.prestige_points} Prestige</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant={pet.health >= 80 ? 'default' : pet.health >= 50 ? 'secondary' : 'destructive'}>
                Battle Ready
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                Win Rate: {pet.battle_wins + pet.battle_losses > 0 ? 
                  Math.round((pet.battle_wins / (pet.battle_wins + pet.battle_losses)) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {battleState === 'idle' && !opponent && (
        <Card>
          <CardContent className="p-8 text-center">
            <Swords className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Find an Opponent</h3>
            <p className="text-gray-600 mb-6">
              Challenge another wine pet to a friendly battle. Battle outcomes are based on wine knowledge,
              level, and regional expertise.
            </p>
            <Button 
              onClick={findOpponent} 
              disabled={battleState === 'matchmaking'}
              size="lg"
            >
              {battleState === 'matchmaking' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Finding Opponent...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Find Battle Opponent
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {opponent && battleState === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle>Battle Match Found!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Player Pet */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🍷</span>
                </div>
                <h3 className="font-semibold">{pet.name}</h3>
                <p className="text-sm text-gray-600">Level {pet.level}</p>
                <Badge variant="default" className="mt-2">You</Badge>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400 mb-2">VS</div>
                <div className="space-y-2">
                  <Progress value={opponent.estimated_win_probability * 100} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {Math.round(opponent.estimated_win_probability * 100)}% win chance
                  </p>
                </div>
              </div>

              {/* Opponent Pet */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🍾</span>
                </div>
                <h3 className="font-semibold">{opponent.opponent_pet.name}</h3>
                <p className="text-sm text-gray-600">Level {opponent.opponent_pet.level}</p>
                <Badge variant="outline" className="mt-2">Opponent</Badge>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Battle Preview</h4>
              <p className="text-sm text-gray-600 mb-3">{opponent.battle_preview}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Potential Rewards:</p>
                  <ul className="text-gray-600">
                    <li>• {opponent.potential_rewards.experience} Experience</li>
                    <li>• {opponent.potential_rewards.prestige} Prestige Points</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Battle Factors:</p>
                  <ul className="text-gray-600">
                    <li>• Wine knowledge</li>
                    <li>• Regional expertise</li>
                    <li>• Pet level & stats</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <Button variant="outline" onClick={() => setOpponent(null)}>
                Find Different Opponent
              </Button>
              <Button onClick={startBattle}>
                <Swords className="w-4 h-4 mr-2" />
                Start Battle!
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {battleState === 'battle' && opponent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {pet.name} vs {opponent.opponent_pet.name}
            </CardTitle>
            <p className="text-center text-gray-600">Round {currentRound + 1}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Battle Health Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Player */}
              <div className="text-center">
                <motion.div
                  animate={animatingAction === 'player' ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-2"
                >
                  <span className="text-2xl">🍷</span>
                </motion.div>
                <h3 className="font-semibold">{pet.name}</h3>
                <Progress value={playerHealth} className="h-3 mt-2" />
                <p className="text-sm text-gray-600">{playerHealth}/100 HP</p>
              </div>

              {/* Battle Actions */}
              <div className="text-center">
                <AnimatePresence mode="wait">
                  {animatingAction && (
                    <motion.div
                      key={animatingAction}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      {animatingAction === 'player' ? (
                        <div className="text-purple-600">
                          <Zap className="w-8 h-8 mx-auto mb-1" />
                          <p className="text-sm font-medium">
                            {battleRounds[currentRound]?.challenger_action.description}
                          </p>
                        </div>
                      ) : (
                        <div className="text-blue-600">
                          <Shield className="w-8 h-8 mx-auto mb-1" />
                          <p className="text-sm font-medium">
                            {battleRounds[currentRound]?.opponent_action.description}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Opponent */}
              <div className="text-center">
                <motion.div
                  animate={animatingAction === 'opponent' ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-2"
                >
                  <span className="text-2xl">🍾</span>
                </motion.div>
                <h3 className="font-semibold">{opponent.opponent_pet.name}</h3>
                <Progress value={opponentHealth} className="h-3 mt-2" />
                <p className="text-sm text-gray-600">{opponentHealth}/100 HP</p>
              </div>
            </div>

            {/* Battle Log */}
            {battleRounds.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <h4 className="font-semibold mb-2">Battle Log</h4>
                <div className="space-y-1 text-sm">
                  {battleRounds.slice(0, currentRound + 1).map((round, index) => (
                    <div key={index} className="border-l-2 border-gray-300 pl-3">
                      <p><strong>Round {round.round_number}:</strong></p>
                      <p className="text-purple-600">• {round.challenger_action.description} ({round.challenger_damage} damage)</p>
                      <p className="text-blue-600">• {round.opponent_action.description} ({round.opponent_damage} damage)</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {battleState === 'complete' && battleResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className={battleResult === 'win' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">
                {battleResult === 'win' ? '🏆' : '💪'}
              </div>
              
              <h2 className={`text-3xl font-bold mb-2 ${
                battleResult === 'win' ? 'text-green-800' : 'text-red-800'
              }`}>
                {battleResult === 'win' ? 'Victory!' : 'Good Fight!'}
              </h2>
              
              <p className={`mb-6 ${
                battleResult === 'win' ? 'text-green-600' : 'text-red-600'
              }`}>
                {battleResult === 'win' 
                  ? `${pet.name} emerged victorious through superior wine knowledge!`
                  : `${pet.name} fought bravely and gained valuable experience!`
                }
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${
                  battleResult === 'win' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                  <p className="font-semibold">Experience Gained</p>
                  <p className={battleResult === 'win' ? 'text-green-700' : 'text-red-700'}>
                    +{opponent?.potential_rewards.experience} XP
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${
                  battleResult === 'win' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Prestige Points</p>
                  <p className={battleResult === 'win' ? 'text-green-700' : 'text-red-700'}>
                    +{Math.floor((opponent?.potential_rewards.prestige || 0) * (battleResult === 'win' ? 1 : 0.5))}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <Button variant="outline" onClick={resetBattle}>
                  <Swords className="w-4 h-4 mr-2" />
                  Battle Again
                </Button>
                <Button onClick={() => {
                  onBattleComplete?.({ result: battleResult, rewards: opponent?.potential_rewards });
                  resetBattle();
                }}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default PetBattleArena;