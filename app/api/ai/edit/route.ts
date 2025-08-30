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
            // Определяем, является ли контент HTML
            const isHtmlContent = documentContent.includes('<') && documentContent.includes('>')

            // Generate content with style preservation
            const stylePrompt = `
Вы - профессиональный редактор документов с поддержкой HTML форматирования. Ваша задача - отредактировать документ согласно инструкции, СТРОГО сохранив оригинальный стиль и форматирование.

ИСХОДНЫЙ ДОКУМЕНТ${isHtmlContent ? ' (HTML формат)' : ''}:
${documentContent}

ИНСТРУКЦИЯ ДЛЯ РЕДАКТИРОВАНИЯ:
${instruction}

ТРЕБОВАНИЯ:
1. ${isHtmlContent ? 'Сохраните ВСЕ HTML теги и структуру (<h1>, <h2>, <p>, <strong>, <em>, <u>, <ul>, <ol>, <li>, <blockquote> и т.д.)' : 'Сохраните структуру текста (заголовки, абзацы, списки)'}
2. Сохраните все стили форматирования (жирный, курсив, подчеркивание, выделение)
3. Сохраните выравнивание текста и отступы
4. Внесите изменения ТОЛЬКО согласно инструкции
5. Не добавляйте лишних комментариев или пояснений
6. ${isHtmlContent ? 'Верните только отредактированный HTML код' : 'Верните только отредактированный текст'}

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
