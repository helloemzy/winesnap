'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Users, 
  Trophy, 
  Clock, 
  Star,
  Zap,
  Plus,
  CheckCircle,
  XCircle,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  MessageSquare,
  Share2,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { UserPetWithDetails } from '@/types/pet';

interface FriendChallenge {
  id: string;
  creatorId: string;
  creatorName: string;
  challengeType: 'discovery_race' | 'region_mastery' | 'pet_evolution' | 'knowledge_test' | 'battle_streak';
  title: string;
  description: string;
  duration: number; // hours
  target: number;
  stakes: {
    entry_cost: number; // prestige points
    winner_reward: number;
    participation_reward: number;
  };
  participants: ChallengeParticipant[];
  status: 'open' | 'active' | 'completed' | 'expired';
  created_at: string;
  starts_at: string;
  ends_at: string;
  winner_id?: string;
}

interface ChallengeParticipant {
  userId: string;
  userName: string;
  petName: string;
  progress: number;
  position: number;
  joined_at: string;
  last_update: string;
}

interface FriendChallengeSystemProps {
  currentUser: {
    id: string;
    displayName: string;
    friends: Array<{ id: string; name: string; }>;
  };
  pet: UserPetWithDetails;
  onChallengeCreate?: (challenge: FriendChallenge) => void;
  onChallengeJoin?: (challengeId: string) => void;
}

