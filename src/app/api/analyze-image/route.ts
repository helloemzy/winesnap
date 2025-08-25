import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== Image Analysis API Called ===')
    
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables')
      throw new Error('OpenAI API key not configured')
    }
    
    const { imageData } = await request.json()
    
    if (!imageData) {
      console.error('No image data provided in request')
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    console.log('Image data length:', imageData.length)
    console.log('Image data preview:', imageData.substring(0, 50) + '...')
    console.log('Analyzing image with OpenAI Vision API...')

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and identify what type of beverage or bottle this is. If it's a wine bottle, provide wine details. If it's not wine (like a soda, energy drink, beer, etc.), clearly identify what it actually is.

Return a JSON object with this exact structure:
{
  "name": "Product name (e.g., 'Red Bull Energy Drink', 'Coca-Cola', 'Château Margaux 2019')",
  "type": "Product category (e.g., 'Energy Drink', 'Soda', 'Red Wine', 'Beer')", 
  "producer": "Brand or producer name",
  "region": "Origin/region if wine, or 'N/A' if not wine",
  "year": "Year if wine, or 'N/A' if not wine",
  "confidence": 0.95,
  "isWine": false,
  "description": "Brief description of what you see"
}

Be accurate - if it's clearly NOT wine, set isWine to false and identify the actual product.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    })

    const aiResponse = response.choices[0]?.message?.content
    console.log('AI Response:', aiResponse)

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    let analysis
    try {
      analysis = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback response
      analysis = {
        name: "Unknown Product",
        type: "Unknown",
        producer: "Unknown",
        region: "N/A",
        year: "N/A",
        confidence: 0.5,
        isWine: false,
        description: "Unable to identify the product clearly"
      }
    }

    return NextResponse.json(analysis)

  } catch (error: any) {
    console.error('=== Error analyzing image ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
    
    // More specific error messages based on error type
    let errorDescription = "Image analysis service temporarily unavailable"
    
    if (error.code === 'insufficient_quota') {
      errorDescription = "API quota exceeded - please try again later"
    } else if (error.code === 'invalid_api_key') {
      errorDescription = "API key configuration issue"
    } else if (error.message?.includes('rate limit')) {
      errorDescription = "Too many requests - please wait a moment"
    } else if (error.message?.includes('network')) {
      errorDescription = "Network connection issue - please try again"
    }
    
    // Fallback response for any errors
    return NextResponse.json({
      name: "Analysis Failed",
      type: "Unknown",
      producer: "Unknown", 
      region: "N/A",
      year: "N/A",
      confidence: 0.1,
      isWine: false,
      description: errorDescription,
      debug: {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      }
    })
  }
}