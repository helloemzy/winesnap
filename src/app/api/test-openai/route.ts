import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing OpenAI API key...')
    console.log('API key exists:', !!process.env.OPENAI_API_KEY)
    console.log('API key preview:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...')
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'OpenAI API key not found in environment variables' 
      })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Simple test request
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Say 'API test successful'"
        }
      ],
      max_tokens: 10
    })

    return NextResponse.json({
      success: true,
      response: response.choices[0]?.message?.content,
      model: "gpt-4o-mini"
    })

  } catch (error: any) {
    console.error('OpenAI API test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      type: error.type
    })
  }
}