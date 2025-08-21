'use client';

import React from 'react';
import { Star, Award, Clock, Thermometer, FileText } from 'lucide-react';
import { WineConclusions, QUALITY_LEVELS } from '@/types/wine-tasting';
import { cn } from '@/lib/utils';

interface QualityConclusionsProps {
  value: WineConclusions;
  onChange: (conclusions: WineConclusions) => void;
  className?: string;
}

const READINESS_OPTIONS = [
  {
    value: 'too-young' as const,
    label: 'Too Young',
    description: 'Needs more time to develop',
    color: 'bg-blue-500',
    icon: Clock
  },
  {
    value: 'drink-now' as const,
    label: 'Drink Now',
    description: 'At optimal drinking window',
    color: 'bg-green-500',
    icon: Award
  },
  {
    value: 'past-peak' as const,
    label: 'Past Peak',
    description: 'Beginning to decline',
    color: 'bg-amber-500',
    icon: Clock
  }
];

const SERVING_TEMPERATURES = [
  { range: '6-8°C', label: 'Well Chilled', wines: 'Sparkling, Light whites' },
  { range: '8-12°C', label: 'Chilled', wines: 'Most whites, Light reds' },
  { range: '12-15°C', label: 'Lightly Chilled', wines: 'Full whites, Light reds' },
  { range: '15-18°C', label: 'Cool Room Temp', wines: 'Medium reds' },
  { range: '18-20°C', label: 'Room Temperature', wines: 'Full-bodied reds' }
];

export function QualityConclusions({
  value,
  onChange,
  className
}: QualityConclusionsProps) {
  const updateConclusions = (updates: Partial<WineConclusions>) => {
    onChange({ ...value, ...updates });
  };

  const getQualityLabel = (quality: number) => {
    const level = QUALITY_LEVELS.find(l => l.value === quality);
    return level ? level.label : 'Acceptable';
  };

  const getQualityDescription = (quality: number) => {
    const level = QUALITY_LEVELS.find(l => l.value === quality);
    return level ? level.description : 'Sound wine, drinkable';
  };

  const getScoreFromQuality = (quality: number) => {
    // Convert WSET quality scale to 100-point scale
    const scoreMap = {
      1: 50,  // Poor
      2: 65,  // Below Average
      3: 75,  // Acceptable
      4: 85,  // Good
      5: 92,  // Very Good
      6: 98   // Outstanding
    };
    return scoreMap[quality as keyof typeof scoreMap] || 75;
  };

  const handleQualityChange = (quality: number) => {
    const score = getScoreFromQuality(quality);
    updateConclusions({ quality, score });
  };

  const getTemperatureLabel = (temp: number) => {
    for (const { range, label } of SERVING_TEMPERATURES) {
      const [min, max] = range.split('-').map(t => parseInt(t));
      if (temp >= min && temp <= max) {
        return `${label} (${range})`;
      }
    }
    return `${temp}°C`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-wine-100 dark:bg-wine-900 rounded-full">
          <Star className="w-5 h-5 text-wine-600 dark:text-wine-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Quality & Conclusions
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Final assessment and recommendations
          </p>
        </div>
      </div>

      {/* Quality Assessment */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Quality Level: {getQualityLabel(value.quality)}
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUALITY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => handleQualityChange(level.value)}
                className={cn(
                  'p-3 rounded-lg text-left transition-all duration-200 border-2',
                  value.quality === level.value
                    ? 'bg-gold-500 text-white border-gold-600 shadow-gold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: level.value }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-3 h-3',
                          value.quality === level.value
                            ? 'fill-current'
                            : 'fill-neutral-400'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="font-medium text-sm mt-1">{level.label}</div>
                <div className="text-xs opacity-80">{level.description}</div>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {getQualityDescription(value.quality)}
          </p>
        </div>

        {/* 100-Point Score */}
        <div className="bg-gold-50 dark:bg-gold-950 border border-gold-200 dark:border-gold-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gold-900 dark:text-gold-100">
              Score (Optional)
            </label>
            <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
              {value.score || getScoreFromQuality(value.quality)}/100
            </span>
          </div>
          
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={value.score || getScoreFromQuality(value.quality)}
            onChange={(e) => updateConclusions({ score: parseInt(e.target.value) })}
            className="w-full h-2 bg-gold-200 dark:bg-gold-700 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between text-xs text-gold-600 dark:text-gold-400 mt-1">
            <span>50</span>
            <span>75</span>
            <span>90</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Drinking Readiness */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Drinking Readiness
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {READINESS_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => updateConclusions({ readiness: option.value })}
                className={cn(
                  'p-4 rounded-lg text-center transition-all duration-200 border-2',
                  value.readiness === option.value
                    ? `${option.color} text-white border-opacity-0 shadow-lg`
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}
              >
                <IconComponent className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs opacity-80 mt-1">{option.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aging Potential */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Aging Potential: {value.agingPotential} years
        </label>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="25"
            step="1"
            value={value.agingPotential}
            onChange={(e) => updateConclusions({ agingPotential: parseInt(e.target.value) })}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>Drink now</span>
            <span>5 years</span>
            <span>15+ years</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {[0, 2, 5, 10, 15, 20].map((years) => (
            <button
              key={years}
              onClick={() => updateConclusions({ agingPotential: years })}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                value.agingPotential === years
                  ? 'bg-wine-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              )}
            >
              {years === 0 ? 'Now' : `${years}y`}
            </button>
          ))}
        </div>
      </div>

      {/* Serving Temperature */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Serving Temperature: {getTemperatureLabel(value.temperature)}
        </label>
        
        <div className="space-y-2">
          <div className="relative">
            <input
              type="range"
              min="6"
              max="20"
              step="1"
              value={value.temperature}
              onChange={(e) => updateConclusions({ temperature: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>6°C</span>
              <span>13°C</span>
              <span>20°C</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {SERVING_TEMPERATURES.map(({ range, label, wines }) => {
              const [min, max] = range.split('-').map(t => parseInt(t));
              const isSelected = value.temperature >= min && value.temperature <= max;
              
              return (
                <button
                  key={range}
                  onClick={() => updateConclusions({ temperature: Math.floor((min + max) / 2) })}
                  className={cn(
                    'p-2 rounded-lg text-left text-xs transition-all duration-200',
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  <div className="font-medium">{label}</div>
                  <div className="opacity-80">{range}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Additional Notes
        </label>
        
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
          <textarea
            value={value.notes || ''}
            onChange={(e) => updateConclusions({ notes: e.target.value })}
            placeholder="Personal observations, food pairing suggestions, or other notes..."
            rows={4}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Final Assessment Summary */}
      <div className="bg-wine-50 dark:bg-wine-950 border border-wine-200 dark:border-wine-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-wine-900 dark:text-wine-100 mb-2">
          Final Assessment
        </h4>
        <div className="space-y-1 text-sm text-wine-800 dark:text-wine-200">
          <p>
            <span className="font-medium">{getQualityLabel(value.quality)}</span> quality wine
            {value.score && (
              <span> • {value.score}/100 points</span>
            )}
          </p>
          <p>
            <span className="capitalize">{value.readiness.replace('-', ' ')}</span>
            {value.agingPotential > 0 && (
              <span> • Can age {value.agingPotential} years</span>
            )}
          </p>
          <p>
            Serve at {value.temperature}°C ({getTemperatureLabel(value.temperature).split(' (')[0]})
          </p>
        </div>
      </div>
    </div>
  );
}