'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, Mic, MicOff, RotateCcw, Check, Sparkles, X, Wine, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// WSET Tasting Notes Quick Buttons
const WSET_CATEGORIES = {
  appearance: {
    title: 'Appearance',
    options: ['Clear', 'Hazy', 'Pale', 'Medium', 'Deep', 'Ruby', 'Garnet', 'Purple', 'Brick', 'Brown']
  },
  nose: {
    title: 'Nose',
    options: ['Floral', 'Fruity', 'Herbal', 'Spicy', 'Oaky', 'Earthy', 'Mineral', 'Clean', 'Complex']
  },
  palate: {
    title: 'Palate', 
    options: ['Dry', 'Sweet', 'Light', 'Medium', 'Full', 'Smooth', 'Tannic', 'Acidic', 'Balanced']
  },
  finish: {
    title: 'Finish',
    options: ['Short', 'Medium', 'Long', 'Smooth', 'Warm', 'Spicy', 'Clean', 'Complex']
  },
  quality: {
    title: 'Quality',
    options: ['Good', 'Very Good', 'Outstanding', 'Exceptional']
  }
}

// Pokédex-style capture success animation
const CaptureSuccessAnimation = ({ wine, onComplete }: { wine: any, onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl animate-in zoom-in duration-300">
        {/* Pokeball-style animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
            <Wine className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wine Captured!</h2>
        <h3 className="text-xl text-purple-600 font-semibold mb-4">{wine.name}</h3>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Region:</span>
              <p className="font-semibold">{wine.region}</p>
            </div>
            <div>
              <span className="text-gray-600">Year:</span>
              <p className="font-semibold">{wine.year}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Producer:</span>
              <p className="font-semibold">{wine.producer}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onComplete}
          >
            Capture Another
          </Button>
          <Link href="/collection" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              View Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CapturePage() {
  const [captureMode, setCaptureMode] = useState<'camera' | 'tasting'>('camera')
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedWine, setCapturedWine] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<Record<string, string[]>>({})
  const [voiceNote, setVoiceNote] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }, [])

  useEffect(() => {
    if (captureMode === 'camera') {
      startCamera()
    }
    return () => {
      // Clean up camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [captureMode, startCamera])

  const capturePhoto = async () => {
    setIsCapturing(true)
    
    // Simulate AI processing time
    setTimeout(() => {
      // Mock wine detection result
      const mockWine = {
        name: "Château Margaux 2015",
        region: "Bordeaux, France", 
        year: "2015",
        producer: "Château Margaux",
        type: "Red Wine",
        confidence: 0.94
      }
      
      setCapturedWine(mockWine)
      setCaptureMode('tasting')
      setIsCapturing(false)
    }, 2000)
  }

  const toggleWSETNote = (category: string, note: string) => {
    setSelectedNotes(prev => ({
      ...prev,
      [category]: prev[category]?.includes(note) 
        ? prev[category].filter(n => n !== note)
        : [...(prev[category] || []), note]
    }))
  }

  const startVoiceRecording = () => {
    setIsRecording(true)
    // TODO: Implement actual voice recording
    setTimeout(() => {
      setIsRecording(false)
      setVoiceNote("This wine has a beautiful ruby color with notes of blackcurrant and oak...")
    }, 3000)
  }

  const saveWineCard = () => {
    setShowSuccess(true)
  }

  const resetCapture = () => {
    setCapturedWine(null)
    setSelectedNotes({})
    setVoiceNote('')
    setCaptureMode('camera')
    setShowSuccess(false)
    startCamera()
  }

  if (showSuccess && capturedWine) {
    return <CaptureSuccessAnimation wine={capturedWine} onComplete={resetCapture} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {captureMode === 'camera' ? '📸 Capture Wine' : '📝 Tasting Notes'}
          </h1>
          {capturedWine && (
            <Button variant="ghost" size="sm" onClick={resetCapture}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Camera Mode */}
        {captureMode === 'camera' && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-black aspect-[4/3] rounded-t-xl overflow-hidden">
                {isCapturing ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg font-semibold">Analyzing Wine Label...</p>
                      <p className="text-sm opacity-80">AI is extracting wine information</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-4 border-white/30 border-dashed m-8 rounded-xl flex items-center justify-center">
                      <div className="text-center text-white bg-black/50 rounded-xl p-4 backdrop-blur-sm">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-semibold">Position wine label in frame</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-6">
                <Button 
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg py-6 rounded-xl"
                >
                  {isCapturing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 mr-2" />
                      Capture Wine Label
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasting Notes Mode */}
        {captureMode === 'tasting' && capturedWine && (
          <>
            {/* Wine Info Card */}
            <Card className="bg-gradient-to-r from-purple-100 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{capturedWine.name}</h2>
                    <p className="text-purple-600">{capturedWine.region} • {capturedWine.year}</p>
                  </div>
                  <Badge className="bg-green-500">
                    <Star className="h-3 w-3 mr-1" />
                    {Math.round(capturedWine.confidence * 100)}% Match
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* WSET Quick Notes */}
            <div className="space-y-4">
              {Object.entries(WSET_CATEGORIES).map(([category, data]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{data.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.options.map((option) => (
                        <Button
                          key={option}
                          variant={selectedNotes[category]?.includes(option) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleWSETNote(category, option)}
                          className={selectedNotes[category]?.includes(option) 
                            ? "bg-purple-500 hover:bg-purple-600" 
                            : "hover:bg-purple-50"
                          }
                        >
                          {selectedNotes[category]?.includes(option) && (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          {option}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Voice Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {voiceNote ? (
                  <div className="bg-purple-50 rounded-xl p-4 mb-4">
                    <p className="text-gray-800 italic">"{voiceNote}"</p>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">Add personal tasting notes with your voice</p>
                )}
                
                <Button
                  onClick={startVoiceRecording}
                  disabled={isRecording}
                  variant={isRecording ? "destructive" : "outline"}
                  className="w-full"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Recording... (tap to stop)
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Record Voice Note
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Save Card Button */}
            <Button
              onClick={saveWineCard}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg py-6 rounded-xl shadow-lg"
            >
              <Zap className="h-6 w-6 mr-2" />
              Save Wine Card
            </Button>
          </>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}