import { NextRequest, NextResponse } from 'next/server'
import { generateWithGemini } from '@/lib/gemini'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth()

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { instruction, documentId } = await request.json()

        if (!instruction) {
            return NextResponse.json(
                { error: 'Инструкция обязательна' },
                { status: 400 }
            )
        }

        if (!documentId) {
            return NextResponse.json(
                { error: 'ID документа обязателен' },
                { status: 400 }
            )
        }

        // Получаем документ из базы данных
        const document = await db.document.findFirst({
            where: {
                id: documentId,
                user: {
                    clerkId: userId
                }
            }
        })

        if (!document) {
            return NextResponse.json({ error: 'Документ не найден' }, { status: 404 })
        }

        // Определяем, есть ли форматирование
        const hasFormatting = document.htmlContent && document.htmlContent.length > 0
        const contentToEdit = hasFormatting ? document.htmlContent : document.content

        if (!contentToEdit || contentToEdit.trim() === '') {
            return NextResponse.json(
                { error: 'Документ пуст. Добавьте содержимое для редактирования.' },
                { status: 400 }
            )
        }

        // Создаем промпт с учетом типа документа
        const getFileTypeDescription = (fileType: string | null) => {
            if (!fileType) return 'текстовый документ'
            if (fileType.includes('word')) return 'документ Microsoft Word'
            if (fileType.includes('presentation')) return 'презентация PowerPoint'
            if (fileType.includes('sheet') || fileType.includes('excel')) return 'таблица Excel'
            if (fileType.includes('pdf')) return 'PDF документ'
            return 'документ'
        }

        const prompt = `
Ты - эксперт по редактированию документов с сохранением оригинального форматирования.

ИНФОРМАЦИЯ О ДОКУМЕНТЕ:
- Тип: ${getFileTypeDescription(document.fileType)}
- Название: ${document.fileName || 'Без названия'}
- Содержит форматирование: ${hasFormatting ? 'Да (HTML)' : 'Нет (только текст)'}

ЗАДАЧА:
Отредактируй документ согласно инструкции пользователя, ОБЯЗАТЕЛЬНО сохранив:

${hasFormatting ? `
ДЛЯ HTML ДОКУМЕНТА:
1. Все HTML теги и их структуру
2. CSS стили и классы (word-document, powerpoint-document, excel-document, pdf-document)
3. Форматирование таблиц, списков, заголовков
4. Отступы, шрифты и цвета
5. Структуру слайдов (для PowerPoint)
6. Структуру листов (для Excel)
` : `
ДЛЯ ТЕКСТОВОГО ДОКУМЕНТА:
1. Структуру абзацев
2. Переносы строк
3. Отступы и пробелы
4. Общий стиль изложения
`}

ВАЖНЫЕ ПРАВИЛА:
- НЕ удаляй существующие HTML теги и CSS стили
- НЕ меняй структуру документа без необходимости
- Сохраняй оригинальный стиль письма и тон
- Отвечай ${hasFormatting ? 'в HTML формате' : 'только текстом'}
- НЕ добавляй комментарии или пояснения

ИНСТРУКЦИЯ ПОЛЬЗОВАТЕЛЯ:
${instruction}

${hasFormatting ? 'HTML СОДЕРЖИМОЕ:' : 'ТЕКСТОВОЕ СОДЕРЖИМОЕ:'}
${contentToEdit}

${hasFormatting ? 'ОТРЕДАКТИРОВАННОЕ HTML:' : 'ОТРЕДАКТИРОВАННЫЙ ТЕКСТ:'}
`

        console.log('Отправляем запрос в Gemini для редактирования с форматированием...')
        const editedContent = await generateWithGemini(prompt)

        // Очищаем ответ
        const cleanedContent = editedContent.trim()

        // Обновляем документ в базе данных
        const updatedDocument = await db.document.update({
            where: { id: document.id },
            data: {
                content: hasFormatting ?
                    // Если есть HTML, извлекаем текст для content поля
                    cleanedContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
                    : cleanedContent,
                htmlContent: hasFormatting ? cleanedContent : null,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            editedContent: cleanedContent,
            hasFormatting,
            document: {
                id: updatedDocument.id,
                title: updatedDocument.title,
                content: updatedDocument.content,
                htmlContent: updatedDocument.htmlContent,
                updatedAt: updatedDocument.updatedAt
            }
        })

    } catch (error) {
        console.error('AI edit formatted error:', error)

        let errorMessage = 'Ошибка при обработке запроса ИИ'

        if (error instanceof Error) {
            if (error.message.includes('GEMINI_API_KEY')) {
                errorMessage = 'Не настроен ключ Gemini API. Проверьте переменные окружения.'
            } else if (error.message.includes('quota')) {
                errorMessage = 'Превышена квота API Gemini. Попробуйте позже.'
            } else if (error.message.includes('permission')) {
                errorMessage = 'Нет доступа к Gemini API. Проверьте ключ и настройки.'
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
