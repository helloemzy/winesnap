'use client';

import React, { useState } from 'react';
import { Wine, ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react';
import { WineTastingEntry, WineAppearance, WineNose, WinePalate, WineConclusions } from '@/types/wine-tasting';
import { AppearanceAssessment } from './wine-tasting/AppearanceAssessment';
import { NoseEvaluation } from './wine-tasting/NoseEvaluation';
import { PalateAnalysis } from './wine-tasting/PalateAnalysis';
import { QualityConclusions } from './wine-tasting/QualityConclusions';
import { VoiceRecording } from './VoiceRecording';
import { cn } from '@/lib/utils';

interface WineTastingFormProps {
  initialEntry?: Partial<WineTastingEntry>;
  onSave?: (entry: WineTastingEntry) => void;
  onCancel?: () => void;
  className?: string;
}

type TastingStep = 'basic' | 'appearance' | 'nose' | 'palate' | 'conclusions' | 'voice';

const STEPS: { key: TastingStep; label: string; description: string }[] = [
  { key: 'basic', label: 'Wine Info', description: 'Basic wine information' },
  { key: 'appearance', label: 'Appearance', description: 'Visual assessment' },
  { key: 'nose', label: 'Nose', description: 'Aromatic evaluation' },
  { key: 'palate', label: 'Palate', description: 'Taste analysis' },
  { key: 'conclusions', label: 'Conclusions', description: 'Quality & recommendations' },
  { key: 'voice', label: 'Voice Note', description: 'Record your thoughts' }
];

const getDefaultAppearance = (): WineAppearance => ({
  clarity: 'clear',
  intensity: 3,
  color: {
    type: 'red',
    primary: 'ruby'
  }
});

const getDefaultNose = (): WineNose => ({
  condition: { clean: true },
  intensity: 3,
  aromaDevelopment: 'primary',
  aromaCharacteristics: {}
});

const getDefaultPalate = (): WinePalate => ({
  sweetness: 1,
  acidity: 3,
  tannin: 3,
  alcohol: 3,
  body: 3,
  intensity: 3,
  finish: 3,
  flavorCharacteristics: {}
});

const getDefaultConclusions = (): WineConclusions => ({
  quality: 4,
  readiness: 'drink-now',
  agingPotential: 5,
  temperature: 16
});

export function WineTastingForm({
  initialEntry,
  onSave,
  onCancel,
  className
}: WineTastingFormProps) {
  const [currentStep, setCurrentStep] = useState<TastingStep>('basic');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    wineName: initialEntry?.wineName || '',
    producer: initialEntry?.producer || '',
    vintage: initialEntry?.vintage,
    region: initialEntry?.region || '',
    grapeVarieties: initialEntry?.grapeVarieties || [],
    location: initialEntry?.location || '',
    occasion: initialEntry?.occasion || '',
    appearance: initialEntry?.appearance || getDefaultAppearance(),
    nose: initialEntry?.nose || getDefaultNose(),
    palate: initialEntry?.palate || getDefaultPalate(),
    conclusions: initialEntry?.conclusions || getDefaultConclusions(),
    voiceNote: initialEntry?.voiceNote
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const getCurrentStepIndex = () => STEPS.findIndex(step => step.key === currentStep);
  const isFirstStep = getCurrentStepIndex() === 0;
  const isLastStep = getCurrentStepIndex() === STEPS.length - 1;

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

  const handleSave = async () => {
    if (!formData.wineName.trim()) {
      alert('Please enter a wine name');
      setCurrentStep('basic');
      return;
    }

    setIsSaving(true);
    
    try {
      const entry: WineTastingEntry = {
        id: initialEntry?.id || crypto.randomUUID(),
        wineName: formData.wineName,
        producer: formData.producer || undefined,
        vintage: formData.vintage,
        region: formData.region || undefined,
        grapeVarieties: formData.grapeVarieties.length > 0 ? formData.grapeVarieties : undefined,
        appearance: formData.appearance,
        nose: formData.nose,
        palate: formData.palate,
        conclusions: formData.conclusions,
        voiceNote: formData.voiceNote,
        location: formData.location || undefined,
        occasion: formData.occasion || undefined,
        createdAt: initialEntry?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await onSave?.(entry);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceRecordingComplete = (audioUrl: string) => {
    // In a real app, you'd upload this and get the URL back
    updateFormData({
      voiceNote: {
        recordingUrl: audioUrl,
        duration: 30 // This would come from the actual recording
      }
    });
  };

  const addGrapeVariety = (variety: string) => {
    if (variety && !formData.grapeVarieties.includes(variety)) {
      updateFormData({
        grapeVarieties: [...formData.grapeVarieties, variety]
      });
    }
  };

  const removeGrapeVariety = (variety: string) => {
    updateFormData({
      grapeVarieties: formData.grapeVarieties.filter(v => v !== variety)
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Wine className="w-12 h-12 text-wine-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Wine Information
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Enter the basic details about the wine you're tasting
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Wine Name *
                </label>
                <input
                  type="text"
                  value={formData.wineName}
                  onChange={(e) => updateFormData({ wineName: e.target.value })}
                  placeholder="e.g., Château Margaux 2010"
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Producer
                  </label>
                  <input
                    type="text"
                    value={formData.producer}
                    onChange={(e) => updateFormData({ producer: e.target.value })}
                    placeholder="e.g., Château Margaux"
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Vintage
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.vintage || ''}
                    onChange={(e) => updateFormData({ vintage: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="e.g., 2020"
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => updateFormData({ region: e.target.value })}
                  placeholder="e.g., Bordeaux, France"
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Grape Varieties
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.grapeVarieties.map((variety) => (
                      <span
                        key={variety}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-wine-100 text-wine-800 rounded-full text-sm"
                      >
                        {variety}
                        <button
                          onClick={() => removeGrapeVariety(variety)}
                          className="text-wine-600 hover:text-wine-800 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add grape variety (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value) {
                          addGrapeVariety(value);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                    placeholder="Where are you tasting this wine?"
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => updateFormData({ occasion: e.target.value })}
                    placeholder="What's the occasion?"
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <AppearanceAssessment
            value={formData.appearance}
            onChange={(appearance) => updateFormData({ appearance })}
          />
        );

      case 'nose':
        return (
          <NoseEvaluation
            value={formData.nose}
            onChange={(nose) => updateFormData({ nose })}
          />
        );

      case 'palate':
        return (
          <PalateAnalysis
            value={formData.palate}
            onChange={(palate) => updateFormData({ palate })}
            wineType={formData.appearance.color.type}
          />
        );

      case 'conclusions':
        return (
          <QualityConclusions
            value={formData.conclusions}
            onChange={(conclusions) => updateFormData({ conclusions })}
          />
        );

      case 'voice':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-wine-100 dark:bg-wine-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wine className="w-6 h-6 text-wine-600 dark:text-wine-400" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Voice Note
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Record a 30-second voice note with your personal thoughts about this wine
              </p>
            </div>

            <VoiceRecording
              onRecordingComplete={handleVoiceRecordingComplete}
              onRecordingClear={() => updateFormData({ voiceNote: undefined })}
            />

            {formData.voiceNote && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Voice note recorded successfully! ({formData.voiceNote.duration} seconds)
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {STEPS.map((step, index) => (
              <button
                key={step.key}
                onClick={() => setCurrentStep(step.key)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  currentStep === step.key
                    ? 'bg-wine-500 text-white shadow-wine'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                  currentStep === step.key
                    ? 'bg-white text-wine-500'
                    : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300'
                )}>
                  {index + 1}
                </span>
                <span className="hidden sm:block">{step.label}</span>
              </button>
            ))}
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
          <div
            className="bg-wine-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((getCurrentStepIndex() + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-glass border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
            isFirstStep
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {!isLastStep ? (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 px-6 py-3 bg-wine-500 hover:bg-wine-600 text-white rounded-lg font-medium shadow-wine transition-all duration-200 active:scale-95"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 active:scale-95',
                isSaving
                  ? 'bg-neutral-400 text-neutral-200 cursor-not-allowed'
                  : 'bg-gold-500 hover:bg-gold-600 text-white shadow-gold'
              )}
            >
              {isSaving ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Entry'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}