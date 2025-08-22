// Enhanced wine label OCR with improved accuracy and wine-specific optimizations

interface EnhancedOCRResult {
  text: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  textType?: 'title' | 'producer' | 'vintage' | 'region' | 'details'
  fontSize?: 'large' | 'medium' | 'small'
}

interface WineExtractionResult {
  wine_name?: string
  producer?: string
  vintage?: number
  region?: string
  country?: string
  alcohol_content?: string
  volume?: string
  grape_varieties?: string[]
  appellation?: string
  classification?: string
  confidence: number
  extractedWineInfo: any
  text: string
}

// Enhanced wine patterns with better matching
const ENHANCED_WINE_PATTERNS = {
  // Vintage patterns
  vintage: /\b(19[5-9]\d|20[0-4]\d)\b/g,
  
  // Alcohol content patterns
  alcohol: /\b(\d{1,2}(?:\.\d{1,2})?)\s*%\s*(?:vol|alc|alcohol|abv)/i,
  
  // Volume patterns
  volume: /\b(\d+(?:\.\d+)?)\s*(ml|cl|l|oz|fl\s*oz|litr?e?s?)\b/i,
  
  // Producer patterns (more comprehensive)
  producer: /(?:^|\n)\s*((?:CHÂTEAU|DOMAINE|BODEGA|CANTINA|WEINGUT|QUINTA|ESTATE|WINERY|VINEYARD|CELLARS?)\s+[^\n\r]+)/im,
  
  // Country patterns (expanded)
  country: /\b(France|Italy|Spain|Germany|United States|USA|Australia|Chile|Argentina|Portugal|Greece|Austria|Hungary|Romania|Bulgaria|Slovenia|Croatia|Serbia|Georgia|Lebanon|Israel|South Africa|New Zealand|Canada|Mexico|Brazil|Uruguay|Bolivia|Peru|Japan|China|India|Thailand|Turkey|Morocco|Algeria|Tunisia|Egypt|Moldova|North Macedonia|Montenegro|Cyprus|Malta|Luxembourg|Netherlands|Belgium|Switzerland|England|Wales|Scotland|Ireland|Czech Republic|Slovakia|Poland|Ukraine|Russia|Kazakhstan|Uzbekistan|Armenia|Azerbaijan|Tajikistan)\b/gi,
  
  // Regional patterns (more comprehensive)
  region: /\b(Bordeaux|Burgundy|Champagne|Loire|Rhône|Alsace|Languedoc|Provence|Beaujolais|Jura|Savoie|Corsica|Tuscany|Piedmont|Veneto|Sicily|Sardinia|Lombardy|Emilia-Romagna|Marche|Abruzzo|Campania|Puglia|Basilicata|Calabria|Rioja|Ribera del Duero|Priorat|Rías Baixas|Penedès|Jerez|Montilla-Moriles|Jumilla|Yecla|Napa Valley|Sonoma|Willamette Valley|Central Coast|Paso Robles|Santa Barbara|Russian River|Alexander Valley|Dry Creek|Anderson Valley|Carneros|Los Carneros|Barossa Valley|Hunter Valley|McLaren Vale|Adelaide Hills|Clare Valley|Eden Valley|Coonawarra|Margaret River|Swan Valley|Marlborough|Central Otago|Hawke's Bay|Gisborne|Canterbury|Nelson|Mendoza|Salta|San Juan|Patagonia|Casablanca Valley|Colchagua Valley|Aconcagua Valley|Maipo Valley|Rapel Valley|Curicó Valley|Maule Valley|Itata Valley|Bio Bio Valley|Douro|Vinho Verde|Dão|Bairrada|Alentejo|Setúbal|Madeira|Azores|Mosel|Rheingau|Rheinhessen|Pfalz|Baden|Württemberg|Nahe|Ahr|Saale-Unstrut|Sachsen|Mittelrhein|Franken|Hessische Bergstraße|Tokaj|Eger|Villány|Szekszárd|Badacsony|Somló|Wachau|Kremstal|Kamptal|Traisental|Carnuntum|Neusiedlersee|Mittelburgenland|Südburgenland|Wien|Steiermark|Santorini|Nemea|Naoussa|Mantinia|Patras|Cephalonia|Paros|Rhodes|Lemnos|Samos|Muscadet|Sancerre|Pouilly-Fumé|Chinon|Bourgueil|Vouvray|Montlouis|Anjou|Saumur|Chablis|Côte d'Or|Côte de Nuits|Côte de Beaune|Côte Chalonnaise|Mâconnais|Côtes du Rhône|Châteauneuf-du-Pape|Hermitage|Côte-Rôtie|Condrieu|Saint-Joseph|Crozes-Hermitage|Cornas|Saint-Péray|Gigondas|Vacqueyras|Tavel|Lirac)\b/gi,
  
  // Grape variety patterns (expanded)
  grapes: /\b(Cabernet Sauvignon|Cabernet Franc|Merlot|Pinot Noir|Chardonnay|Sauvignon Blanc|Riesling|Syrah|Shiraz|Grenache|Garnacha|Sangiovese|Nebbiolo|Barbera|Dolcetto|Chianti|Tempranillo|Albariño|Verdejo|Godello|Mencía|Monastrell|Bobal|Gewürztraminer|Pinot Grigio|Pinot Gris|Moscato|Prosecco|Chenin Blanc|Sémillon|Viognier|Roussanne|Marsanne|Petite Sirah|Zinfandel|Malbec|Carmenère|Pinotage|Grüner Veltliner|Zweigelt|Blaufränkisch|Sankt Laurent|Riesling|Müller-Thurgau|Silvaner|Kerner|Scheurebe|Bacchus|Dornfelder|Spätburgunder|Weißburgunder|Grauburgunder|Assyrtiko|Xinomavro|Agiorgitiko|Roditis|Savatiano|Moschofilero|Malagousia|Robola|Athiri|Aidani|Mandilaria|Kotsifali|Liatiko|Vilana|Vidiano|Thrapsathiri|Vinsanto|Muscat|Muscat of Alexandria|Muscat Blanc à Petits Grains|Torrontés|Bonarda|Criolla|Pedro Ximénez|Palomino|Airén|Macabeo|Parellada|Xarel·lo|Cariñena|Mazuelo|Graciano|Hondarrabi Zuri|Hondarrabi Beltza|Txakoli|Verdejo|Rueda|Tinta de Toro|Juan García|Rufete|Trincadeira|Touriga Nacional|Touriga Franca|Tinta Roriz|Tinta Barroca|Castelão|Arinto|Viosinho|Rabigato|Fernão Pires|Baga|Encruzado|Cercial|Sercial|Verdelho|Malvasia|Moscatel|Gewürztraminer|Rotgipfler|Zierfandler|Neuburger|Roter Veltliner)\b/gi,
  
  // Appellation patterns
  appellation: /\b(AOC|AOP|IGP|VdP|Vin de Pays|DOC|DOCG|IGT|DOP|DO|DOCa|Vino de la Tierra|VT|AVA|GI|VQA|QbA|QmP|Prädikatswein|Kabinett|Spätlese|Auslese|Beerenauslese|Trockenbeerenauslese|Eiswein)\b/gi,
  
  // Classification patterns
  classification: /\b(Premier Cru|Grand Cru|Premier Grand Cru Classé|Deuxième Cru|Troisième Cru|Quatrième Cru|Cinquième Cru|Cru Bourgeois|Cru Artisan|Reserva|Gran Reserva|Crianza|Joven|Riserva|Superiore|Classico|Selezione)\b/gi
}

