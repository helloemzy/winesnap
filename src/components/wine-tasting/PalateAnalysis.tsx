'use client';

import React, { useState } from 'react';
import { Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { WinePalate, WINE_DESCRIPTORS } from '@/types/wine-tasting';
import { cn, getScaleLabel, SWEETNESS_LABELS, ACIDITY_LABELS, TANNIN_LABELS, ALCOHOL_LABELS, BODY_LABELS, FINISH_LABELS, INTENSITY_LABELS } from '@/lib/utils';

interface PalateAnalysisProps {
  value: WinePalate;
  onChange: (palate: WinePalate) => void;
  wineType?: 'white' | 'rose' | 'red';
  className?: string;
}

interface TastingParameter {
  key: keyof Pick<WinePalate, 'sweetness' | 'acidity' | 'tannin' | 'alcohol' | 'body' | 'intensity' | 'finish'>;
  label: string;
  labels: string[];
  description: string;
  showForWineTypes?: ('white' | 'rose' | 'red')[];
}

const TASTING_PARAMETERS: TastingParameter[] = [
  {
    key: 'sweetness',
    label: 'Sweetness',
    labels: SWEETNESS_LABELS,
    description: 'Perception of residual sugar'
  },
  {
    key: 'acidity',
    label: 'Acidity',
    labels: ACIDITY_LABELS,
    description: 'Tartness and freshness'
  },
  {
    key: 'tannin',
    label: 'Tannin',
    labels: TANNIN_LABELS,
    description: 'Astringency and structure',
    showForWineTypes: ['red']
  },
  {
    key: 'alcohol',
    label: 'Alcohol',
    labels: ALCOHOL_LABELS,
    description: 'Warmth and weight sensation'
  },
  {
    key: 'body',
    label: 'Body',
    labels: BODY_LABELS,
    description: 'Weight and texture in mouth'
  },
  {
    key: 'intensity',
    label: 'Flavor Intensity',
    labels: INTENSITY_LABELS,
    description: 'Strength of flavor concentration'
  },
  {
    key: 'finish',
    label: 'Finish',
    labels: FINISH_LABELS,
    description: 'Length and persistence of flavors'
  }
];

export function PalateAnalysis({
  value,
  onChange,
  wineType = 'red',
  className
}: PalateAnalysisProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const updatePalate = (updates: Partial<WinePalate>) => {
    onChange({ ...value, ...updates });
  };

  const toggleFlavor = (category: keyof WinePalate['flavorCharacteristics'], flavor: string) => {
    const currentFlavors = value.flavorCharacteristics[category] || [];
    const updatedFlavors = currentFlavors.includes(flavor)
      ? currentFlavors.filter(f => f !== flavor)
      : [...currentFlavors, flavor];

    onChange({
      ...value,
      flavorCharacteristics: {
        ...value.flavorCharacteristics,
        [category]: updatedFlavors.length > 0 ? updatedFlavors : undefined
      }
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getSelectedFlavorsCount = () => {
    return Object.values(value.flavorCharacteristics).reduce(
      (count, flavors) => count + (flavors?.length || 0),
      0
    );
  };

  const getVisibleParameters = () => {
    return TASTING_PARAMETERS.filter(param => 
      !param.showForWineTypes || param.showForWineTypes.includes(wineType)
    );
  };

  const getBalanceDescription = () => {
    const { sweetness, acidity, tannin, alcohol } = value;
    
    if (wineType === 'red') {
      // For red wines, balance between acidity, tannin, alcohol, and fruit
      if (Math.abs(acidity - tannin) <= 1 && Math.abs(acidity - alcohol) <= 1) {
        return 'Well-balanced structure';
      } else if (acidity > tannin + 1) {
        return 'Acidity dominant';
      } else if (tannin > acidity + 1) {
        return 'Tannin dominant';
      } else if (alcohol > Math.max(acidity, tannin) + 1) {
        return 'Alcohol dominant';
      }
    } else {
      // For white and rosé wines, balance between sweetness, acidity, and alcohol
      if (sweetness === 1 && acidity >= 3) {
        return 'Classic dry wine balance';
      } else if (sweetness > 3 && acidity >= sweetness - 1) {
        return 'Sweet wine with balancing acidity';
      } else if (sweetness > 3 && acidity < sweetness - 1) {
        return 'Sweet wine lacking acidity';
      } else if (alcohol > 4 && acidity < 3) {
        return 'Hot and unbalanced';
      }
    }
    
    return 'Balanced wine';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-wine-100 dark:bg-wine-900 rounded-full">
          <Coffee className="w-5 h-5 text-wine-600 dark:text-wine-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Palate
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Systematic tasting analysis
          </p>
        </div>
      </div>

      {/* Tasting Parameters */}
      <div className="space-y-4">
        {getVisibleParameters().map((parameter) => (
          <div key={parameter.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {parameter.label}: {getScaleLabel(value[parameter.key], parameter.labels)}
              </label>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {value[parameter.key]}/5
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={value[parameter.key]}
                  onChange={(e) => updatePalate({ [parameter.key]: parseInt(e.target.value) })}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>{parameter.labels[0]}</span>
                <span>{parameter.labels[2]}</span>
                <span>{parameter.labels[4]}</span>
              </div>
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {parameter.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Balance Assessment */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Balance Assessment
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {getBalanceDescription()}
        </p>
      </div>

      {/* Flavor Characteristics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Flavor Characteristics
          </label>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {getSelectedFlavorsCount()} selected
          </span>
        </div>

        <div className="space-y-2">
          {/* Fruits */}
          {Object.entries(WINE_DESCRIPTORS.fruits).map(([fruitType, fruits]) => {
            const selectedCount = (value.flavorCharacteristics.fruits || []).filter(f => fruits.includes(f)).length;
            const isExpanded = expandedCategory === fruitType;

            return (
              <div key={fruitType} className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(fruitType)}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                      {fruitType.replace(/([A-Z])/g, ' $1').trim()}
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
                      {fruits.map((fruit) => (
                        <button
                          key={fruit}
                          onClick={() => toggleFlavor('fruits', fruit)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                            (value.flavorCharacteristics.fruits || []).includes(fruit)
                              ? 'bg-wine-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          )}
                        >
                          {fruit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Other Categories */}
          {(['spices', 'oak', 'earth', 'other'] as const).map((category) => {
            const categoryFlavors = WINE_DESCRIPTORS[category];
            const selectedCount = (value.flavorCharacteristics[category] || []).length;
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
                      {categoryFlavors.map((flavor) => (
                        <button
                          key={flavor}
                          onClick={() => toggleFlavor(category, flavor)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                            (value.flavorCharacteristics[category] || []).includes(flavor)
                              ? 'bg-wine-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          )}
                        >
                          {flavor}
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

      {/* Palate Summary */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Palate Summary
        </h4>
        <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            <span className="capitalize">{getScaleLabel(value.body, BODY_LABELS).toLowerCase()}</span>{' '}
            bodied wine with{' '}
            <span className="lowercase">{getScaleLabel(value.intensity, INTENSITY_LABELS)}</span>{' '}
            flavor intensity
          </p>
          <p>
            <span className="capitalize">{getScaleLabel(value.finish, FINISH_LABELS).toLowerCase()}</span>{' '}
            finish
          </p>
          <p className="font-medium">{getBalanceDescription()}</p>
          {getSelectedFlavorsCount() > 0 && (
            <p>{getSelectedFlavorsCount()} specific flavor descriptors selected</p>
          )}
        </div>
      </div>
    </div>
  );
}