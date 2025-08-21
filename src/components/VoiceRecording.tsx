'use client';

import React, { useMemo } from 'react';
import { Mic, MicOff, Pause, Play, Square, RotateCcw, Volume2 } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { cn } from '@/lib/utils';

interface VoiceRecordingProps {
  onRecordingComplete?: (audioUrl: string) => void;
  onRecordingClear?: () => void;
  className?: string;
  compact?: boolean;
}

export function VoiceRecording({
  onRecordingComplete,
  onRecordingClear,
  className,
  compact = false
}: VoiceRecordingProps) {
  const {
    isRecording,
    isPaused,
    timeRemaining,
    timeRemainingFormatted,
    audioLevel,
    recordingUrl,
    error,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    duration
  } = useVoiceRecording();

  // Generate waveform visualization based on audio level
  const waveformBars = useMemo(() => {
    const barCount = compact ? 20 : 40;
    return Array.from({ length: barCount }, (_, i) => {
      const baseHeight = 4;
      const maxHeight = compact ? 24 : 32;
      const height = baseHeight + (audioLevel * maxHeight * Math.random());
      return Math.max(baseHeight, Math.min(maxHeight, height));
    });
  }, [audioLevel, compact]);

  React.useEffect(() => {
    if (recordingUrl && onRecordingComplete) {
      onRecordingComplete(recordingUrl);
    }
  }, [recordingUrl, onRecordingComplete]);

  const handleClear = () => {
    clearRecording();
    onRecordingClear?.();
  };

  if (!isSupported) {
    return (
      <div className={cn(
        'flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg',
        className
      )}>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Voice recording not supported in this browser
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800',
        className
      )}>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-900 rounded-xl shadow-glass border border-neutral-200 dark:border-neutral-700 overflow-hidden',
      compact ? 'p-3' : 'p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center justify-center rounded-full',
            compact ? 'w-6 h-6' : 'w-8 h-8',
            isRecording 
              ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          )}>
            {isRecording ? (
              <Mic className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            ) : (
              <MicOff className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            )}
          </div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Voice Note'}
          </div>
        </div>

        {/* Time display */}
        <div className={cn(
          'font-mono font-semibold',
          compact ? 'text-sm' : 'text-base',
          isRecording && timeRemaining <= 5 
            ? 'text-red-500 animate-pulse' 
            : 'text-neutral-700 dark:text-neutral-300'
        )}>
          {isRecording ? timeRemainingFormatted : recordingUrl ? `0:${duration.toString().padStart(2, '0')}` : '0:30'}
        </div>
      </div>

      {/* Waveform visualization */}
      {!compact && (
        <div className="mb-4 h-12 flex items-end justify-center gap-1 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className={cn(
                'w-1 rounded-full transition-all duration-75',
                isRecording && !isPaused
                  ? 'bg-red-400'
                  : recordingUrl
                  ? 'bg-wine-500'
                  : 'bg-neutral-300 dark:bg-neutral-600'
              )}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      )}

      {/* Compact waveform */}
      {compact && (isRecording || recordingUrl) && (
        <div className="mb-2 h-6 flex items-end justify-center gap-0.5">
          {waveformBars.slice(0, 20).map((height, i) => (
            <div
              key={i}
              className={cn(
                'w-0.5 rounded-full transition-all duration-75',
                isRecording && !isPaused
                  ? 'bg-red-400'
                  : recordingUrl
                  ? 'bg-wine-500'
                  : 'bg-neutral-300 dark:bg-neutral-600'
              )}
              style={{ height: `${Math.min(height, 16)}px` }}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
          <div
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              isRecording 
                ? 'bg-red-500'
                : recordingUrl 
                ? 'bg-wine-500'
                : 'bg-neutral-400'
            )}
            style={{
              width: recordingUrl 
                ? '100%' 
                : `${((30 - timeRemaining) / 30) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {!isRecording && !recordingUrl && (
          <button
            onClick={startRecording}
            className={cn(
              'flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 active:scale-95',
              compact ? 'w-10 h-10' : 'w-12 h-12'
            )}
            aria-label="Start recording"
          >
            <Mic className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2">
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className={cn(
                'flex items-center justify-center rounded-full bg-neutral-600 hover:bg-neutral-700 text-white shadow-lg transition-all duration-200 active:scale-95',
                compact ? 'w-8 h-8' : 'w-10 h-10'
              )}
              aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              {isPaused ? (
                <Play className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              ) : (
                <Pause className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              )}
            </button>

            <button
              onClick={stopRecording}
              className={cn(
                'flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 active:scale-95',
                compact ? 'w-8 h-8' : 'w-10 h-10'
              )}
              aria-label="Stop recording"
            >
              <Square className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            </button>
          </div>
        )}

        {recordingUrl && (
          <div className="flex items-center gap-2">
            <audio
              controls
              src={recordingUrl}
              className="h-8 max-w-32"
              preload="metadata"
            />
            
            <button
              onClick={handleClear}
              className={cn(
                'flex items-center justify-center rounded-full bg-neutral-500 hover:bg-neutral-600 text-white shadow-lg transition-all duration-200 active:scale-95',
                compact ? 'w-6 h-6' : 'w-8 h-8'
              )}
              aria-label="Clear recording"
            >
              <RotateCcw className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!compact && !isRecording && !recordingUrl && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-3">
          Tap to record a 30-second voice note about this wine
        </p>
      )}
    </div>
  );
}