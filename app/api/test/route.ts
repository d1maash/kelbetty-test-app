import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        console.log('Test API: Проверяем переменные окружения')
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
        console.log('NODE_ENV:', process.env.NODE_ENV)

        // Проверяем подключение к базе данных
        console.log('Test API: Пытаемся подключиться к базе данных')
        const result = await db.$queryRaw`SELECT 1 as test, current_database() as db_name, version() as db_version`

        console.log('Test API: Подключение успешно')

        return NextResponse.json({
            status: 'success',
            message: 'База данных подключена успешно',
            database: result,
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
                DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...'
            },
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Database connection error:', error)

        const errorDetails = {
            message: error instanceof Error ? error.message : 'Неизвестная ошибка',
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined
        }

        return NextResponse.json({
            status: 'error',
            message: 'Ошибка подключения к базе данных',
            error: errorDetails,
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
                DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...'
            }
        }, { status: 500 })
    }
}
