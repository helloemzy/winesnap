// File upload utilities for photos and audio

import { supabase } from '@/lib/supabase'
import { useState, useCallback } from 'react'

export interface FileUploadOptions {
  bucket?: string
  folder?: string
  maxSize?: number // in bytes
  allowedTypes?: string[]
  compress?: boolean
  quality?: number // 0.1 to 1.0 for image compression
}

export interface UploadProgress {
  progress: number
  uploaded: number
  total: number
  phase: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error'
}

export interface UploadResult {
  url: string
  path: string
  size: number
  type: string
}

export class FileUploader {
  private static instance: FileUploader
  
  private constructor() {}

  static getInstance(): FileUploader {
    if (!FileUploader.instance) {
      FileUploader.instance = new FileUploader()
    }
    return FileUploader.instance
  }

  async uploadFile(
    file: File,
    options: FileUploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const {
      bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'winesnap-media',
      folder = 'uploads',
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes,
      compress = false,
      quality = 0.8
    } = options

    try {
      // Validate file
      this.validateFile(file, maxSize, allowedTypes)

      onProgress?.({
        progress: 0,
        uploaded: 0,
        total: file.size,
        phase: 'preparing'
      })

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      // Process file if needed
      let processedFile = file
      if (compress && file.type.startsWith('image/')) {
        onProgress?.({
          progress: 10,
          uploaded: 0,
          total: file.size,
          phase: 'processing'
        })
        processedFile = await this.compressImage(file, quality)
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const fileName = `${folder}/${user.id}/${timestamp}-${randomString}.${extension}`

      onProgress?.({
        progress: 20,
        uploaded: 0,
        total: processedFile.size,
        phase: 'uploading'
      })

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, processedFile, {
          contentType: processedFile.type,
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      onProgress?.({
        progress: 90,
        uploaded: processedFile.size,
        total: processedFile.size,
        phase: 'processing'
      })

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      onProgress?.({
        progress: 100,
        uploaded: processedFile.size,
        total: processedFile.size,
        phase: 'complete'
      })

      return {
        url: publicUrl,
        path: fileName,
        size: processedFile.size,
        type: processedFile.type
      }

    } catch (error) {
      onProgress?.({
        progress: 0,
        uploaded: 0,
        total: file.size,
        phase: 'error'
      })
      throw error
    }
  }

  private validateFile(file: File, maxSize: number, allowedTypes?: string[]): void {
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${this.formatFileSize(maxSize)}`)
    }

    if (allowedTypes && !allowedTypes.some(type => file.type.startsWith(type))) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }
  }

  private async compressImage(file: File, quality: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1920x1920)
        const maxDimension = 1920
        let { width, height } = img
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Image compression failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Invalid image file'))
      img.src = URL.createObjectURL(file)
    })
  }

  async deleteFile(path: string, bucket?: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'winesnap-media')
      .remove([path])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Export singleton
export const fileUploader = FileUploader.getInstance()

// Predefined upload configurations
export const UPLOAD_CONFIGS = {
  WINE_PHOTO: {
    folder: 'wine-photos',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/'],
    compress: true,
    quality: 0.8
  },
  VOICE_RECORDING: {
    folder: 'voice-recordings',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['audio/'],
    compress: false
  },
  PROFILE_AVATAR: {
    folder: 'avatars',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/'],
    compress: true,
    quality: 0.9
  }
}

// React hooks for file uploads
export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (
    file: File,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> => {
    try {
      setUploading(true)
      setError(null)
      setProgress(null)

      const result = await fileUploader.uploadFile(file, options, (progressData) => {
        setProgress(progressData)
      })

      return result
    } catch (err) {
      const errorMessage = (err as Error).message
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(null)
    setError(null)
  }, [])

  return {
    uploadFile,
    uploading,
    progress,
    error,
    reset
  }
}

export function useMultiFileUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map())
  const [results, setResults] = useState<Map<string, UploadResult>>(new Map())
  const [errors, setErrors] = useState<Map<string, string>>(new Map())

  const uploadFiles = useCallback(async (
    files: File[],
    options: FileUploadOptions = {}
  ): Promise<UploadResult[]> => {
    const uploadPromises = files.map(async (file, index) => {
      const fileId = `${index}-${file.name}`
      
      try {
        setUploads(prev => new Map(prev).set(fileId, {
          progress: 0,
          uploaded: 0,
          total: file.size,
          phase: 'preparing'
        }))

        const result = await fileUploader.uploadFile(file, options, (progress) => {
          setUploads(prev => new Map(prev).set(fileId, progress))
        })

        setResults(prev => new Map(prev).set(fileId, result))
        return result
      } catch (error) {
        const errorMessage = (error as Error).message
        setErrors(prev => new Map(prev).set(fileId, errorMessage))
        throw error
      }
    })

    return Promise.all(uploadPromises)
  }, [])

  const reset = useCallback(() => {
    setUploads(new Map())
    setResults(new Map())
    setErrors(new Map())
  }, [])

  return {
    uploadFiles,
    uploads: Array.from(uploads.entries()),
    results: Array.from(results.entries()),
    errors: Array.from(errors.entries()),
    reset
  }
}

// Drag and drop file handler
export function useFileDrop(
  onDrop: (files: File[]) => void,
  options: {
    accept?: string[]
    maxFiles?: number
    maxSize?: number
  } = {}
) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    
    // Filter files based on options
    let validFiles = files
    
    if (options.accept) {
      validFiles = files.filter(file => 
        options.accept!.some(type => file.type.startsWith(type))
      )
    }
    
    if (options.maxFiles) {
      validFiles = validFiles.slice(0, options.maxFiles)
    }
    
    if (options.maxSize) {
      validFiles = validFiles.filter(file => file.size <= options.maxSize!)
    }

    onDrop(validFiles)
  }, [onDrop, options])

  return {
    isDragOver,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    }
  }
}

// File validation utilities
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 5MB' }
  }

  return { valid: true }
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('audio/')) {
    return { valid: false, error: 'File must be an audio file' }
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Audio file must be smaller than 10MB' }
  }

  return { valid: true }
}

export default FileUploader