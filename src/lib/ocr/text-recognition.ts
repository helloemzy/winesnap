// Wine label text recognition system

interface OCRResult {
  text: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface WineLabelData {
  wineName?: string
  producer?: string
  vintage?: string
  region?: string
  country?: string
  alcoholContent?: string
  volume?: string
  grapeVariety?: string[]
  appellation?: string
  confidence: {
    overall: number
    individual: Record<string, number>
  }
  rawText: string
}

// Common wine-related patterns
const WINE_PATTERNS = {
  vintage: /\b(19|20)\d{2}\b/g,
  alcoholContent: /\b(\d{1,2}(?:\.\d)?)\s*%\s*(?:vol|alc|alcohol)/i,
  volume: /\b(\d+(?:\.\d+)?)\s*(ml|l|oz|fl\s*oz)\b/i,
  appellation: /\b(AOC|AOP|IGP|DOC|DOCG|AVA|GI)\b/i,
  producer: /(?:produced|bottled|imported)\s+by\s+([^,\n]+)/i,
  country: /\b(France|Italy|Spain|Germany|USA|Australia|Chile|Argentina|Portugal|Greece|Austria|Hungary|Romania|Bulgaria|Slovenia|Croatia|Serbia|Georgia|Lebanon|Israel|South Africa|New Zealand|Canada|Mexico|Brazil|Uruguay|Bolivia|Peru|Japan|China|India|Thailand|Turkey|Morocco|Algeria|Tunisia|Egypt)\b/gi,
  region: /\b(Bordeaux|Burgundy|Champagne|Loire|Rhône|Alsace|Languedoc|Provence|Tuscany|Piedmont|Veneto|Sicily|Rioja|Ribera del Duero|Priorat|Rías Baixas|Napa Valley|Sonoma|Willamette Valley|Central Coast|Barossa Valley|Hunter Valley|Marlborough|Central Otago|Mendoza|Casablanca Valley|Colchagua Valley|Douro|Alentejo|Mosel|Rheingau|Pfalz|Baden|Württemberg|Tokaj|Santorini|Nemea|Wachau|Kamptal)\b/gi,
  grapes: /\b(Cabernet Sauvignon|Merlot|Pinot Noir|Chardonnay|Sauvignon Blanc|Riesling|Syrah|Shiraz|Grenache|Sangiovese|Nebbiolo|Barbera|Chianti|Tempranillo|Garnacha|Albariño|Verdejo|Gewürztraminer|Pinot Grigio|Pinot Gris|Moscato|Prosecco|Chenin Blanc|Sémillon|Viognier|Roussanne|Marsanne|Petite Sirah|Zinfandel|Malbec|Carmenère|Pinotage|Grüner Veltliner|Zweigelt|Blaufränkisch|Assyrtiko|Xinomavro|Agiorgitiko)\b/gi
}

class TextRecognitionEngine {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')!
  }

  /**
   * Extract text from image using browser's built-in OCR capabilities
   * Note: This is a simplified implementation. In production, you'd use
   * services like Google Vision API, AWS Textract, or Tesseract.js
   */
  async extractTextFromImage(blob: Blob): Promise<OCRResult[]> {
    try {
      // For now, we'll use a mock OCR implementation
      // In production, this would call an actual OCR service
      const mockText = await this.mockOCR(blob)
      
      return [{
        text: mockText,
        confidence: 0.85,
        boundingBox: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      }]
    } catch (error) {
      console.error('OCR extraction failed:', error)
      return []
    }
  }

  /**
   * Mock OCR for demonstration - in production, replace with real OCR service
   */
  private async mockOCR(blob: Blob): Promise<string> {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock text that would typically come from OCR
    return `CHÂTEAU MARGAUX
Premier Grand Cru Classé
Margaux
2015
75cl
13.5% vol
Appellation Margaux Contrôlée
Product of France
Bottled at the Château`
  }

  /**
   * Process OCR results to extract wine information
   */
  async processWineLabelText(ocrResults: OCRResult[]): Promise<WineLabelData> {
    const fullText = ocrResults.map(result => result.text).join('\n')
    const confidence: Record<string, number> = {}
    
    // Extract vintage
    const vintageMatches = fullText.match(WINE_PATTERNS.vintage)
    const vintage = vintageMatches ? vintageMatches[0] : undefined
    if (vintage) confidence.vintage = 0.9

    // Extract alcohol content
    const alcoholMatch = fullText.match(WINE_PATTERNS.alcoholContent)
    const alcoholContent = alcoholMatch ? `${alcoholMatch[1]}%` : undefined
    if (alcoholContent) confidence.alcoholContent = 0.85

    // Extract volume
    const volumeMatch = fullText.match(WINE_PATTERNS.volume)
    const volume = volumeMatch ? `${volumeMatch[1]}${volumeMatch[2]}` : undefined
    if (volume) confidence.volume = 0.8

    // Extract country
    const countryMatches = fullText.match(WINE_PATTERNS.country)
    const country = countryMatches ? countryMatches[0] : undefined
    if (country) confidence.country = 0.9

    // Extract region
    const regionMatches = fullText.match(WINE_PATTERNS.region)
    const region = regionMatches ? regionMatches[0] : undefined
    if (region) confidence.region = 0.85

    // Extract grape varieties
    const grapeMatches = fullText.match(WINE_PATTERNS.grapes)
    const grapeVariety = grapeMatches ? [...new Set(grapeMatches)] : undefined
    if (grapeVariety) confidence.grapeVariety = 0.8

    // Extract appellation
    const appellationMatch = fullText.match(WINE_PATTERNS.appellation)
    const appellation = appellationMatch ? appellationMatch[0] : undefined
    if (appellation) confidence.appellation = 0.7

    // Extract producer (simple heuristic)
    const lines = fullText.split('\n').filter(line => line.trim())
    const producer = this.extractProducer(lines)
    if (producer) confidence.producer = 0.6

    // Extract wine name (usually first or second line)
    const wineName = this.extractWineName(lines, producer)
    if (wineName) confidence.wineName = 0.7

    // Calculate overall confidence
    const values = Object.values(confidence)
    const overallConfidence = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

    return {
      wineName,
      producer,
      vintage,
      region,
      country,
      alcoholContent,
      volume,
      grapeVariety,
      appellation,
      confidence: {
        overall: overallConfidence,
        individual: confidence
      },
      rawText: fullText
    }
  }