class EnhancedWineOCR {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')!
  }

  /**
   * Recognize wine label with enhanced processing
   */
  async recognizeWineLabel(imageFile: File): Promise<WineExtractionResult> {
    try {
      // Step 1: Enhance image for better OCR
      const enhancedBlob = await this.enhanceForWineOCR(imageFile)
      
      // Step 2: Extract text (mock implementation - replace with real OCR)
      const ocrResults = await this.performOCR(enhancedBlob)
      
      // Step 3: Process and extract wine information
      const wineData = this.extractWineInformation(ocrResults)
      
      return {
        ...wineData,
        text: ocrResults.map(r => r.text).join('\n'),
        extractedWineInfo: {
          wine_name: wineData.wine_name,
          producer: wineData.producer,
          vintage: wineData.vintage,
          region: wineData.region,
          country: wineData.country
        }
      }
    } catch (error) {
      console.error('Wine label recognition failed:', error)
      return {
        confidence: 0,
        extractedWineInfo: {},
        text: ''
      }
    }
  }

  /**
   * Enhanced image preprocessing specifically for wine labels
   */
  private async enhanceForWineOCR(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // Set canvas size
          this.canvas.width = img.width
          this.canvas.height = img.height

          // Clear canvas
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
          
          // Step 1: Draw original image
          this.context.drawImage(img, 0, 0)
          
          // Step 2: Get image data for processing
          const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
          const data = imageData.data

          // Step 3: Apply wine label specific enhancements
          this.applyWineLabelEnhancement(data)
          
          // Step 4: Put processed data back
          this.context.putImageData(imageData, 0, 0)

          // Step 5: Apply additional filters
          this.context.filter = 'contrast(1.3) brightness(1.1) saturate(0.7)'
          this.context.drawImage(this.canvas, 0, 0)

          // Step 6: Convert to blob
          this.canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to enhance image'))
            }
          }, 'image/jpeg', 0.95)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Apply wine label specific image enhancement
   */
  private applyWineLabelEnhancement(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Calculate luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      
      // Enhance text contrast
      const enhancedLuminance = this.enhanceTextContrast(luminance)
      
      // Apply sharpening for better text recognition
      data[i] = Math.min(255, enhancedLuminance * 1.1) // R
      data[i + 1] = Math.min(255, enhancedLuminance * 1.1) // G  
      data[i + 2] = Math.min(255, enhancedLuminance * 1.1) // B
      // Alpha channel (i + 3) remains unchanged
    }
  }

  private enhanceTextContrast(luminance: number): number {
    // Apply sigmoid function to enhance text contrast
    const normalized = luminance / 255
    const enhanced = 1 / (1 + Math.exp(-12 * (normalized - 0.5)))
    return enhanced * 255
  }

  /**
   * Perform OCR on enhanced image (mock implementation)
   */
  private async performOCR(blob: Blob): Promise<EnhancedOCRResult[]> {
    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock OCR results - in production, use actual OCR service
    const mockResults: EnhancedOCRResult[] = [
      {
        text: 'OPUS ONE',
        confidence: 0.95,
        textType: 'title',
        fontSize: 'large',
        boundingBox: { x: 100, y: 50, width: 200, height: 40 }
      },
      {
        text: 'Oakville, Napa Valley',
        confidence: 0.88,
        textType: 'region',
        fontSize: 'medium',
        boundingBox: { x: 80, y: 100, width: 240, height: 25 }
      },
      {
        text: '2018',
        confidence: 0.92,
        textType: 'vintage',
        fontSize: 'large',
        boundingBox: { x: 150, y: 140, width: 60, height: 35 }
      },
      {
        text: '750ml',
        confidence: 0.85,
        textType: 'details',
        fontSize: 'small',
        boundingBox: { x: 50, y: 300, width: 50, height: 15 }
      },
      {
        text: '14.5% alc/vol',
        confidence: 0.87,
        textType: 'details',
        fontSize: 'small',
        boundingBox: { x: 250, y: 300, width: 80, height: 15 }
      },
      {
        text: 'Product of USA',
        confidence: 0.83,
        textType: 'details',
        fontSize: 'small',
        boundingBox: { x: 100, y: 320, width: 100, height: 15 }
      }
    ]

    return mockResults
  }

  /**
   * Extract wine information from OCR results using enhanced patterns
   */
  private extractWineInformation(ocrResults: EnhancedOCRResult[]): Omit<WineExtractionResult, 'text' | 'extractedWineInfo'> {
    const fullText = ocrResults.map(r => r.text).join('\n')
    const confidenceWeights: Record<string, number> = {}
    
    // Extract vintage with context validation
    const vintageResult = this.extractVintage(ocrResults)
    const vintage = vintageResult.vintage
    if (vintage) confidenceWeights.vintage = vintageResult.confidence

    // Extract alcohol content
    const alcoholResult = this.extractAlcoholContent(fullText)
    const alcohol_content = alcoholResult.alcohol
    if (alcohol_content) confidenceWeights.alcohol = alcoholResult.confidence

    // Extract volume
    const volumeResult = this.extractVolume(fullText)
    const volume = volumeResult.volume
    if (volume) confidenceWeights.volume = volumeResult.confidence

    // Extract country with priority matching
    const countryResult = this.extractCountry(fullText, ocrResults)
    const country = countryResult.country
    if (country) confidenceWeights.country = countryResult.confidence

    // Extract region with geographical context
    const regionResult = this.extractRegion(fullText, country)
    const region = regionResult.region
    if (region) confidenceWeights.region = regionResult.confidence

    // Extract grape varieties
    const grapeResult = this.extractGrapeVarieties(fullText)
    const grape_varieties = grapeResult.grapes
    if (grape_varieties && grape_varieties.length > 0) confidenceWeights.grapes = grapeResult.confidence

    // Extract appellation
    const appellationResult = this.extractAppellation(fullText)
    const appellation = appellationResult.appellation
    if (appellation) confidenceWeights.appellation = appellationResult.confidence

    // Extract classification
    const classificationResult = this.extractClassification(fullText)
    const classification = classificationResult.classification
    if (classification) confidenceWeights.classification = classificationResult.confidence

    // Extract producer with intelligent detection
    const producerResult = this.extractProducer(ocrResults)
    const producer = producerResult.producer
    if (producer) confidenceWeights.producer = producerResult.confidence

    // Extract wine name with context awareness  
    const wineNameResult = this.extractWineName(ocrResults, producer)
    const wine_name = wineNameResult.wineName
    if (wine_name) confidenceWeights.wineName = wineNameResult.confidence

    // Calculate overall confidence
    const confidenceValues = Object.values(confidenceWeights)
    const overallConfidence = confidenceValues.length > 0 
      ? confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length 
      : 0

    return {
      wine_name,
      producer,
      vintage,
      region,
      country,
      alcohol_content,
      volume,
      grape_varieties,
      appellation,
      classification,
      confidence: overallConfidence
    }
  }

  private extractVintage(ocrResults: EnhancedOCRResult[]): { vintage?: number; confidence: number } {
    // Look for vintage in title or dedicated vintage areas
    const vintageOCR = ocrResults.find(r => r.textType === 'vintage' || (r.fontSize === 'large' && /\b(19|20)\d{2}\b/.test(r.text)))
    
    if (vintageOCR) {
      const match = vintageOCR.text.match(/\b(19[5-9]\d|20[0-4]\d)\b/)
      if (match) {
        return { vintage: parseInt(match[0]), confidence: vintageOCR.confidence * 0.95 }
      }
    }

    // Fallback to general text search
    const fullText = ocrResults.map(r => r.text).join(' ')
    const vintageMatch = fullText.match(ENHANCED_WINE_PATTERNS.vintage)
    if (vintageMatch) {
      return { vintage: parseInt(vintageMatch[0]), confidence: 0.75 }
    }

    return { confidence: 0 }
  }

  private extractAlcoholContent(text: string): { alcohol?: string; confidence: number } {
    const match = text.match(ENHANCED_WINE_PATTERNS.alcohol)
    if (match) {
      return { alcohol: `${match[1]}%`, confidence: 0.9 }
    }
    return { confidence: 0 }
  }

  private extractVolume(text: string): { volume?: string; confidence: number } {
    const match = text.match(ENHANCED_WINE_PATTERNS.volume)
    if (match) {
      // Normalize volume units
      let unit = match[2].toLowerCase()
      if (unit.includes('l') && unit !== 'ml' && unit !== 'cl') unit = 'l'
      return { volume: `${match[1]}${unit}`, confidence: 0.85 }
    }
    return { confidence: 0 }
  }

  private extractCountry(text: string, ocrResults: EnhancedOCRResult[]): { country?: string; confidence: number } {
    // Look for country in product origin statements first
    const originPattern = /product of\s+([^,\n]+)/i
    const originMatch = text.match(originPattern)
    if (originMatch) {
      const country = originMatch[1].trim()
      if (ENHANCED_WINE_PATTERNS.country.test(country)) {
        return { country, confidence: 0.95 }
      }
    }

    // Standard country pattern matching
    const matches = text.match(ENHANCED_WINE_PATTERNS.country)
    if (matches) {
      return { country: matches[0], confidence: 0.8 }
    }

    return { confidence: 0 }
  }

  private extractRegion(text: string, country?: string): { region?: string; confidence: number } {
    const matches = text.match(ENHANCED_WINE_PATTERNS.region)
    if (matches) {
      const region = matches[0]
      
      // Increase confidence if region matches known country
      let confidence = 0.8
      if (country && this.isRegionInCountry(region, country)) {
        confidence = 0.92
      }
      
      return { region, confidence }
    }
    return { confidence: 0 }
  }

  private extractGrapeVarieties(text: string): { grapes?: string[]; confidence: number } {
    const matches = text.match(ENHANCED_WINE_PATTERNS.grapes)
    if (matches) {
      // Remove duplicates and normalize
      const grapes = [...new Set(matches.map(grape => 
        grape.replace(/\s+/g, ' ').trim()
      ))]
      return { grapes, confidence: 0.85 }
    }
    return { confidence: 0 }
  }

  private extractAppellation(text: string): { appellation?: string; confidence: number } {
    const matches = text.match(ENHANCED_WINE_PATTERNS.appellation)
    if (matches) {
      return { appellation: matches[0], confidence: 0.88 }
    }
    return { confidence: 0 }
  }

  private extractClassification(text: string): { classification?: string; confidence: number } {
    const matches = text.match(ENHANCED_WINE_PATTERNS.classification)
    if (matches) {
      return { classification: matches[0], confidence: 0.85 }
    }
    return { confidence: 0 }
  }

  private extractProducer(ocrResults: EnhancedOCRResult[]): { producer?: string; confidence: number } {
    // Look for producer keywords in structured way
    for (const result of ocrResults) {
      if (result.fontSize === 'large' && result.textType !== 'vintage') {
        const producerMatch = result.text.match(/^(CHÂTEAU|DOMAINE|BODEGA|CANTINA|WEINGUT|QUINTA|ESTATE|WINERY)\s+(.+)/i)
        if (producerMatch) {
          return { producer: result.text.trim(), confidence: result.confidence * 0.9 }
        }
      }
    }

    // Fallback to pattern matching
    const fullText = ocrResults.map(r => r.text).join('\n')
    const match = fullText.match(ENHANCED_WINE_PATTERNS.producer)
    if (match) {
      return { producer: match[1].trim(), confidence: 0.7 }
    }

    // Last resort: first substantial line that looks like producer
    const substantialResults = ocrResults.filter(r => 
      r.text.length > 5 && 
      r.fontSize !== 'small' &&
      !/^\d+$/.test(r.text) &&
      !r.text.match(/\d+\s*%/)
    )

    if (substantialResults.length > 0) {
      return { producer: substantialResults[0].text.trim(), confidence: 0.5 }
    }

    return { confidence: 0 }
  }

  private extractWineName(ocrResults: EnhancedOCRResult[], producer?: string): { wineName?: string; confidence: number } {
    // Look for title text that's not the producer
    const titleResults = ocrResults.filter(r => 
      (r.textType === 'title' || r.fontSize === 'large') && 
      r.text !== producer &&
      r.text.length > 2 &&
      !/^\d+$/.test(r.text)
    )

    if (titleResults.length > 0) {
      // Prefer the result with highest confidence
      const bestResult = titleResults.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      )
      return { wineName: bestResult.text.trim(), confidence: bestResult.confidence * 0.85 }
    }

    // Fallback: find first non-producer substantial text
    const candidates = ocrResults.filter(r => 
      r.text !== producer &&
      r.text.length > 3 &&
      !r.text.match(/^\d+$/) &&
      !r.text.match(/\d+\s*%/) &&
      !r.text.match(/\b(AOC|AOP|IGP|DOC|DOCG|AVA)\b/i)
    )

    if (candidates.length > 0) {
      return { wineName: candidates[0].text.trim(), confidence: 0.6 }
    }

    return { confidence: 0 }
  }

  private isRegionInCountry(region: string, country: string): boolean {
    // Simple mapping - in production, use comprehensive database
    const regionCountryMap: Record<string, string[]> = {
      'France': ['Bordeaux', 'Burgundy', 'Champagne', 'Loire', 'Rhône', 'Alsace', 'Languedoc', 'Provence'],
      'Italy': ['Tuscany', 'Piedmont', 'Veneto', 'Sicily', 'Sardinia'],
      'Spain': ['Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas'],
      'USA': ['Napa Valley', 'Sonoma', 'Willamette Valley', 'Central Coast'],
      'Australia': ['Barossa Valley', 'Hunter Valley', 'McLaren Vale'],
      'Germany': ['Mosel', 'Rheingau', 'Pfalz', 'Baden']
    }

    const regions = regionCountryMap[country] || []
    return regions.some(r => r.toLowerCase() === region.toLowerCase())
  }

  /**
   * Crop image to wine label area for better recognition
   */
  async cropToWineLabel(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // Set canvas to a cropped size focusing on center where labels usually are
          const cropWidth = Math.min(img.width * 0.8, 600)
          const cropHeight = Math.min(img.height * 0.9, 800)
          const cropX = (img.width - cropWidth) / 2
          const cropY = (img.height - cropHeight) / 2

          this.canvas.width = cropWidth
          this.canvas.height = cropHeight

          // Draw cropped portion
          this.context.drawImage(
            img, 
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
          )

          this.canvas.toBlob((croppedBlob) => {
            if (croppedBlob) {
              resolve(croppedBlob)
            } else {
              reject(new Error('Failed to crop image'))
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
   * Auto-rotate image based on text orientation
   */
  async autoRotateForOCR(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // For now, just return the original image
          // In production, implement text orientation detection
          resolve(blob)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(blob)
    })
  }
}

// Singleton instance
const enhancedWineOCR = new EnhancedWineOCR()

// Main export interface matching the expected signature
export const textRecognizer = {
  async recognizeWineLabel(file: File): Promise<WineExtractionResult> {
    return enhancedWineOCR.recognizeWineLabel(file)
  },

  async enhanceForOCR(blob: Blob): Promise<Blob> {
    return enhancedWineOCR.enhanceForWineOCR(blob as File)
  },

  async cropToLabel(blob: Blob): Promise<Blob> {
    return enhancedWineOCR.cropToWineLabel(blob)
  },

  async autoRotate(blob: Blob): Promise<Blob> {
    return enhancedWineOCR.autoRotateForOCR(blob)
  }
}

export { type WineExtractionResult, type EnhancedOCRResult }
export default enhancedWineOCR