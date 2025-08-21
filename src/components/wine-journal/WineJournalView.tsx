'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { WineTastingEntry } from '@/types/wine-tasting';
import { WineEntryCard } from './WineEntryCard';
import { cn } from '@/lib/utils';

interface WineJournalViewProps {
  entries: WineTastingEntry[];
  onCreateNew?: () => void;
  onEditEntry?: (entry: WineTastingEntry) => void;
  onDeleteEntry?: (id: string) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'name' | 'quality' | 'score';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  search: string;
  wineType: 'all' | 'white' | 'rose' | 'red';
  qualityMin: number;
  qualityMax: number;
  hasVoiceNote: boolean | null;
  hasPhotos: boolean | null;
}

export function WineJournalView({
  entries,
  onCreateNew,
  onEditEntry,
  onDeleteEntry,
  className
}: WineJournalViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    wineType: 'all',
    qualityMin: 1,
    qualityMax: 6,
    hasVoiceNote: null,
    hasPhotos: null
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries.filter(entry => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          entry.wineName.toLowerCase().includes(searchLower) ||
          entry.producer?.toLowerCase().includes(searchLower) ||
          entry.region?.toLowerCase().includes(searchLower) ||
          entry.grapeVarieties?.some(grape => grape.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Wine type filter
      if (filters.wineType !== 'all' && entry.appearance.color.type !== filters.wineType) {
        return false;
      }

      // Quality filter
      if (entry.conclusions.quality < filters.qualityMin || entry.conclusions.quality > filters.qualityMax) {
        return false;
      }

      // Voice note filter
      if (filters.hasVoiceNote !== null) {
        const hasVoice = !!entry.voiceNote;
        if (hasVoice !== filters.hasVoiceNote) return false;
      }

      // Photos filter
      if (filters.hasPhotos !== null) {
        const hasPhotos = !!(entry.photos && entry.photos.length > 0);
        if (hasPhotos !== filters.hasPhotos) return false;
      }

      return true;
    });

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'name':
          comparison = a.wineName.localeCompare(b.wineName);
          break;
        case 'quality':
          comparison = a.conclusions.quality - b.conclusions.quality;
          break;
        case 'score':
          const scoreA = a.conclusions.score || 0;
          const scoreB = b.conclusions.score || 0;
          comparison = scoreA - scoreB;
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [entries, filters, sortBy, sortOrder]);

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      wineType: 'all',
      qualityMin: 1,
      qualityMax: 6,
      hasVoiceNote: null,
      hasPhotos: null
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Wine Journal
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {filteredAndSortedEntries.length} of {entries.length} entries
          </p>
        </div>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-wine-500 hover:bg-wine-600 text-white rounded-lg shadow-wine transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        )}
      </div>

      {/* Search and Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search wines, producers, regions, or grape varieties..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
          />
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                showFilters
                  ? 'bg-wine-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Quick wine type filters */}
            <div className="hidden sm:flex items-center gap-1">
              {(['all', 'white', 'rose', 'red'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => updateFilter('wineType', type)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 capitalize',
                    filters.wineType === type
                      ? 'bg-wine-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  {type === 'rose' ? 'Rosé' : type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Controls */}
            <div className="flex items-center gap-1">
              {(['date', 'name', 'quality', 'score'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => toggleSort(sort)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors duration-200 capitalize',
                    sortBy === sort
                      ? 'bg-wine-500 text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  )}
                >
                  {sort}
                  {sortBy === sort && (
                    sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1 rounded transition-colors duration-200',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-700 text-wine-600 dark:text-wine-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                )}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1 rounded transition-colors duration-200',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-wine-600 dark:text-wine-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quality Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Quality Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={filters.qualityMin}
                    onChange={(e) => updateFilter('qualityMin', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-8">
                    {filters.qualityMin}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={filters.qualityMax}
                    onChange={(e) => updateFilter('qualityMax', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-8">
                    {filters.qualityMax}
                  </span>
                </div>
              </div>

              {/* Media Filters */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Media
                </label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasVoiceNote === true}
                      onChange={(e) => updateFilter('hasVoiceNote', e.target.checked ? true : null)}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Has voice note
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasPhotos === true}
                      onChange={(e) => updateFilter('hasPhotos', e.target.checked ? true : null)}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                    />
                    Has photos
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={resetFilters}
                className="text-sm text-wine-600 dark:text-wine-400 hover:text-wine-700 dark:hover:text-wine-300"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entries Grid/List */}
      {filteredAndSortedEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-neutral-400 dark:text-neutral-500 mb-4">
            <Search className="w-12 h-12 mx-auto mb-2" />
            {entries.length === 0 ? (
              <p>No wine entries yet. Start by creating your first tasting note!</p>
            ) : (
              <p>No entries match your current filters.</p>
            )}
          </div>
          {onCreateNew && entries.length === 0 && (
            <button
              onClick={onCreateNew}
              className="px-6 py-2 bg-wine-500 hover:bg-wine-600 text-white rounded-lg shadow-wine transition-all duration-200"
            >
              Create First Entry
            </button>
          )}
        </div>
      ) : (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}>
          {filteredAndSortedEntries.map((entry) => (
            <WineEntryCard
              key={entry.id}
              entry={entry}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}
    </div>
  );
}