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

        const { instruction, documentContent, preserveStyle } = await request.json()

        if (!instruction || !documentContent) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        let editedContent: string

        if (preserveStyle) {
            // Analyze document style first
            const styleAnalysis = await analyzeDocumentStyle(documentContent)

            // Generate content with style preservation
            const stylePrompt = `
Стиль документа: ${JSON.stringify(styleAnalysis)}
Исходный документ: ${documentContent}

Инструкция: ${instruction}

ВАЖНО: Сохраните точно такой же стиль форматирования, структуру, тон и формат как в исходном документе. Измените только содержание согласно инструкции.
`
            editedContent = await generateWithGemini(stylePrompt)
        } else {
            editedContent = await generateWithGemini(instruction, documentContent)
        }

        return NextResponse.json({
            editedContent,
            success: true
        })

    } catch (error) {
        console.error('AI edit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
