import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        // Проверяем подключение к базе данных
        const result = await db.$queryRaw`SELECT 1 as test`

        return NextResponse.json({
            status: 'success',
            message: 'База данных подключена успешно',
            database: result,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Database connection error:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Ошибка подключения к базе данных',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }, { status: 500 })
    }
}