const FriendChallengeSystem: React.FC<FriendChallengeSystemProps> = ({
  currentUser,
  pet,
  onChallengeCreate,
  onChallengeJoin
}) => {
  const [activeChallenges, setActiveChallenges] = useState<FriendChallenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<FriendChallenge[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedChallengeType, setSelectedChallengeType] = useState<FriendChallenge['challengeType']>('discovery_race');

  // Mock data for demonstration
  useEffect(() => {
    const mockChallenges: FriendChallenge[] = [
      {
        id: '1',
        creatorId: 'friend1',
        creatorName: 'VintageViking',
        challengeType: 'discovery_race',
        title: 'Bordeaux Discovery Sprint',
        description: 'First to discover 10 Bordeaux wines wins! Show off your French wine expertise.',
        duration: 168, // 7 days
        target: 10,
        stakes: {
          entry_cost: 100,
          winner_reward: 500,
          participation_reward: 50
        },
        participants: [
          {
            userId: 'friend1',
            userName: 'VintageViking',
            petName: 'Bordeaux Belle',
            progress: 7,
            position: 1,
            joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            last_update: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            userId: 'friend2',
            userName: 'ChateauChaser',
            petName: 'Noble Guardian',
            progress: 6,
            position: 2,
            joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            last_update: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ],
        status: 'active',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        starts_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        creatorId: 'friend3',
        creatorName: 'TuscanyTaster',
        challengeType: 'pet_evolution',
        title: 'Evolution Race: Next Stage',
        description: 'Who can evolve their pet to the next stage first? May the best wine knowledge win!',
        duration: 336, // 14 days
        target: 1,
        stakes: {
          entry_cost: 200,
          winner_reward: 1000,
          participation_reward: 100
        },
        participants: [
          {
            userId: 'friend3',
            userName: 'TuscanyTaster',
            petName: 'Vintage Sage',
            progress: 0.8,
            position: 1,
            joined_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            last_update: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ],
        status: 'open',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setAvailableChallenges(mockChallenges.filter(c => c.status === 'open'));
    setActiveChallenges(mockChallenges.filter(c => c.status === 'active'));
  }, []);

  const challengeTypes = {
    discovery_race: {
      icon: <Star className="w-5 h-5" />,
      title: 'Discovery Race',
      description: 'First to discover X wines wins'
    },
    region_mastery: {
      icon: <Trophy className="w-5 h-5" />,
      title: 'Region Mastery',
      description: 'Complete regional collections fastest'
    },
    pet_evolution: {
      icon: <Zap className="w-5 h-5" />,
      title: 'Evolution Race',
      description: 'First to evolve pet to next stage'
    },
    knowledge_test: {
      icon: <Award className="w-5 h-5" />,
      title: 'Knowledge Duel',
      description: 'Wine trivia and tasting challenges'
    },
    battle_streak: {
      icon: <Crown className="w-5 h-5" />,
      title: 'Battle Streak',
      description: 'Longest winning streak in battles'
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1: return <Badge className="bg-yellow-500 text-white"><Crown className="w-3 h-3 mr-1" />1st</Badge>;
      case 2: return <Badge className="bg-gray-400 text-white"><Medal className="w-3 h-3 mr-1" />2nd</Badge>;
      case 3: return <Badge className="bg-amber-600 text-white"><Medal className="w-3 h-3 mr-1" />3rd</Badge>;
      default: return <Badge variant="outline">{position}th</Badge>;
    }
  };

  const renderActiveChallenge = (challenge: FriendChallenge) => (
    <Card key={challenge.id} className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {challengeTypes[challenge.challengeType].icon}
            <span>{challenge.title}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600">Active</Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {getTimeRemaining(challenge.ends_at)}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-green-600">{challenge.description}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Leaderboard */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-green-800">Current Rankings</h4>
            {challenge.participants
              .sort((a, b) => b.progress - a.progress)
              .map((participant, index) => (
                <div key={participant.userId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getPositionBadge(index + 1)}
                    <div>
                      <p className="font-semibold text-sm">{participant.userName}</p>
                      <p className="text-xs text-gray-600">{participant.petName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">
                      {Math.floor(participant.progress * 100) / 100}/{challenge.target}
                    </p>
                    <Progress 
                      value={(participant.progress / challenge.target) * 100} 
                      className="w-20 h-2 mt-1"
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Challenge Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share Progress
            </Button>
          </div>

          {/* Potential Rewards */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Current Prize Pool</span>
            </div>
            <div className="text-sm text-yellow-700">
              <p>🏆 Winner: {challenge.stakes.winner_reward} Prestige Points</p>
              <p>🎁 All Participants: {challenge.stakes.participation_reward} Points</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAvailableChallenge = (challenge: FriendChallenge) => (
    <Card key={challenge.id} className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {challengeTypes[challenge.challengeType].icon}
            <span>{challenge.title}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-600">Open</Badge>
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {challenge.participants.length} joined
            </Badge>
          </div>
        </div>
        <p className="text-sm text-blue-600">{challenge.description}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Challenge Goal:</p>
              <p className="font-semibold">{challenge.target} {challenge.challengeType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-600">Duration:</p>
              <p className="font-semibold">{Math.floor(challenge.duration / 24)} days</p>
            </div>
            <div>
              <p className="text-gray-600">Entry Cost:</p>
              <p className="font-semibold">{challenge.stakes.entry_cost} Prestige</p>
            </div>
            <div>
              <p className="text-gray-600">Winner Prize:</p>
              <p className="font-semibold text-green-600">{challenge.stakes.winner_reward} Prestige</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-600">
              Created by <span className="font-semibold text-blue-700">{challenge.creatorName}</span>
            </div>
            <Button 
              onClick={() => onChallengeJoin?.(challenge.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Join Challenge
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-purple-600" />
                <span>Friend Challenges</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">Compete with friends and grow your wine knowledge together</p>
            </div>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Friend Challenge</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Challenge Type Selection */}
                  <div>
                    <label className="text-sm font-medium">Challenge Type</label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {Object.entries(challengeTypes).map(([key, type]) => (
                        <Button
                          key={key}
                          variant={selectedChallengeType === key ? 'default' : 'outline'}
                          onClick={() => setSelectedChallengeType(key as FriendChallenge['challengeType'])}
                          className="justify-start"
                        >
                          {type.icon}
                          <div className="ml-3 text-left">
                            <div className="font-semibold">{type.title}</div>
                            <div className="text-xs opacity-70">{type.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Challenge Details */}
                  <div className="space-y-3">
                    <Input placeholder="Challenge title..." />
                    <Textarea placeholder="Challenge description..." />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" placeholder="Target (e.g., 10 wines)" />
                      <Input type="number" placeholder="Duration (days)" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" placeholder="Entry cost (prestige)" />
                      <Input type="number" placeholder="Winner reward" />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(false)} className="flex-1">
                      Create Challenge
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Your Active Challenges</span>
          </h2>
          {activeChallenges.map(renderActiveChallenge)}
        </div>
      )}

      {/* Available Challenges */}
      {availableChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Open Challenges</span>
          </h2>
          {availableChallenges.map(renderAvailableChallenge)}
        </div>
      )}

      {/* Empty State */}
      {activeChallenges.length === 0 && availableChallenges.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Challenges</h3>
            <p className="text-gray-600 mb-6">
              Start competing with friends! Create a challenge or invite friends to join WineSnap.
            </p>
            <div className="flex space-x-4 justify-center">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Challenge
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Viral Benefits Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Gift className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-800">Challenge Viral Rewards</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">For Creating Challenges:</h4>
              <ul className="space-y-1 text-purple-600">
                <li>• +50 Prestige per participant who joins</li>
                <li>• Exclusive "Challenge Creator" badge</li>
                <li>• Access to premium challenge types</li>
                <li>• Network growth tracking rewards</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">For Active Participation:</h4>
              <ul className="space-y-1 text-purple-600">
                <li>• 2x experience during challenges</li>
                <li>• Friend network discovery bonuses</li>
                <li>• Exclusive challenger tournaments</li>
                <li>• Social achievement unlocks</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700">
              <strong>Viral Bonus:</strong> Each friend who joins WineSnap through your challenges gives you permanent +5% discovery rate bonus!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendChallengeSystem;