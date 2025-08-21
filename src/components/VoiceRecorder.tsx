'use client'

// Voice recording component with WSET processing

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Square, Play, Pause, Upload, Loader2, AlertTriangle } from 'lucide-react'
import { voiceProcessor } from '@/lib/voice/voice-processor'
import { useVoiceProcessing } from '@/lib/api/voice-api'
import { wineApi, type CreateWineFromVoiceRequest } from '@/lib/api/wine-api'
import { fileUploader, UPLOAD_CONFIGS } from '@/lib/storage/file-upload'
import { costManager, useCostTracking } from '@/lib/optimization/cost-manager'
import { supabase } from '@/lib/supabase'
import type { WSETTastingNote } from '@/types/wset'

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'record' | 'process' | 'review' | 'save'>('record')
  const [wineData, setWineData] = useState<{
    basicInfo: any
    wsetNote: WSETTastingNote | null
    transcript: string
  }>({
    basicInfo: {},
    wsetNote: null,
    transcript: ''
  })

  const audioRef = useRef<HTMLAudioElement>(null)
  const { processVoice, isProcessing, error: processingError, result } = useVoiceProcessing()
  
  // Get current user for cost tracking
  const [userId, setUserId] = useState<string | null>(null)
  const { usage, warnings, checkLimits } = useCostTracking(userId)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  const startRecording = async () => {
    try {
      // Check cost limits before starting
      if (userId) {
        const limitCheck = await checkLimits()
        if (!limitCheck.allowed) {
          alert(`Cannot record: ${limitCheck.reason}`)
          return
        }
      }

      await voiceProcessor.startRecording()
      setIsRecording(true)
      setRecordedAudio(null)
      setAudioUrl(null)
      setCurrentStep('record')
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = async () => {
    try {
      const audioBlob = await voiceProcessor.stopRecording()
      setIsRecording(false)
      setRecordedAudio(audioBlob)
      
      // Create audio URL for playback
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
    } catch (error) {
      console.error('Failed to stop recording:', error)
      alert('Failed to stop recording.')
    }
  }

  const processRecording = async () => {
    if (!recordedAudio) return

    try {
      setCurrentStep('process')
      
      const response = await processVoice({
        audioBlob: recordedAudio,
        useCache: true
      })

      setWineData({
        basicInfo: {},
        wsetNote: response.wsetMapping,
        transcript: response.transcript
      })
      
      setCurrentStep('review')
    } catch (error) {
      console.error('Processing failed:', error)
      alert('Voice processing failed. Please try again.')
      setCurrentStep('record')
    }
  }

  const saveWineEntry = async () => {
    if (!wineData.wsetNote || !userId) return

    try {
      setCurrentStep('save')

      // Upload audio file
      let audioUploadUrl: string | undefined
      if (recordedAudio) {
        const uploadResult = await fileUploader.uploadFile(recordedAudio, UPLOAD_CONFIGS.VOICE_RECORDING)
        audioUploadUrl = uploadResult.url
      }

      // Create wine entry
      const createRequest: CreateWineFromVoiceRequest = {
        wineBasicInfo: {
          wine_name: wineData.basicInfo.wine_name || 'Untitled Wine',
          producer: wineData.basicInfo.producer,
          vintage: wineData.basicInfo.vintage,
          region: wineData.basicInfo.region,
          country: wineData.basicInfo.country,
        },
        wsetTastingNote: wineData.wsetNote,
        voiceData: {
          audio_url: audioUploadUrl,
          voice_transcript: wineData.transcript,
          processing_confidence: result?.confidence
        },
        metadata: {
          is_public: true,
          tasting_date: new Date().toISOString().split('T')[0]
        }
      }

      const createdWine = await wineApi.createWineFromVoice(createRequest)
      
      alert('Wine entry saved successfully!')
      resetRecorder()
    } catch (error) {
      console.error('Failed to save wine entry:', error)
      alert('Failed to save wine entry. Please try again.')
      setCurrentStep('review')
    }
  }

  const resetRecorder = () => {
    setIsRecording(false)
    setRecordedAudio(null)
    setAudioUrl(null)
    setCurrentStep('record')
    setWineData({
      basicInfo: {},
      wsetNote: null,
      transcript: ''
    })
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
  }

  const updateWineBasicInfo = (field: string, value: any) => {
    setWineData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }))
  }

  const formatWSETValue = (value: string | undefined): string => {
    if (!value) return 'Not specified'
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  const renderRecordingInterface = () => (
    <div className="text-center space-y-6">
      <div className="text-gray-600">
        <p className="text-lg mb-2">Record your wine tasting notes</p>
        <p className="text-sm">Speak for up to 30 seconds about the wine's appearance, nose, palate, and overall quality</p>
      </div>

      {/* Cost warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center text-amber-700 mb-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium">Usage Warning</span>
          </div>
          {warnings.map((warning, index) => (
            <p key={index} className="text-sm text-amber-600">{warning}</p>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 transition-colors"
            disabled={isProcessing}
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-6 transition-colors animate-pulse"
          >
            <Square className="w-8 h-8" />
          </button>
        )}
      </div>

      {isRecording && (
        <p className="text-red-500 font-medium">Recording... Click to stop</p>
      )}

      {recordedAudio && !isRecording && (
        <div className="space-y-4">
          <audio ref={audioRef} controls className="w-full">
            <source src={audioUrl || undefined} type={recordedAudio.type} />
          </audio>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={processRecording}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Process Recording
                </>
              )}
            </button>
            
            <button
              onClick={resetRecorder}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Start Over
            </button>
          </div>

          {usage && (
            <div className="text-sm text-gray-500">
              Estimated cost: ${costManager.estimateProcessingCost(recordedAudio).totalCost.toFixed(3)}
              <br />
              Monthly usage: ${usage.current_month_cost.toFixed(2)} / ${costManager.getCostLimits().monthly_limit}
            </div>
          )}
        </div>
      )}

      {processingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Processing Error</p>
          <p className="text-red-600 text-sm">{processingError.error}</p>
        </div>
      )}
    </div>
  )

  const renderReviewInterface = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Your Tasting Notes</h3>
        <p className="text-sm text-gray-600">Edit the information before saving</p>
      </div>

      {/* Basic Wine Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Basic Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wine Name *</label>
            <input
              type="text"
              value={wineData.basicInfo.wine_name || ''}
              onChange={(e) => updateWineBasicInfo('wine_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter wine name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producer</label>
            <input
              type="text"
              value={wineData.basicInfo.producer || ''}
              onChange={(e) => updateWineBasicInfo('producer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Producer/Winery"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vintage</label>
            <input
              type="number"
              value={wineData.basicInfo.vintage || ''}
              onChange={(e) => updateWineBasicInfo('vintage', parseInt(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Year"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              type="text"
              value={wineData.basicInfo.region || ''}
              onChange={(e) => updateWineBasicInfo('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Wine region"
            />
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Voice Transcript</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{wineData.transcript}</p>
        </div>
      </div>

      {/* WSET Tasting Notes */}
      {wineData.wsetNote && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">WSET Level 3 Analysis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Appearance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Appearance</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Intensity:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.appearance?.intensity)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Color:</span>
                  <span className="ml-2">{wineData.wsetNote.appearance?.color || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Clarity:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.appearance?.clarity)}</span>
                </div>
              </div>
            </div>

            {/* Nose */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Nose</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Condition:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.nose?.condition)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Intensity:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.nose?.intensity)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Development:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.nose?.development)}</span>
                </div>
                {wineData.wsetNote.nose?.aromaCharacteristics && wineData.wsetNote.nose.aromaCharacteristics.length > 0 && (
                  <div>
                    <span className="text-gray-600">Aromas:</span>
                    <div className="ml-2 flex flex-wrap gap-1 mt-1">
                      {wineData.wsetNote.nose.aromaCharacteristics.map((aroma, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {aroma}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Palate */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Palate</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Sweetness:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.palate?.sweetness)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Acidity:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.palate?.acidity)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tannin:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.palate?.tannin)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Body:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.palate?.body)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Finish:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.palate?.finish)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conclusions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Conclusions</h5>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Quality Assessment:</span>
                <span className="ml-2 font-medium">{formatWSETValue(wineData.wsetNote.conclusions.qualityAssessment)}</span>
              </div>
              {wineData.wsetNote.conclusions.readinessForDrinking && (
                <div>
                  <span className="text-gray-600">Readiness:</span>
                  <span className="ml-2">{formatWSETValue(wineData.wsetNote.conclusions.readinessForDrinking)}</span>
                </div>
              )}
              {wineData.wsetNote.conclusions.agingPotential && (
                <div>
                  <span className="text-gray-600">Aging Potential:</span>
                  <span className="ml-2">{wineData.wsetNote.conclusions.agingPotential}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4 pt-6">
        <button
          onClick={saveWineEntry}
          disabled={currentStep === 'save' || !wineData.basicInfo.wine_name}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
        >
          {currentStep === 'save' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Wine Entry'
          )}
        </button>
        
        <button
          onClick={resetRecorder}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Wine Tasting Journal</h2>
          <p className="text-gray-600">Record your wine tasting notes and automatically convert them to WSET Level 3 format</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 'record' ? 'text-blue-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'record' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Record</span>
            </div>
            <div className="w-8 border-t border-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'process' ? 'text-blue-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'process' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Process</span>
            </div>
            <div className="w-8 border-t border-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'review' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {(currentStep === 'record' || currentStep === 'process') && renderRecordingInterface()}
        {currentStep === 'review' && renderReviewInterface()}
      </div>
    </div>
  )
}