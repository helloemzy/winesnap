'use client'

import React, { useState, useEffect } from 'react'
import { 
  Camera, 
  Mic, 
  Bell, 
  Smartphone, 
  Wine, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useUIStore } from '@/stores/ui-store'
import { 
  requestNotificationPermission, 
  subscribeToPushNotifications 
} from '@/lib/notifications/push-notifications'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action?: () => Promise<boolean>
  actionLabel?: string
  skipable?: boolean
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to WineSnap',
    description: 'Your personal wine tasting journal with WSET Level 3 methodology. Let\'s get you set up for the perfect wine experience.',
    icon: <Wine className="h-12 w-12 text-red-600" />
  },
  {
    id: 'camera',
    title: 'Camera Access',
    description: 'Allow camera access to capture wine bottle photos and automatically extract label information.',
    icon: <Camera className="h-12 w-12 text-blue-600" />,
    actionLabel: 'Enable Camera',
    skipable: true
  },
  {
    id: 'microphone',
    title: 'Voice Memos',
    description: 'Enable microphone access to record voice memos during tastings and convert them to structured notes.',
    icon: <Mic className="h-12 w-12 text-green-600" />,
    actionLabel: 'Enable Microphone',
    skipable: true
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Get notified about tasting reminders, wine recommendations, and activity from friends.',
    icon: <Bell className="h-12 w-12 text-purple-600" />,
    actionLabel: 'Enable Notifications',
    skipable: true
  },
  {
    id: 'install',
    title: 'Install the App',
    description: 'Install WineSnap on your home screen for the best experience. Works offline and loads instantly.',
    icon: <Smartphone className="h-12 w-12 text-orange-600" />,
    actionLabel: 'Install App',
    skipable: true
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'WineSnap is ready to help you document and improve your wine tasting journey. Start by creating your first tasting entry.',
    icon: <CheckCircle className="h-12 w-12 text-green-600" />
  }
]

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [stepResults, setStepResults] = useState<Record<string, boolean>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    requestCameraPermission,
    requestMicrophonePermission,
    cameraPermission,
    microphonePermission,
    isInstallable,
    triggerInstallPrompt,
    addToast
  } = useUIStore()

  useEffect(() => {
    // Check if onboarding should be shown
    const hasCompletedOnboarding = localStorage.getItem('winesnap-onboarding-completed')
    const isFirstVisit = !localStorage.getItem('winesnap-visited')
    
    if (!hasCompletedOnboarding && isFirstVisit) {
      localStorage.setItem('winesnap-visited', 'true')
      setIsOpen(true)
    }
  }, [])

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = async () => {
    if (isLastStep) {
      handleComplete()
      return
    }

    setCurrentStep(prev => prev + 1)
  }

  const handlePrevious = () => {
    if (isFirstStep) return
    setCurrentStep(prev => prev - 1)
  }

  const handleSkip = () => {
    if (isLastStep) {
      handleComplete()
      return
    }
    setCurrentStep(prev => prev + 1)
  }

  const handleComplete = () => {
    localStorage.setItem('winesnap-onboarding-completed', 'true')
    setIsOpen(false)
    onComplete()
    
    addToast({
      type: 'success',
      title: 'Welcome to WineSnap!',
      description: 'You\'re ready to start your wine tasting journey.'
    })
  }

  const handleAction = async () => {
    if (!step.action) return
    
    setIsProcessing(true)
    
    try {
      let success = false
      
      switch (step.id) {
        case 'camera':
          success = await requestCameraPermission()
          break
          
        case 'microphone':
          success = await requestMicrophonePermission()
          break
          
        case 'notifications':
          const permission = await requestNotificationPermission()
          if (permission === 'granted') {
            await subscribeToPushNotifications()
            success = true
          }
          break
          
        case 'install':
          if (isInstallable) {
            await triggerInstallPrompt()
            success = true
          }
          break
          
        default:
          success = await step.action()
      }
      
      setStepResults(prev => ({ ...prev, [step.id]: success }))
      
      if (success) {
        // Auto-advance on successful action
        setTimeout(() => {
          handleNext()
        }, 1500)
      }
    } catch (error) {
      console.error('Onboarding action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getActionStatus = () => {
    switch (step.id) {
      case 'camera':
        return cameraPermission === 'granted'
      case 'microphone':
        return microphonePermission === 'granted'
      case 'notifications':
        return Notification.permission === 'granted'
      case 'install':
        return !isInstallable // If not installable, it's already installed
      default:
        return stepResults[step.id] || false
    }
  }

  const isActionCompleted = getActionStatus()

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title=""
      className="max-w-md"
      showCloseButton={false}
    >
      <div className="relative">
        {/* Close button */}
        <button
          onClick={handleComplete}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
            <span>{Math.round(((currentStep + 1) / ONBOARDING_STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-600 to-red-700 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            {step.icon}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Action button */}
          {step.actionLabel && (
            <div className="space-y-3">
              <Button
                onClick={handleAction}
                disabled={isProcessing || isActionCompleted}
                className={`w-full ${
                  isActionCompleted 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                }`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : isActionCompleted ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : null}
                {isActionCompleted ? 'Enabled' : step.actionLabel}
              </Button>
              
              {step.skipable && !isActionCompleted && (
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </Button>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              disabled={isFirstStep}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-red-600'
                  : index < currentStep
                  ? 'bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}

// Quick start guide component
export function QuickStartGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const guides = [
    {
      title: 'Capture Wine Photos',
      description: 'Use the camera to capture wine labels and automatically extract information',
      icon: <Camera className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Record Voice Memos',
      description: 'Speak your tasting notes and we\'ll convert them to structured evaluations',
      icon: <Mic className="h-6 w-6 text-green-600" />
    },
    {
      title: 'WSET Methodology',
      description: 'Follow the systematic WSET Level 3 approach to wine evaluation',
      icon: <Wine className="h-6 w-6 text-red-600" />
    }
  ]

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="text-gray-600 hover:text-gray-800"
      >
        Quick Start Guide
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Quick Start Guide"
        className="max-w-lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Get started with WineSnap in just a few steps:
          </p>

          {guides.map((guide, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {guide.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {guide.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {guide.description}
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Got it!
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}