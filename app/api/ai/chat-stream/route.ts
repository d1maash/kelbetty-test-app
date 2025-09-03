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

        console.log('Отправляем запрос в Gemini API для стримингового чата...')

        // Создаем поток для стриминга
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const aiResponse = await generateWithGemini(fullPrompt)

                    if (!aiResponse || !aiResponse.trim()) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'ИИ вернул пустой ответ' })}\n\n`))
                        controller.close()
                        return
                    }

                    const words = aiResponse.trim().split(' ')
                    let currentText = ''

                    // Отправляем слова по частям для эффекта печатания
                    for (let i = 0; i < words.length; i++) {
                        currentText += (i > 0 ? ' ' : '') + words[i]

                        const chunk = JSON.stringify({
                            content: currentText,
                            isComplete: i === words.length - 1,
                            timestamp: new Date().toISOString()
                        })

                        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))

                        // Небольшая задержка между словами
                        await new Promise(resolve => setTimeout(resolve, 50))
                    }

                    controller.close()
                } catch (error) {
                    console.error('Streaming error:', error)
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

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })

    } catch (error) {
        console.error('AI chat stream error:', error)

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
