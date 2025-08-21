import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export function getScaleLabel(value: number, scale: string[]): string {
  return scale[Math.min(value - 1, scale.length - 1)] || scale[0]
}

export const INTENSITY_LABELS = ['Light', 'Medium-', 'Medium', 'Medium+', 'Pronounced']
export const SWEETNESS_LABELS = ['Bone Dry', 'Dry', 'Off-Dry', 'Medium Sweet', 'Sweet']
export const ACIDITY_LABELS = ['Low', 'Medium-', 'Medium', 'Medium+', 'High']
export const TANNIN_LABELS = ['Low', 'Medium-', 'Medium', 'Medium+', 'High']
export const ALCOHOL_LABELS = ['Low', 'Medium', 'Medium+', 'High', 'Very High']
export const BODY_LABELS = ['Light', 'Medium-', 'Medium', 'Medium+', 'Full']
export const FINISH_LABELS = ['Short', 'Medium-', 'Medium', 'Medium+', 'Long']

// Audio processing utilities
export function getAudioLevel(analyser: AnalyserNode): number {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)
  
  let sum = 0
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i]
  }
  return sum / bufferLength / 255 // Normalize to 0-1
}

export function generateWaveformData(audioData: number[], width: number): number[] {
  const samplesPerPixel = Math.ceil(audioData.length / width)
  const waveform: number[] = []
  
  for (let i = 0; i < width; i++) {
    const start = i * samplesPerPixel
    const end = Math.min(start + samplesPerPixel, audioData.length)
    let sum = 0
    
    for (let j = start; j < end; j++) {
      sum += Math.abs(audioData[j])
    }
    
    waveform.push(sum / (end - start))
  }
  
  return waveform
}

// Color utilities for wine assessment
export function getColorIntensity(colorName: string): number {
  const intensity = {
    'water white': 1, 'pale lemon': 2, 'lemon': 3, 'medium lemon': 4, 'deep lemon': 5,
    'pale gold': 3, 'medium gold': 4, 'deep gold': 5, 'amber': 6, 'brown': 7,
    'pale salmon': 2, 'salmon': 3, 'pale pink': 2, 'pink': 3, 'deep pink': 4,
    'pale orange': 3, 'orange': 4, 'deep orange': 5,
    'pale ruby': 2, 'ruby': 3, 'medium ruby': 4, 'deep ruby': 5,
    'pale garnet': 3, 'garnet': 4, 'deep garnet': 5, 'tawny': 6, 'brown': 7
  }
  return intensity[colorName as keyof typeof intensity] || 3
}