  private extractProducer(lines: string[]): string | undefined {
    // Look for common producer indicators
    for (const line of lines) {
      if (line.match(/^(CHÂTEAU|DOMAINE|BODEGA|CANTINA|WEINGUT|QUINTA)/i)) {
        return line.trim()
      }
      if (line.match(/(WINERY|VINEYARD|ESTATE|CELLARS?)$/i)) {
        return line.trim()
      }
    }
    
    // Fallback to first substantial line
    const substantialLines = lines.filter(line => 
      line.length > 3 && 
      !line.match(/^\d+$/) && 
      !line.match(/^(AOC|AOP|IGP|DOC|DOCG|AVA)$/i)
    )
    
    return substantialLines[0]?.trim()
  }

  private extractWineName(lines: string[], producer?: string): string | undefined {
    const filteredLines = lines.filter(line => {
      const cleanLine = line.trim()
      return cleanLine.length > 2 && 
             cleanLine !== producer &&
             !cleanLine.match(/^\d+$/) &&
             !cleanLine.match(/^(AOC|AOP|IGP|DOC|DOCG|AVA)$/i) &&
             !cleanLine.match(/\d+\s*%/) &&
             !cleanLine.match(/\d+\s*(ml|cl|l)\b/i)
    })

    // Wine name is often the first non-producer line
    for (const line of filteredLines) {
      if (line !== producer) {
        return line.trim()
      }
    }

    return filteredLines[0]?.trim()
  }

  /**
   * Enhance text recognition accuracy for wine labels
   */
  async enhanceImageForOCR(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          this.canvas.width = img.width
          this.canvas.height = img.height

          // Apply image enhancements for better OCR
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
          
          // Increase contrast
          this.context.filter = 'contrast(1.2) brightness(1.1) saturate(0.8)'
          this.context.drawImage(img, 0, 0)
          
          // Convert to grayscale for better text recognition
          const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
          const data = imageData.data
          
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
            data[i] = gray
            data[i + 1] = gray
            data[i + 2] = gray
          }
          
          this.context.putImageData(imageData, 0, 0)

          this.canvas.toBlob((enhancedBlob) => {
            if (enhancedBlob) {
              resolve(enhancedBlob)
            } else {
              reject(new Error('Failed to enhance image'))
            }
          }, 'image/jpeg', 0.9)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(blob)
    })
  }

  /**
   * Batch process multiple images for text recognition
   */
  async batchProcessImages(
    blobs: Blob[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<WineLabelData[]> {
    const results: WineLabelData[] = []
    
    for (let i = 0; i < blobs.length; i++) {
      try {
        const enhanced = await this.enhanceImageForOCR(blobs[i])
        const ocrResults = await this.extractTextFromImage(enhanced)
        const wineData = await this.processWineLabelText(ocrResults)
        results.push(wineData)
        onProgress?.(i + 1, blobs.length)
      } catch (error) {
        console.error(`Failed to process image ${i + 1}:`, error)
        results.push({
          confidence: { overall: 0, individual: {} },
          rawText: ''
        })
      }
    }
    
    return results
  }
}

// Singleton instance
const textRecognitionEngine = new TextRecognitionEngine()

// Exported functions
export async function extractWineLabelData(blob: Blob): Promise<WineLabelData> {
  const enhanced = await textRecognitionEngine.enhanceImageForOCR(blob)
  const ocrResults = await textRecognitionEngine.extractTextFromImage(enhanced)
  return textRecognitionEngine.processWineLabelText(ocrResults)
}

export async function enhanceImageForOCR(blob: Blob): Promise<Blob> {
  return textRecognitionEngine.enhanceImageForOCR(blob)
}

export async function batchExtractWineLabelData(
  blobs: Blob[],
  onProgress?: (processed: number, total: number) => void
): Promise<WineLabelData[]> {
  return textRecognitionEngine.batchProcessImages(blobs, onProgress)
}

export { type WineLabelData, type OCRResult }