'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPetWithDetails, PetCareStatus, PetCareReminder } from '@/types/pet';
import { usePetStore } from '@/stores/pet-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  Smile, 
  Zap, 
  Clock, 
  Bell, 
  Calendar,
  Coffee,
  Utensils,
  PlayCircle,
  Moon,
  Wine,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface PetCareCenterProps {
  pet?: UserPetWithDetails;
}

const PetCareCenter: React.FC<PetCareCenterProps> = ({ pet: propPet }) => {
  const { 
    currentPet, 
    checkCareNeeds, 
    scheduleCareReminder, 
    acknowledgeCareReminder,
    pendingReminders,
    interactWithPet
  } = usePetStore();
  
  const pet = propPet || currentPet;
  const [careStatus, setCareStatus] = useState<PetCareStatus | null>(null);
  const [autoReminders, setAutoReminders] = useState(true);
  const [selectedReminderTime, setSelectedReminderTime] = useState('12:00');
  
  useEffect(() => {
    if (pet) {
      const status = checkCareNeeds();
      setCareStatus(status);
    }
  }, [pet, checkCareNeeds]);

  useEffect(() => {
    // Set up automatic care checking every minute
    const interval = setInterval(() => {
      if (pet) {
        const status = checkCareNeeds();
        setCareStatus(status);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [pet, checkCareNeeds]);

  if (!pet || !careStatus) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Coffee className="w-12 h-12 mx-auto mb-2" />
          <p>Pet care information unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const getHealthStatusColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    if (health >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMoodEmoji = (happiness: number) => {
    if (happiness >= 90) return '🤩';
    if (happiness >= 70) return '😊';
    if (happiness >= 50) return '🙂';
    if (happiness >= 30) return '😐';
    if (happiness >= 10) return '😔';
    return '😢';
  };

  const getCareUrgency = (status: PetCareStatus) => {
    const urgent = [];
    const recommended = [];
    
    if (status.needs_feeding) urgent.push('Feeding required');
    if (status.needs_interaction && status.hours_since_last_care > 24) urgent.push('Immediate attention needed');
    
    if (status.needs_interaction && status.hours_since_last_care <= 24) recommended.push('Interaction recommended');
    if (pet.energy < 30) recommended.push('Rest recommended');
    if (pet.happiness < 50) recommended.push('Playtime would help');
    
    return { urgent, recommended };
  };

  const urgency = getCareUrgency(careStatus);

  const scheduleReminder = async (type: string, hours: number) => {
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + hours);
    
    try {
      await scheduleCareReminder(type, reminderTime);
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  };

  const dismissReminder = async (reminderId: string) => {
    try {
      await acknowledgeCareReminder(reminderId);
    } catch (error) {
      console.error('Failed to dismiss reminder:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Urgent Care Alerts */}
      <AnimatePresence>
        {urgency.urgent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-2">Urgent Care Needed!</h3>
                    <ul className="space-y-1">
                      {urgency.urgent.map((item, index) => (
                        <li key={index} className="text-sm text-red-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className={`w-6 h-6 ${getHealthStatusColor(pet.health)}`} />
            <span>Care Status - {pet.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Mood and Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">
                {getMoodEmoji(pet.happiness)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {pet.mood.replace('_', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </h3>
                <p className="text-gray-600">
                  Last interaction: {Math.floor(careStatus.hours_since_last_care)}h ago
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={careStatus.mood_trend === 'improving' ? 'default' : 
                              careStatus.mood_trend === 'declining' ? 'destructive' : 'secondary'}>
                  {careStatus.mood_trend === 'improving' ? 'Improving' :
                   careStatus.mood_trend === 'declining' ? 'Declining' : 'Stable'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Daily streak: {pet.daily_streak} days
              </p>
            </div>
          </div>

          {/* Vital Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Health</span>
                </div>
                <span className={`font-bold ${getHealthStatusColor(pet.health)}`}>
                  {pet.health}/100
                </span>
              </div>
              <Progress value={pet.health} className="h-3" />
              <p className="text-xs text-gray-600">
                {pet.health >= 80 ? 'Excellent condition' :
                 pet.health >= 60 ? 'Good health' :
                 pet.health >= 40 ? 'Needs attention' : 'Critical care needed'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smile className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Happiness</span>
                </div>
                <span className="font-bold text-green-600">{pet.happiness}/100</span>
              </div>
              <Progress value={pet.happiness} className="h-3" />
              <p className="text-xs text-gray-600">
                {careStatus.needs_interaction ? 'Wants attention' : 'Content'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Energy</span>
                </div>
                <span className="font-bold text-blue-600">{pet.energy}/100</span>
              </div>
              <Progress value={pet.energy} className="h-3" />
              <p className="text-xs text-gray-600">
                {pet.energy < 30 ? 'Needs rest' : 
                 pet.energy < 60 ? 'Getting tired' : 'Full of energy'}
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-3">
            {pet.is_hungry && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <Utensils className="w-3 h-3 mr-1" />
                Hungry
              </Badge>
            )}
            {pet.is_sleepy && (
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                <Moon className="w-3 h-3 mr-1" />
                Sleepy
              </Badge>
            )}
            {careStatus.needs_feeding && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs Feeding
              </Badge>
            )}
            {careStatus.needs_interaction && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <PlayCircle className="w-3 h-3 mr-1" />
                Wants Attention
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Care Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Care Actions</CardTitle>
          <p className="text-gray-600">Take immediate action to care for your pet</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant={pet.is_hungry ? "default" : "outline"}
              className="h-20 flex-col space-y-2"
              onClick={() => window.location.href = '/wine-tasting'}
            >
              <Wine className="w-6 h-6" />
              <span className="text-sm">Wine Tasting</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => interactWithPet('pet')}
              disabled={careStatus.hours_since_last_care < 0.5}
            >
              <Heart className="w-6 h-6" />
              <span className="text-sm">Pet</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => interactWithPet('play')}
              disabled={pet.energy < 20}
            >
              <PlayCircle className="w-6 h-6" />
              <span className="text-sm">Play</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => interactWithPet('rest')}
              disabled={pet.energy > 80}
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm">Rest</span>
            </Button>
          </div>

          {/* Care Recommendations */}
          {careStatus.recommended_actions.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Recommended Actions</h4>
              <ul className="space-y-1">
                {careStatus.recommended_actions.map((action, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Care Schedule & Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-6 h-6" />
            <span>Care Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-reminders toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="auto-reminders" className="font-medium">
                Automatic Care Reminders
              </Label>
              <p className="text-sm text-gray-600">
                Get notified when your pet needs attention
              </p>
            </div>
            <Switch
              id="auto-reminders"
              checked={autoReminders}
              onCheckedChange={setAutoReminders}
            />
          </div>

          {/* Active Reminders */}
          {pendingReminders.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Active Reminders</h4>
              {pendingReminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        {reminder.reminder_type === 'feed' ? 'Feeding Time' :
                         reminder.reminder_type === 'interact' ? 'Interaction Time' : 'Wine Tasting Time'}
                      </p>
                      <p className="text-sm text-yellow-600">
                        Scheduled for {new Date(reminder.scheduled_for).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dismissReminder(reminder.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Schedule New Reminders */}
          <div className="space-y-3">
            <h4 className="font-semibold">Quick Schedule</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scheduleReminder('interact', 4)}
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>In 4 hours</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => scheduleReminder('interact', 8)}
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>In 8 hours</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => scheduleReminder('wine_tasting', 24)}
                className="flex items-center space-x-2"
              >
                <Wine className="w-4 h-4" />
                <span>Tomorrow</span>
              </Button>
            </div>
          </div>

          {/* Care History Summary */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Care Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-green-700">{pet.daily_streak}</p>
                <p className="text-green-600">Current Streak</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-700">{pet.longest_streak}</p>
                <p className="text-green-600">Best Streak</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-700">{Math.floor(careStatus.hours_since_last_care)}</p>
                <p className="text-green-600">Hours Since Care</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-700">{pet.wine_knowledge_score}</p>
                <p className="text-green-600">Knowledge Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Care Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Care Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Daily Care</span>
              </h5>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Feed with wine tastings daily for best growth</li>
                <li>• Interactive play prevents loneliness</li>
                <li>• Regular rest maintains high energy levels</li>
                <li>• Discover new regions for bonus experience</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-semibold flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Growth Tips</span>
              </h5>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• High-quality wines provide more experience</li>
                <li>• Diverse tastings unlock new abilities</li>
                <li>• Maintain streaks for evolution bonuses</li>
                <li>• Happy pets learn faster from tastings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetCareCenter;