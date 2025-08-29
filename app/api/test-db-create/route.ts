import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        console.log('Testing database document creation...')

        // Создаем тестовый документ
        const testDocument = await db.document.create({
            data: {
                title: "Тестовый документ",
                content: "Это тестовое содержимое документа для проверки работы базы данных.",
                htmlContent: "<div><p>Это <strong>HTML</strong> версия тестового документа.</p></div>",
                fileName: "test.txt",
                fileType: "text/plain",
                fileSize: 100,
                filePath: "/test/path.txt",
                userId: "test-user-id"
            },
            include: {
                style: true
            }
        })

        console.log('Test document created successfully:', testDocument.id)

        return NextResponse.json({
            success: true,
            message: "Документ успешно создан в базе данных",
            document: {
                id: testDocument.id,
                title: testDocument.title,
                contentLength: testDocument.content.length,
                htmlContentLength: testDocument.htmlContent?.length || 0,
                fileName: testDocument.fileName,
                fileType: testDocument.fileType,
                createdAt: testDocument.createdAt
            }
        })

    } catch (error) {
        console.error('Database test error:', error)

        return NextResponse.json({
            success: false,
            error: 'Ошибка при создании документа в базе данных',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}
