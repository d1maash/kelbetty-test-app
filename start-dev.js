#!/usr/bin/env node

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

console.log('🚀 Запуск KelBetty в режиме разработки...')
console.log('📋 Проверяем переменные окружения...')

const requiredVars = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY']
let allGood = true

requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        console.log(`❌ ${varName} не найден`)
        allGood = false
    } else {
        console.log(`✅ ${varName} настроен`)
    }
})

if (!allGood) {
    console.log('\n⚠️  Некоторые переменные не настроены!')
    console.log('Запустите: npm run check-env для диагностики')
    process.exit(1)
}

console.log('\n🗄️  Проверяем подключение к базе данных...')

// Проверяем подключение к базе данных
const { exec } = require('child_process')

// Запускаем Next.js сервер разработки
console.log('\n▶️  Запускаем Next.js сервер...')
const nextProcess = exec('npx next dev', (error, stdout, stderr) => {
    if (error) {
        console.error('Ошибка запуска Next.js:', error)
        return
    }
})

nextProcess.stdout.on('data', (data) => {
    console.log(data.toString())
})

nextProcess.stderr.on('data', (data) => {
    console.error(data.toString())
})

// Обработка сигналов для корректного завершения
process.on('SIGINT', () => {
    console.log('\n🛑 Остановка сервера...')
    nextProcess.kill('SIGINT')
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log('\n🛑 Остановка сервера...')
    nextProcess.kill('SIGTERM')
    process.exit(0)
})
