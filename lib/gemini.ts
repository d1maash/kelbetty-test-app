import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    console.error('GEMINI_API_KEY не установлен в переменных окружения')
}

const genAI = new GoogleGenerativeAI(apiKey || '')

export async function generateWithGemini(prompt: string, context?: string) {
    try {
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY не настроен. Проверьте файл .env.local')
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const fullPrompt = context
            ? `Контекст документа: ${context}\n\nЗадача: ${prompt}\n\nВажно: Сохраните все форматирование, шрифты и стиль оригинального документа. Измените только содержимое согласно запросу.`
            : prompt

        console.log('Отправляем запрос в Gemini API...')
        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        const text = response.text()

        if (!text) {
            throw new Error('Gemini API вернул пустой ответ')
        }

        console.log('Получен ответ от Gemini API')
        return text
    } catch (error) {
        console.error('Gemini API error:', error)

        if (error instanceof Error) {
            if (error.message.includes('API_KEY_INVALID')) {
                throw new Error('Неверный API ключ Gemini. Проверьте GEMINI_API_KEY в .env.local')
            }
            if (error.message.includes('PERMISSION_DENIED')) {
                throw new Error('Доступ запрещен. Проверьте настройки API ключа Gemini')
            }
            if (error.message.includes('QUOTA_EXCEEDED')) {
                throw new Error('Превышена квота API Gemini. Проверьте лимиты')
            }
        }

        throw new Error('Ошибка при обработке запроса ИИ: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'))
    }
}

export async function analyzeDocumentStyle(content: string) {
    try {
        if (!apiKey) {
            console.log('API ключ не настроен, используем базовый анализ стиля')
            return {
                documentType: 'document',
                formattingStyle: 'standard',
                writingTone: 'neutral',
                keyElements: ['text']
            }
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `Проанализируй стиль и структуру следующего документа:

${content}

Определи:
1. Тип документа (письмо, отчет, статья, etc.)
2. Стиль форматирования (заголовки, абзацы, списки)
3. Тон и стиль письма (официальный, неформальный, etc.)
4. Ключевые элементы структуры

Верни анализ ТОЛЬКО в JSON формате с полями: documentType, formattingStyle, writingTone, keyElements.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        try {
            // Попытка найти JSON в ответе
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            const jsonText = jsonMatch ? jsonMatch[0] : text
            return JSON.parse(jsonText)
        } catch {
            console.log('Не удалось распарсить JSON ответ от Gemini, используем базовую структуру')
            return {
                documentType: 'document',
                formattingStyle: 'standard',
                writingTone: 'neutral',
                keyElements: ['text']
            }
        }
    } catch (error) {
        console.error('Document analysis error:', error)
        return {
            documentType: 'document',
            formattingStyle: 'standard',
            writingTone: 'neutral',
            keyElements: ['text']
        }
    }
}
