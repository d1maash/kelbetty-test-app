import { NextRequest, NextResponse } from 'next/server'
import { parseFileWithFormatting } from '@/lib/advanced-file-parsers'

export async function POST(request: NextRequest) {
    try {
        console.log('Test Upload: Начало обработки запроса')

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
        }

        console.log('Test Upload: Файл получен:', {
            name: file.name,
            type: file.type,
            size: file.size
        })

        // Convert to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        console.log('Test Upload: Буфер создан, размер:', buffer.length)

        // Parse file
        const parsedDocument = await parseFileWithFormatting(buffer, file.type, file.name)

        console.log('Test Upload: Файл распарсен:', {
            contentLength: parsedDocument.content.length,
            htmlContentLength: parsedDocument.htmlContent?.length || 0,
            metadata: parsedDocument.metadata
        })

        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            contentLength: parsedDocument.content.length,
            htmlContentLength: parsedDocument.htmlContent?.length || 0,
            contentPreview: parsedDocument.content.substring(0, 500) + (parsedDocument.content.length > 500 ? '...' : ''),
            hasHtml: !!parsedDocument.htmlContent,
            metadata: parsedDocument.metadata
        })

    } catch (error) {
        console.error('Test Upload error:', error)
        return NextResponse.json({
            error: 'Ошибка при тестировании загрузки',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}
