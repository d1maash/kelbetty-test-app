import { PrismaClient } from '@prisma/client'

// Проверяем наличие DATABASE_URL
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    console.error('❌ DATABASE_URL не найден в переменных окружения')
    console.error('Проверьте файлы .env.local и .env')
    console.error('Текущие переменные окружения:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query'],
        datasources: {
            db: {
                url: databaseUrl || "postgresql://kelbetty_user:kelbetty_password@localhost:5432/kelbetty?schema=public"
            }
        }
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Тестируем подключение при инициализации
if (databaseUrl) {
    console.log('✅ DATABASE_URL найден, подключение к базе данных настроено')
} else {
    console.log('⚠️  DATABASE_URL не найден, используется значение по умолчанию')
}
