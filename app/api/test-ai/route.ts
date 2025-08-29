import { NextResponse } from 'next/server'
import { generateWithGemini } from '@/lib/gemini'

export async function GET() {
  try {
    const testPrompt = "Скажи 'Привет' на русском языке"
    const response = await generateWithGemini(testPrompt)
    
    return NextResponse.json({
      status: 'success',
      message: 'Gemini API работает',
      prompt: testPrompt,
      response: response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Gemini API test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Ошибка Gemini API',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}
