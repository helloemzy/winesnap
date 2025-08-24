import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('Processing audio file for transcription...')

    // Step 1: Transcribe the audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text'
    })

    console.log('Transcription:', transcription)

    // Step 2: Use GPT to extract and categorize tasting notes
    const categorizationPrompt = `
Analyze this beverage tasting note transcription and extract keywords into the appropriate categories.

Transcription: "${transcription}"

Available categories and their options:
- appearance: Clear, Hazy, Pale, Medium, Deep, Light, Dark, Colorful, Vibrant, Rich
- aroma: Fresh, Fruity, Sweet, Citrus, Herbal, Spicy, Strong, Mild, Pleasant, Complex
- taste: Sweet, Bitter, Sour, Salty, Refreshing, Bold, Mild, Smooth, Sharp, Balanced
- texture: Smooth, Bubbly, Creamy, Light, Heavy, Crisp, Thick, Thin, Fizzy, Still
- overall: Excellent, Very Good, Good, Average, Poor

Return a JSON object with:
{
  "transcription": "the full transcribed text",
  "categories": {
    "appearance": ["array of matching options from above"],
    "aroma": ["array of matching options from above"],
    "taste": ["array of matching options from above"],  
    "texture": ["array of matching options from above"],
    "overall": ["array of matching options from above"]
  },
  "confidence": 0.95
}

Only include categories where you found relevant keywords. If the person says something like "it tastes sweet and refreshing" then taste should include ["Sweet", "Refreshing"]. If they mention "it's bubbly" then texture should include ["Bubbly"]. Be smart about synonyms and context.
`

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: categorizationPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })

    const aiResponseText = aiResponse.choices[0]?.message?.content
    console.log('AI categorization response:', aiResponseText)

    if (!aiResponseText) {
      throw new Error('No response from AI categorization')
    }

    // Parse the AI response
    let categorizedResult
    try {
      categorizedResult = JSON.parse(aiResponseText)
    } catch (parseError) {
      console.error('Failed to parse AI categorization:', parseError)
      // Fallback with just transcription
      categorizedResult = {
        transcription: transcription,
        categories: {},
        confidence: 0.5
      }
    }

    return NextResponse.json(categorizedResult)

  } catch (error: any) {
    console.error('Error processing audio:', error)
    
    // Return error with fallback
    return NextResponse.json({
      error: 'Failed to process audio',
      message: error.message,
      transcription: "Sorry, couldn't process your audio. Please try again.",
      categories: {},
      confidence: 0.0
    }, { status: 500 })
  }
}