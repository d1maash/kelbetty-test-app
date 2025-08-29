#!/bin/bash

echo "🚀 Настройка KelBetty приложения..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не найден. Установите Docker Desktop и попробуйте снова."
    exit 1
fi

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js и попробуйте снова."
    exit 1
fi

# Проверяем наличие .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  Файл .env.local не найден. Создайте его на основе env.example"
    echo "Скопируйте env.example в .env.local и заполните необходимые переменные."
    exit 1
fi

echo "📦 Установка зависимостей..."
npm install --legacy-peer-deps

echo "🐳 Запуск PostgreSQL через Docker..."
docker-compose up -d

# Ждем, пока база данных запустится
echo "⏳ Ожидание запуска базы данных..."
sleep 10

echo "🗄️  Настройка базы данных..."
npx prisma generate
npx prisma db push

echo "✅ Настройка завершена!"
echo ""
echo "🎉 Теперь вы можете запустить приложение:"
echo "   npm run dev"
echo ""
echo "📊 Для просмотра данных в базе:"
echo "   npm run db:studio"
echo ""
echo "🔗 Приложение будет доступно по адресу: http://localhost:3000"
