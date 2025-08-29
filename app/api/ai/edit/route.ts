import { NextRequest, NextResponse } from 'next/server'
import { generateWithGemini, analyzeDocumentStyle } from '@/lib/gemini'
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

        const { instruction, documentContent, preserveStyle = true } = await request.json()

        if (!instruction) {
            return NextResponse.json(
                { error: 'Инструкция обязательна' },
                { status: 400 }
            )
        }

        if (!documentContent || documentContent.trim() === '') {
            return NextResponse.json(
                { error: 'Документ пуст. Добавьте текст для редактирования.' },
                { status: 400 }
            )
        }

        let editedContent: string

        if (preserveStyle) {
            // Analyze document style first
            const styleAnalysis = await analyzeDocumentStyle(documentContent)

            // Generate content with style preservation
            const stylePrompt = `
Вы - профессиональный редактор документов. Ваша задача - отредактировать документ согласно инструкции, СТРОГО сохранив оригинальный стиль и форматирование.

АНАЛИЗ СТИЛЯ ДОКУМЕНТА:
- Тип документа: ${styleAnalysis.documentType}
- Стиль форматирования: ${styleAnalysis.formattingStyle}
- Тон письма: ${styleAnalysis.writingTone}
- Ключевые элементы: ${JSON.stringify(styleAnalysis.keyElements)}

ИСХОДНЫЙ ДОКУМЕНТ:
${documentContent}

ИНСТРУКЦИЯ ДЛЯ РЕДАКТИРОВАНИЯ:
${instruction}

ТРЕБОВАНИЯ:
1. Сохраните ТОЧНО такую же структуру документа
2. Сохраните все заголовки, списки, абзацы в том же формате
3. Сохраните тон и стиль письма
4. Внесите изменения ТОЛЬКО согласно инструкции
5. Не добавляйте лишних комментариев или пояснений
6. Верните только отредактированный текст документа

ОТРЕДАКТИРОВАННЫЙ ДОКУМЕНТ:
`
            editedContent = await generateWithGemini(stylePrompt)
        } else {
            const simplePrompt = `
Отредактируйте следующий документ согласно инструкции:

ДОКУМЕНТ:
${documentContent}

ИНСТРУКЦИЯ:
${instruction}

Верните только отредактированный текст без дополнительных комментариев:
`
            editedContent = await generateWithGemini(simplePrompt)
        }

        // Clean up the response
        editedContent = editedContent.trim()

        return NextResponse.json({
            editedContent,
            success: true
        })

    } catch (error) {
        console.error('AI edit error:', error)
        return NextResponse.json(
            { error: 'Ошибка при обработке запроса. Проверьте настройки Gemini API.' },
            { status: 500 }
        )
    }
}
