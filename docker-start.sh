#!/bin/bash

# Скрипт для запуска Kelbetty приложения в Docker

set -e

echo "🚀 Запуск Kelbetty приложения в Docker..."

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаем из примера..."
    if [ -f docker.env.example ]; then
        cp docker.env.example .env
        echo "✅ Файл .env создан из docker.env.example"
        echo "📝 Пожалуйста, отредактируйте .env файл и добавьте ваши реальные ключи API"
        echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        echo "   - CLERK_SECRET_KEY"
        echo "   - GEMINI_API_KEY"
        echo "   - CLERK_PRO_PLAN_ID"
        read -p "Нажмите Enter после редактирования .env файла..."
    else
        echo "❌ Файл docker.env.example не найден!"
        exit 1
    fi
fi

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down

# Собираем и запускаем контейнеры
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose up --build -d

# Ждем запуска базы данных
echo "⏳ Ждем запуска базы данных..."
sleep 10

# Выполняем миграции Prisma
echo "🗄️  Выполняем миграции базы данных..."
docker-compose exec app npx prisma db push

# Проверяем статус контейнеров
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "✅ Приложение запущено!"
echo "🌐 Доступно по адресу: http://localhost"
echo "📱 Next.js приложение: http://localhost:3000"
echo "🗄️  PostgreSQL: localhost:5432"
echo ""
echo "📋 Полезные команды:"
echo "   docker-compose logs -f app     # Просмотр логов приложения"
echo "   docker-compose logs -f nginx   # Просмотр логов Nginx"
echo "   docker-compose logs -f postgres # Просмотр логов базы данных"
echo "   docker-compose down            # Остановка всех контейнеров"
echo "   docker-compose restart app     # Перезапуск приложения"
echo ""
