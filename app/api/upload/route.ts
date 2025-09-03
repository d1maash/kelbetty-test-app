import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { parseFile } from '@/lib/file-parsers'
import { parseFileWithFormatting, saveOriginalFile } from '@/lib/advanced-file-parsers'
import { isFileTypeSupported } from '@/lib/file-utils'
import { analyzeDocument } from '@/lib/document-analyzer'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        console.log('Upload API: Начало обработки запроса')

        const { userId } = auth()

        if (!userId) {
            console.log('Upload API: Пользователь не авторизован')
            return NextResponse.json(
                { error: 'Unauthorized - необходима авторизация' },
                { status: 401 }
            )
        }

        console.log('Upload API: Пользователь авторизован:', userId)

        // Get form data
        console.log('Upload API: Получаем данные формы')
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            console.log('Upload API: Файл не найден в запросе')
            return NextResponse.json(
                { error: 'Файл не найден в запросе' },
                { status: 400 }
            )
        }

        console.log('Upload API: Получен файл:', file.name, 'размер:', file.size, 'тип:', file.type)

        // Check file type
        if (!isFileTypeSupported(file.name)) {
            console.log('Upload API: Неподдерживаемый тип файла:', file.name)
            return NextResponse.json(
                { error: `Неподдерживаемый тип файла: ${file.name}` },
                { status: 400 }
            )
        }

        // Check file size (10MB limit)
        const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760')
        if (file.size > maxSize) {
            console.log('Upload API: Файл слишком большой:', file.size)
            return NextResponse.json(
                { error: `Файл слишком большой (максимум ${Math.round(maxSize / 1024 / 1024)}MB)` },
                { status: 400 }
            )
        }

        // Convert file to buffer
        console.log('Upload API: Конвертируем файл в буфер')
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Автоматический анализ документа
        console.log('Upload API: Анализируем тип документа')
        let documentAnalysis
        try {
            documentAnalysis = await analyzeDocument(buffer, file.name, file.type)
            console.log('Upload API: Тип документа определен:', documentAnalysis.detectedType, 'с уверенностью:', documentAnalysis.confidence)
        } catch (error) {
            console.warn('Upload API: Ошибка анализа документа:', error)
            // Создаем базовый анализ если что-то пошло не так
            documentAnalysis = {
                detectedType: 'unknown',
                mimeType: file.type || 'application/octet-stream',
                confidence: 0.5,
                metadata: {},
                preview: 'Документ загружен',
                isReadable: true
            }
        }

        // Parse file content
        console.log('Upload API: Парсим содержимое файла с сохранением форматирования')
        const parsedDocument = await parseFileWithFormatting(buffer, file.type, file.name)
        console.log('Upload API: Файл успешно распарсен, длина контента:', parsedDocument.content.length)

        console.log('Upload API: Сохраняем оригинальный файл')
        const filePath = await saveOriginalFile(buffer, file.name, userId)
        console.log('Upload API: Оригинальный файл сохранен:', filePath)

        // Get or create user in database
        console.log('Upload API: Ищем пользователя в базе данных')
        let user = await db.user.findUnique({
            where: { clerkId: userId }
        })

        if (!user) {
            console.log('Upload API: Пользователь не найден, создаем нового')
            const clerkUser = await currentUser()
            user = await db.user.create({
                data: {
                    clerkId: userId,
                    email: clerkUser?.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`,
                    name: clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null,
                }
            })
            console.log('Upload API: Пользователь создан:', user.id)
        } else {
            console.log('Upload API: Пользователь найден:', user.id)
        }

        // Create document in database
        console.log('Upload API: Создаем документ в базе данных')
        console.log('Upload API: Данные для создания:', {
            title: file.name.replace(/\.[^/.]+$/, ''),
            contentLength: parsedDocument.content?.length || 0,
            htmlContentLength: parsedDocument.htmlContent?.length || 0,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: filePath,
            userId: user.id,
        })

        // Проверяем и обрезаем слишком длинный контент если нужно
        let contentToSave = parsedDocument.content || ''
        let htmlContentToSave = parsedDocument.htmlContent || null

        // Ограничиваем размер контента (PostgreSQL TEXT может хранить до 1GB, но лучше быть осторожным)
        const MAX_CONTENT_LENGTH = 10 * 1024 * 1024 // 10MB

        if (contentToSave.length > MAX_CONTENT_LENGTH) {
            console.log('Upload API: Контент слишком длинный, обрезаем:', contentToSave.length)
            contentToSave = contentToSave.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Контент обрезан из-за большого размера]'
        }

        if (htmlContentToSave && htmlContentToSave.length > MAX_CONTENT_LENGTH) {
            console.log('Upload API: HTML контент слишком длинный, обрезаем:', htmlContentToSave.length)
            htmlContentToSave = htmlContentToSave.substring(0, MAX_CONTENT_LENGTH) + '\n\n<!-- Контент обрезан из-за большого размера -->'
        }

        const document = await db.document.create({
            data: {
                title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                content: contentToSave,
                htmlContent: htmlContentToSave,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                filePath: filePath,
                detectedType: documentAnalysis.detectedType,
                mimeType: documentAnalysis.mimeType,
                userId: user.id,
            }
        })

        console.log('Upload API: Документ создан:', document.id)

        return NextResponse.json({
            success: true,
            document: {
                id: document.id,
                title: document.title,
                content: document.content,
                fileName: document.fileName,
                fileType: document.fileType,
                fileSize: document.fileSize,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                style: document.style
            }
        })

    } catch (error) {
        console.error('Upload error:', error)

        // Детальная информация об ошибке
        let errorMessage = 'Ошибка при загрузке файла'
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
