#!/usr/bin/env node

// Загружаем переменные из .env файлов
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

console.log('🔍 Проверка переменных окружения...\n')

const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'GEMINI_API_KEY'
]

let allGood = true

requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
        if (varName.includes('KEY') || varName.includes('SECRET')) {
            // Скрываем ключи
            const masked = value.substring(0, 10) + '...' + value.substring(value.length - 10)
            console.log(`✅ ${varName}: ${masked}`)
        } else {
            console.log(`✅ ${varName}: ${value}`)
        }
    } else {
        console.log(`❌ ${varName}: НЕ НАЙДЕН`)
        allGood = false
    }
})

console.log('\n' + '='.repeat(50))

if (allGood) {
    console.log('🎉 Все переменные окружения настроены!')
} else {
    console.log('⚠️  Некоторые переменные не настроены.')
    console.log('Скопируйте env.example в .env.local и заполните значения.')
}

console.log('\n📁 Найденные .env файлы:')
const fs = require('fs')
const envFiles = ['.env.local', '.env', 'env.example']
envFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`)
    } else {
        console.log(`❌ ${file}`)
    }
})
