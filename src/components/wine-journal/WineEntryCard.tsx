'use client';

import React from 'react';
import { MapPin, Calendar, Star, Wine, Volume2, Camera } from 'lucide-react';
import { WineTastingEntry, QUALITY_LEVELS } from '@/types/wine-tasting';
import { cn } from '@/lib/utils';

interface WineEntryCardProps {
  entry: WineTastingEntry;
  onEdit?: (entry: WineTastingEntry) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  className?: string;
}

export function WineEntryCard({
  entry,
  onEdit,
  onDelete,
  compact = false,
  className
}: WineEntryCardProps) {
  const getQualityLabel = (quality: number) => {
    const level = QUALITY_LEVELS.find(l => l.value === quality);
    return level ? level.label : 'Acceptable';
  };

  const getColorClass = (colorType: string) => {
    const colorMap = {
      'white': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'rose': 'bg-pink-100 text-pink-800 border-pink-200',
      'red': 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[colorType as keyof typeof colorMap] || 'bg-neutral-100 text-neutral-800 border-neutral-200';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getTotalAromaDescriptors = () => {
    return Object.values(entry.nose.aromaCharacteristics).reduce(
      (total, aromas) => total + (aromas?.length || 0),
      0
    );
  };

  const getTotalFlavorDescriptors = () => {
    return Object.values(entry.palate.flavorCharacteristics).reduce(
      (total, flavors) => total + (flavors?.length || 0),
      0
    );
  };

  return (
    <div 
      className={cn(
        'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-glass hover:shadow-wine transition-all duration-300 overflow-hidden',
        !compact && 'hover:-translate-y-1',
        className
      )}
    >
      {/* Header with wine info */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={cn(
              'font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1',
              compact ? 'text-sm' : 'text-base'
            )}>
              {entry.wineName}
            </h3>
            
            {entry.producer && (
              <p className={cn(
                'text-neutral-600 dark:text-neutral-400 line-clamp-1',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {entry.producer}
                {entry.vintage && ` • ${entry.vintage}`}
                {entry.region && ` • ${entry.region}`}
              </p>
            )}

            {entry.grapeVarieties && entry.grapeVarieties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.grapeVarieties.slice(0, 3).map((grape, idx) => (
                  <span 
                    key={idx}
                    className={cn(
                      'px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full',
                      compact ? 'text-xs' : 'text-xs'
                    )}
                  >
                    {grape}
                  </span>
                ))}
                {entry.grapeVarieties.length > 3 && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    +{entry.grapeVarieties.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Wine type indicator */}
          <div className={cn(
            'px-2 py-1 rounded-lg text-xs font-medium border capitalize',
            getColorClass(entry.appearance.color.type)
          )}>
            {entry.appearance.color.type === 'rose' ? 'Rosé' : entry.appearance.color.type}
          </div>
        </div>
      </div>

      {/* Assessment summary */}
      <div className="p-4 space-y-3">
        {/* Quality and score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: entry.conclusions.quality }, (_, i) => (
                <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
              ))}
              {Array.from({ length: Math.max(0, 6 - entry.conclusions.quality) }, (_, i) => (
                <Star key={i} className="w-3 h-3 text-neutral-300 dark:text-neutral-600" />
              ))}
            </div>
            <span className={cn(
              'text-neutral-600 dark:text-neutral-400',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {getQualityLabel(entry.conclusions.quality)}
            </span>
          </div>

          {entry.conclusions.score && (
            <div className={cn(
              'font-bold text-gold-600 dark:text-gold-400',
              compact ? 'text-sm' : 'text-base'
            )}>
              {entry.conclusions.score}/100
            </div>
          )}
        </div>

        {/* Key characteristics */}
        {!compact && (
          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div>
              <span className="font-medium">Appearance:</span>
              <br />
              {entry.appearance.clarity} • {entry.appearance.color.primary}
            </div>
            <div>
              <span className="font-medium">Body:</span>
              <br />
              {entry.palate.body}/5 • {entry.palate.alcohol}/5 alcohol
            </div>
          </div>
        )}

        {/* Descriptors count */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{getTotalAromaDescriptors()} aroma descriptors</span>
          <span>{getTotalFlavorDescriptors()} flavor descriptors</span>
        </div>

        {/* Media indicators */}
        <div className="flex items-center gap-3">
          {entry.voiceNote && (
            <div className="flex items-center gap-1 text-xs text-wine-600 dark:text-wine-400">
              <Volume2 className="w-3 h-3" />
              <span>{entry.voiceNote.duration}s</span>
            </div>
          )}
          
          {entry.photos && entry.photos.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
              <Camera className="w-3 h-3" />
              <span>{entry.photos.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with metadata */}
      <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(entry.createdAt)}
            </div>
            
            {entry.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-20">{entry.location}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                className="p-1 text-neutral-400 hover:text-wine-600 dark:hover:text-wine-400 transition-colors duration-200"
                aria-label="Edit entry"
              >
                <Wine className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}