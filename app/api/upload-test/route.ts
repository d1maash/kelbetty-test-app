import { NextRequest, NextResponse } from 'next/server'
import { parseFile } from '@/lib/file-parsers'
import { isFileTypeSupported } from '@/lib/file-utils'

// Тестовый API для загрузки файлов без авторизации
export async function POST(request: NextRequest) {
    try {
        console.log('Test Upload API: Начало обработки запроса')

        // Get form data
        console.log('Test Upload API: Получаем данные формы')
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            console.log('Test Upload API: Файл не найден в запросе')
            return NextResponse.json(
                { error: 'Файл не найден в запросе' },
                { status: 400 }
            )
        }

        console.log('Test Upload API: Получен файл:', file.name, 'размер:', file.size, 'тип:', file.type)

        // Check file type
        if (!isFileTypeSupported(file.name)) {
            console.log('Test Upload API: Неподдерживаемый тип файла:', file.name)
            return NextResponse.json(
                { error: `Неподдерживаемый тип файла: ${file.name}` },
                { status: 400 }
            )
        }

        // Check file size (10MB limit)
        const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760')
        if (file.size > maxSize) {
            console.log('Test Upload API: Файл слишком большой:', file.size)
            return NextResponse.json(
                { error: `Файл слишком большой (максимум ${Math.round(maxSize / 1024 / 1024)}MB)` },
                { status: 400 }
            )
        }

        // Convert file to buffer
        console.log('Test Upload API: Конвертируем файл в буфер')
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Parse file content
        console.log('Test Upload API: Парсим содержимое файла')
        const content = await parseFile(buffer, file.type, file.name)
        console.log('Test Upload API: Файл успешно распарсен, длина контента:', content.length)

        return NextResponse.json({
            success: true,
            message: 'Файл успешно обработан (тестовый режим)',
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
                contentLength: content.length,
                contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
            }
        })

    } catch (error) {
        console.error('Test Upload error:', error)

        // Детальная информация об ошибке
        let errorMessage = 'Ошибка при обработке файла'
        if (error instanceof Error) {
            errorMessage = error.message
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            })
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: error instanceof Error ? error.message : 'Неизвестная ошибка'
            },
            { status: 500 }
        )
    }
}
