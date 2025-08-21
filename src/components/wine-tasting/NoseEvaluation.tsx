'use client';

import React, { useState } from 'react';
import { Nose, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { WineNose, WINE_DESCRIPTORS } from '@/types/wine-tasting';
import { cn, getScaleLabel, INTENSITY_LABELS } from '@/lib/utils';

interface NoseEvaluationProps {
  value: WineNose;
  onChange: (nose: WineNose) => void;
  className?: string;
}

const FAULT_OPTIONS = [
  'Cork taint (TCA)',
  'Reduction (H2S)',
  'Oxidation',
  'Volatile acidity',
  'Brett',
  'Other'
];

const DEVELOPMENT_OPTIONS = [
  { value: 'primary', label: 'Primary', description: 'Fruit, floral aromas from grapes' },
  { value: 'secondary', label: 'Secondary', description: 'Fermentation aromas (yeast, MLF)' },
  { value: 'tertiary', label: 'Tertiary', description: 'Aging aromas (oak, bottle age)' },
  { value: 'mixed', label: 'Mixed', description: 'Combination of all developments' }
] as const;

export function NoseEvaluation({
  value,
  onChange,
  className
}: NoseEvaluationProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const updateNose = (updates: Partial<WineNose>) => {
    onChange({ ...value, ...updates });
  };

  const updateCondition = (updates: Partial<WineNose['condition']>) => {
    onChange({
      ...value,
      condition: { ...value.condition, ...updates }
    });
  };

  const toggleFault = (fault: string) => {
    const currentFaults = value.condition.faulty || [];
    const updatedFaults = currentFaults.includes(fault)
      ? currentFaults.filter(f => f !== fault)
      : [...currentFaults, fault];
    
    updateCondition({ 
      faulty: updatedFaults.length > 0 ? updatedFaults : undefined,
      clean: updatedFaults.length === 0
    });
  };

  const toggleAroma = (category: keyof WineNose['aromaCharacteristics'], aroma: string) => {
    const currentAromas = value.aromaCharacteristics[category] || [];
    const updatedAromas = currentAromas.includes(aroma)
      ? currentAromas.filter(a => a !== aroma)
      : [...currentAromas, aroma];

    onChange({
      ...value,
      aromaCharacteristics: {
        ...value.aromaCharacteristics,
        [category]: updatedAromas.length > 0 ? updatedAromas : undefined
      }
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getSelectedAromasCount = () => {
    return Object.values(value.aromaCharacteristics).reduce(
      (count, aromas) => count + (aromas?.length || 0),
      0
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-wine-100 dark:bg-wine-900 rounded-full">
          <Nose className="w-5 h-5 text-wine-600 dark:text-wine-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Nose
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Evaluate the wine's aromatic profile
          </p>
        </div>
      </div>

      {/* Condition Assessment */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Condition
        </label>
        
        {/* Clean/Faulty Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateCondition({ clean: true, faulty: undefined })}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              value.condition.clean
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            Clean
          </button>
          <button
            onClick={() => updateCondition({ clean: false })}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              !value.condition.clean
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            Faulty
          </button>
        </div>

        {/* Fault Selection */}
        {!value.condition.clean && (
          <div className="space-y-2">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Select detected faults:
            </p>
            <div className="flex flex-wrap gap-2">
              {FAULT_OPTIONS.map((fault) => (
                <button
                  key={fault}
                  onClick={() => toggleFault(fault)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                    (value.condition.faulty || []).includes(fault)
                      ? 'bg-red-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  {fault}
                </button>
              ))}
            </div>
          </div>
        )}
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
            onChange={(e) => updateNose({ intensity: parseInt(e.target.value) })}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>Light</span>
            <span>Medium</span>
            <span>Pronounced</span>
          </div>
        </div>
      </div>

      {/* Aroma Development */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Aroma Development
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DEVELOPMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateNose({ aromaDevelopment: option.value })}
              className={cn(
                'p-3 rounded-lg text-left transition-all duration-200',
                value.aromaDevelopment === option.value
                  ? 'bg-wine-500 text-white shadow-wine'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs opacity-80">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Aroma Characteristics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Aroma Characteristics
          </label>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {getSelectedAromasCount()} selected
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(WINE_DESCRIPTORS).map(([category, aromas]) => {
            const categoryAromas = Array.isArray(aromas) ? aromas : Object.values(aromas).flat();
            const selectedCount = (value.aromaCharacteristics[category as keyof typeof value.aromaCharacteristics] || []).length;
            const isExpanded = expandedCategory === category;

            return (
              <div key={category} className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                      {category}
                    </span>
                    {selectedCount > 0 && (
                      <span className="px-2 py-0.5 bg-wine-500 text-white text-xs rounded-full">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3 bg-white dark:bg-neutral-900">
                    <div className="flex flex-wrap gap-2">
                      {categoryAromas.map((aroma) => (
                        <button
                          key={aroma}
                          onClick={() => toggleAroma(category as keyof WineNose['aromaCharacteristics'], aroma)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                            (value.aromaCharacteristics[category as keyof typeof value.aromaCharacteristics] || []).includes(aroma)
                              ? 'bg-wine-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          )}
                        >
                          {aroma}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Nose Summary
        </h4>
        <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            <span className="capitalize">{value.condition.clean ? 'Clean' : 'Faulty'}</span>{' '}
            nose with <span className="lowercase">{getScaleLabel(value.intensity, INTENSITY_LABELS)}</span> intensity
          </p>
          <p>
            Showing <span className="lowercase">{value.aromaDevelopment}</span> aromas
          </p>
          {getSelectedAromasCount() > 0 && (
            <p>{getSelectedAromasCount()} specific aroma descriptors selected</p>
          )}
        </div>
      </div>
    </div>
  );
}