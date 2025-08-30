import { NextRequest, NextResponse } from 'next/server'
import { generateWithGemini } from '@/lib/gemini'
import { auth } from '@clerk/nextjs'

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { message, context, conversationHistory } = await request.json()

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: 'Сообщение не может быть пустым' },
                { status: 400 }
            )
        }

        // Формируем контекст для ИИ
        let fullPrompt = `Ты - умный помощник для работы с документами. Отвечай на русском языке дружелюбно и профессионально.

Пользователь спрашивает: ${message}`

        // Добавляем контекст документа, если есть
        if (context && context.trim()) {
            fullPrompt += `\n\nКонтекст документа:\n${context}`
        }

        // Добавляем историю разговора для контекста
        if (conversationHistory && conversationHistory.length > 0) {
            const recentHistory = conversationHistory.slice(-6) // Последние 6 сообщений
            fullPrompt += `\n\nИстория разговора:`
            recentHistory.forEach((msg: any) => {
                if (msg.isUser) {
                    fullPrompt += `\nПользователь: ${msg.content}`
                } else {
                    fullPrompt += `\nАссистент: ${msg.content}`
                }
            })
        }

        fullPrompt += `\n\nПожалуйста, дай полезный и информативный ответ. Если вопрос касается редактирования документа, предложи конкретные варианты улучшений.`

        console.log('Отправляем запрос в Gemini API для чата...')
        const aiResponse = await generateWithGemini(fullPrompt)

        if (!aiResponse || !aiResponse.trim()) {
            return NextResponse.json(
                { error: 'ИИ вернул пустой ответ' },
                { status: 500 }
            )
        }

        console.log('Получен ответ от Gemini API для чата')

        return NextResponse.json({
            response: aiResponse.trim(),
            success: true,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('AI chat error:', error)

        let errorMessage = 'Произошла ошибка при общении с ИИ'

        if (error instanceof Error) {
            if (error.message.includes('GEMINI_API_KEY')) {
                errorMessage = 'Ошибка настройки ИИ. Проверьте API ключ Gemini.'
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorMessage = 'Превышен лимит запросов к ИИ. Попробуйте позже.'
            } else {
                errorMessage = error.message
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
