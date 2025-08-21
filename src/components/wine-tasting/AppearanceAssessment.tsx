'use client';

import React from 'react';
import { Eye, Droplets } from 'lucide-react';
import { WineAppearance, WINE_COLORS } from '@/types/wine-tasting';
import { cn, getScaleLabel, INTENSITY_LABELS } from '@/lib/utils';

interface AppearanceAssessmentProps {
  value: WineAppearance;
  onChange: (appearance: WineAppearance) => void;
  className?: string;
}

export function AppearanceAssessment({
  value,
  onChange,
  className
}: AppearanceAssessmentProps) {
  const updateAppearance = (updates: Partial<WineAppearance>) => {
    onChange({ ...value, ...updates });
  };

  const updateColor = (updates: Partial<WineAppearance['color']>) => {
    onChange({
      ...value,
      color: { ...value.color, ...updates }
    });
  };

  const getColorClass = (colorName: string, wineType: string) => {
    const colorMap: Record<string, string> = {
      // White wines
      'water white': 'bg-gray-50 border-gray-200',
      'pale lemon': 'bg-yellow-50 border-yellow-200',
      'lemon': 'bg-yellow-100 border-yellow-300',
      'medium lemon': 'bg-yellow-200 border-yellow-400',
      'deep lemon': 'bg-yellow-300 border-yellow-500',
      'pale gold': 'bg-amber-100 border-amber-300',
      'medium gold': 'bg-amber-200 border-amber-400',
      'deep gold': 'bg-amber-300 border-amber-500',
      'amber': 'bg-amber-400 border-amber-600',
      'brown': 'bg-amber-700 border-amber-800',
      
      // Rosé wines
      'pale salmon': 'bg-pink-100 border-pink-200',
      'salmon': 'bg-pink-200 border-pink-300',
      'pale pink': 'bg-rose-100 border-rose-200',
      'pink': 'bg-rose-200 border-rose-300',
      'deep pink': 'bg-rose-300 border-rose-400',
      'pale orange': 'bg-orange-100 border-orange-200',
      'orange': 'bg-orange-200 border-orange-300',
      'deep orange': 'bg-orange-300 border-orange-400',
      
      // Red wines
      'pale ruby': 'bg-red-200 border-red-300',
      'ruby': 'bg-red-300 border-red-400',
      'medium ruby': 'bg-red-400 border-red-500',
      'deep ruby': 'bg-red-500 border-red-600',
      'pale garnet': 'bg-red-600 border-red-700',
      'garnet': 'bg-red-700 border-red-800',
      'deep garnet': 'bg-red-800 border-red-900',
      'tawny': 'bg-amber-600 border-amber-700',
    };
    
    return colorMap[colorName] || 'bg-neutral-200 border-neutral-300';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-wine-100 dark:bg-wine-900 rounded-full">
          <Eye className="w-5 h-5 text-wine-600 dark:text-wine-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Appearance
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Assess the wine's visual characteristics
          </p>
        </div>
      </div>

      {/* Wine Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Wine Type
        </label>
        <div className="flex gap-2">
          {(['white', 'rose', 'red'] as const).map((type) => (
            <button
              key={type}
              onClick={() => updateColor({ type, primary: WINE_COLORS[type][2] })}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize',
                value.color.type === type
                  ? 'bg-wine-500 text-white shadow-wine'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              {type === 'rose' ? 'Rosé' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Clarity Assessment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Clarity
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['clear', 'hazy', 'cloudy'] as const).map((clarity) => (
            <button
              key={clarity}
              onClick={() => updateAppearance({ clarity })}
              className={cn(
                'p-3 rounded-lg text-sm font-medium transition-all duration-200 capitalize',
                value.clarity === clarity
                  ? 'bg-wine-500 text-white shadow-wine'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <Droplets className={cn(
                  'w-4 h-4',
                  clarity === 'clear' && 'opacity-100',
                  clarity === 'hazy' && 'opacity-70',
                  clarity === 'cloudy' && 'opacity-40'
                )} />
                {clarity}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Intensity: {getScaleLabel(value.intensity, INTENSITY_LABELS)}
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value.intensity}
            onChange={(e) => updateAppearance({ intensity: parseInt(e.target.value) })}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>Light</span>
            <span>Medium</span>
            <span>Pronounced</span>
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Primary Color
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WINE_COLORS[value.color.type].map((color) => (
            <button
              key={color}
              onClick={() => updateColor({ primary: color })}
              className={cn(
                'p-3 rounded-lg border-2 transition-all duration-200 text-center',
                getColorClass(color, value.color.type),
                value.color.primary === color
                  ? 'ring-2 ring-wine-500 ring-offset-2 scale-105'
                  : 'hover:scale-102'
              )}
            >
              <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                {color}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Viscosity (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Viscosity (Optional)
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => updateAppearance({ viscosity: undefined })}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              !value.viscosity
                ? 'bg-neutral-300 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            None
          </button>
          {(['light', 'medium', 'pronounced'] as const).map((viscosity) => (
            <button
              key={viscosity}
              onClick={() => updateAppearance({ viscosity })}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize',
                value.viscosity === viscosity
                  ? 'bg-wine-500 text-white shadow-wine'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              {viscosity}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Summary */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Assessment Summary
        </h4>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="capitalize">{value.clarity}</span>{' '}
          <span className="lowercase">{getScaleLabel(value.intensity, INTENSITY_LABELS)}</span>{' '}
          <span className="lowercase">{value.color.primary}</span>{' '}
          <span className="capitalize">{value.color.type === 'rose' ? 'rosé' : value.color.type}</span>{' '}
          {value.viscosity && (
            <>with <span className="lowercase">{value.viscosity}</span> viscosity</>
          )}
        </p>
      </div>
    </div>
  );
}