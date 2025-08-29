import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateWithGemini(prompt: string, context?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const fullPrompt = context
            ? `Контекст документа: ${context}\n\nЗадача: ${prompt}\n\nВажно: Сохраните все форматирование, шрифты и стиль оригинального документа. Измените только содержимое согласно запросу.`
            : prompt

        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API error:', error)
        throw new Error('Ошибка при обработке запроса ИИ')
    }
}

export async function analyzeDocumentStyle(content: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Проанализируй стиль и структуру следующего документа:

${content}

Определи:
1. Тип документа (письмо, отчет, статья, etc.)
2. Стиль форматирования (заголовки, абзацы, списки)
3. Тон и стиль письма (официальный, неформальный, etc.)
4. Ключевые элементы структуры

Верни анализ в JSON формате с полями: documentType, formattingStyle, writingTone, keyElements.`

        const result = await model.generateContent(prompt)
        const response = await result.response

        try {
            return JSON.parse(response.text())
        } catch {
            // Если не удалось распарсить JSON, возвращаем базовую структуру
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
