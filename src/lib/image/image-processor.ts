interface ImageCompression {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/jpeg' | 'image/webp' | 'image/png'
}

/**
 * Compress an image blob while maintaining aspect ratio
 */
export async function compressImage(
  blob: Blob,
  options: ImageCompression = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Apply high-quality scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              resolve(compressedBlob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          format,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Generate a thumbnail from an image blob
 */
export async function generateThumbnail(
  blob: Blob,
  width: number = 200,
  height: number = 200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        canvas.width = width
        canvas.height = height

        // Calculate crop dimensions for center crop
        const aspectRatio = img.width / img.height
        const targetAspectRatio = width / height
        
        let sourceX = 0
        let sourceY = 0
        let sourceWidth = img.width
        let sourceHeight = img.height

        if (aspectRatio > targetAspectRatio) {
          // Image is wider, crop sides
          sourceWidth = img.height * targetAspectRatio
          sourceX = (img.width - sourceWidth) / 2
        } else {
          // Image is taller, crop top/bottom
          sourceHeight = img.width / targetAspectRatio
          sourceY = (img.height - sourceHeight) / 2
        }

        // Draw cropped and scaled image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, width, height
        )

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image for thumbnail'))
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Convert image to different format
 */
export async function convertImageFormat(
  blob: Blob,
  targetFormat: 'image/jpeg' | 'image/webp' | 'image/png',
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        canvas.width = img.width
        canvas.height = img.height

        // For JPEG, fill background with white to avoid transparency issues
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (convertedBlob) => {
            if (convertedBlob) {
              resolve(convertedBlob)
            } else {
              reject(new Error('Failed to convert image format'))
            }
          },
          targetFormat,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image for conversion'))
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Extract EXIF data from image (simplified version)
 */
export async function extractImageMetadata(blob: Blob): Promise<{
  width: number
  height: number
  size: number
  type: string
  orientation?: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: blob.size,
        type: blob.type,
        // Note: Full EXIF extraction would require additional library
        orientation: 1
      })
    }

    img.onerror = () => reject(new Error('Failed to load image for metadata extraction'))
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Apply auto-rotation based on EXIF orientation
 */
export async function autoRotateImage(blob: Blob): Promise<Blob> {
  // For now, return the original blob
  // Full implementation would require EXIF parsing library
  return blob
}

/**
 * Optimize image for web delivery
 */
export async function optimizeForWeb(
  blob: Blob,
  options: {
    maxFileSize?: number // in bytes
    targetQuality?: number
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<Blob> {
  const {
    maxFileSize = 500 * 1024, // 500KB
    targetQuality = 0.85,
    maxWidth = 1920,
    maxHeight = 1080
  } = options

  let optimizedBlob = blob
  let quality = targetQuality

  // First, resize if needed
  if (blob.size > maxFileSize || maxWidth || maxHeight) {
    optimizedBlob = await compressImage(blob, {
      maxWidth,
      maxHeight,
      quality
    })
  }

  // If still too large, reduce quality iteratively
  while (optimizedBlob.size > maxFileSize && quality > 0.1) {
    quality -= 0.1
    optimizedBlob = await compressImage(blob, {
      maxWidth,
      maxHeight,
      quality
    })
  }

  return optimizedBlob
}

/**
 * Create progressive JPEG (requires server-side processing in real implementation)
 */
export async function createProgressiveJPEG(blob: Blob): Promise<Blob> {
  // This would typically be done server-side
  // For now, return optimized JPEG
  return compressImage(blob, {
    format: 'image/jpeg',
    quality: 0.85
  })
}

/**
 * Batch process multiple images
 */
export async function batchProcessImages(
  blobs: Blob[],
  options: ImageCompression = {},
  onProgress?: (processed: number, total: number) => void
): Promise<Blob[]> {
  const results: Blob[] = []
  
  for (let i = 0; i < blobs.length; i++) {
    try {
      const processed = await compressImage(blobs[i], options)
      results.push(processed)
      onProgress?.(i + 1, blobs.length)
    } catch (error) {
      console.error(`Failed to process image ${i + 1}:`, error)
      results.push(blobs[i]) // Use original if processing fails
    }
  }
  
  return results
}