'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Camera, 
  Mic, 
  MicOff, 
  Eye, 
  Nose, 
  Zap, 
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { useUIStore } from '@/stores/ui-store'

interface MobileTastingStep {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  component: React.ComponentType<any>
}

const TASTING_STEPS: MobileTastingStep[] = [
  {
    id: 'photo',
    title: 'Wine Photo',
    icon: <Camera className="h-6 w-6" />,
    description: 'Capture wine bottle and label',
    component: WinePhotoStep
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: <Eye className="h-6 w-6" />,
    description: 'Visual assessment',
    component: AppearanceStep
  },
  {
    id: 'nose',
    title: 'Nose',
    icon: <Nose className="h-6 w-6" />,
    description: 'Aroma evaluation',
    component: NoseStep
  },
  {
    id: 'palate',
    title: 'Palate',
    icon: <Zap className="h-6 w-6" />,
    description: 'Taste analysis',
    component: PalateStep
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    icon: <Star className="h-6 w-6" />,
    description: 'Quality assessment',
    component: ConclusionStep
  }
]

interface MobileTastingInterfaceProps {
  onComplete: (data: any) => void
  onCancel: () => void
}

export function MobileTastingInterface({ onComplete, onCancel }: MobileTastingInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tastingData, setTastingData] = useState<Record<string, any>>({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { addToast } = useUIStore()
  
  const currentStepData = TASTING_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === TASTING_STEPS.length - 1

  // Haptic feedback helper
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [25],
        medium: [50],
        heavy: [100]
      }
      navigator.vibrate(patterns[type])
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
      return
    }

    triggerHaptic('light')
    setIsTransitioning(true)
    
    setTimeout(() => {
      setCurrentStep(prev => prev + 1)
      setIsTransitioning(false)
    }, 150)
  }

  const handlePrevious = () => {
    if (isFirstStep) return

    triggerHaptic('light')
    setIsTransitioning(true)
    
    setTimeout(() => {
      setCurrentStep(prev => prev - 1)
      setIsTransitioning(false)
    }, 150)
  }

  const handleStepData = (stepId: string, data: any) => {
    setTastingData(prev => ({
      ...prev,
      [stepId]: data
    }))
    triggerHaptic('medium')
  }

  const handleComplete = () => {
    triggerHaptic('heavy')
    onComplete(tastingData)
    
    addToast({
      type: 'success',
      title: 'Tasting Complete!',
      description: 'Your wine evaluation has been saved.'
    })
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex === currentStep) return
    
    triggerHaptic('light')
    setIsTransitioning(true)
    
    setTimeout(() => {
      setCurrentStep(stepIndex)
      setIsTransitioning(false)
    }, 150)
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Wine Tasting</h1>
              <p className="text-sm text-red-100">
                Step {currentStep + 1} of {TASTING_STEPS.length}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">{currentStepData.title}</div>
            <div className="text-xs text-red-100">{currentStepData.description}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-red-800">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / TASTING_STEPS.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Step navigator */}
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto scrollbar-none">
          {TASTING_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 min-w-20 transition-colors ${
                index === currentStep
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : index < currentStep
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <div className={`p-1 rounded-full ${
                index === currentStep ? 'bg-red-600 text-white' :
                index < currentStep ? 'bg-green-600 text-white' :
                'bg-gray-200 dark:bg-gray-600'
              }`}>
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden transition-opacity duration-150 ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="h-full overflow-y-auto">
          <StepWrapper
            step={currentStepData}
            data={tastingData[currentStepData.id]}
            onUpdate={(data) => handleStepData(currentStepData.id, data)}
          />
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={isFirstStep}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step wrapper component
function StepWrapper({ 
  step, 
  data, 
  onUpdate 
}: {
  step: MobileTastingStep
  data?: any
  onUpdate: (data: any) => void
}) {
  const Component = step.component
  
  return (
    <div className="p-4">
      <Component data={data} onUpdate={onUpdate} />
    </div>
  )
}

// Individual step components
function WinePhotoStep({ data, onUpdate }: { data?: any, onUpdate: (data: any) => void }) {
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(data?.image || null)

  const handleCapture = (imageData: any) => {
    setCapturedImage(URL.createObjectURL(imageData.file))
    onUpdate({
      image: imageData.file,
      thumbnail: imageData.thumbnail,
      metadata: imageData.metadata
    })
    setShowCamera(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Capture Wine Photo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Take a photo of the wine bottle and label
        </p>
      </div>

      {capturedImage ? (
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={capturedImage}
              alt="Wine bottle"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCamera(true)}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No photo captured yet
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCamera(true)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Open Camera
          </Button>
        </div>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
          maxWidth={1080}
          maxHeight={1440}
          quality={0.9}
        />
      )}
    </div>
  )
}

function AppearanceStep({ data, onUpdate }: { data?: any, onUpdate: (data: any) => void }) {
  const [appearance, setAppearance] = useState(data || {})
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceNote = (transcript: string) => {
    const newData = { ...appearance, voiceNote: transcript }
    setAppearance(newData)
    onUpdate(newData)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Appearance Assessment
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Evaluate the wine's visual characteristics
        </p>
      </div>

      <div className="space-y-4">
        <AppearanceSelector
          label="Intensity"
          options={['Pale', 'Medium(-)', 'Medium', 'Medium(+)', 'Deep']}
          value={appearance.intensity}
          onChange={(value) => {
            const newData = { ...appearance, intensity: value }
            setAppearance(newData)
            onUpdate(newData)
          }}
        />

        <AppearanceSelector
          label="Color"
          options={['Lemon-green', 'Lemon', 'Gold', 'Amber', 'Brown']}
          value={appearance.color}
          onChange={(value) => {
            const newData = { ...appearance, color: value }
            setAppearance(newData)
            onUpdate(newData)
          }}
        />

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="font-medium text-gray-900 dark:text-white">
              Voice Notes
            </label>
            <Button
              onClick={() => setIsRecording(!isRecording)}
              size="sm"
              variant={isRecording ? "destructive" : "outline"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          
          {isRecording && (
            <VoiceRecorder
              onTranscript={handleVoiceNote}
              onStop={() => setIsRecording(false)}
            />
          )}
          
          {appearance.voiceNote && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {appearance.voiceNote}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function NoseStep({ data, onUpdate }: { data?: any, onUpdate: (data: any) => void }) {
  // Similar structure to AppearanceStep but for nose evaluation
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Nose Evaluation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Assess the wine's aroma characteristics
        </p>
      </div>
      {/* Implementation similar to AppearanceStep */}
    </div>
  )
}

function PalateStep({ data, onUpdate }: { data?: any, onUpdate: (data: any) => void }) {
  // Similar structure for palate analysis
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Palate Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Evaluate taste, texture, and finish
        </p>
      </div>
      {/* Implementation similar to AppearanceStep */}
    </div>
  )
}

function ConclusionStep({ data, onUpdate }: { data?: any, onUpdate: (data: any) => void }) {
  // Quality assessment and overall conclusion
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Quality Assessment
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Overall quality and conclusion
        </p>
      </div>
      {/* Implementation for quality rating and conclusions */}
    </div>
  )
}

// Helper component for appearance selectors
function AppearanceSelector({ 
  label, 
  options, 
  value, 
  onChange 
}: {
  label: string
  options: string[]
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`p-3 text-sm rounded-lg border transition-colors ${
              value === option
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}