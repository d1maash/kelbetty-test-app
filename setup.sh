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
    echo "⚠️  Файл .env.local не найден. Создаем из примера..."
    cp env.example .env.local
    echo "✅ Создан файл .env.local"
    echo ""
    echo "⚠️  ВАЖНО: Настройте следующие переменные в .env.local:"
    echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (получите на clerk.com)"
    echo "   - CLERK_SECRET_KEY (получите на clerk.com)"
    echo "   - GEMINI_API_KEY (получите на ai.google.dev)"
    echo ""
    read -p "Нажмите Enter после настройки переменных окружения..."
fi

# Копируем .env.local в .env для Prisma
cp .env.local .env

echo "📦 Установка зависимостей..."
npm install --legacy-peer-deps

echo "🐳 Запуск PostgreSQL через Docker..."
docker-compose up -d

# Проверяем статус контейнера
echo "🔍 Проверяем статус базы данных..."
sleep 5

if ! docker ps | grep -q "kelbetty-postgres"; then
    echo "❌ Контейнер PostgreSQL не запущен. Проверьте Docker."
    exit 1
fi

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
echo "🔧 Полезные команды:"
echo "   npm run db:studio     - Просмотр данных в базе"
echo "   docker-compose logs   - Логи базы данных"
echo "   npm run docker:down   - Остановить базу данных"
echo ""
echo "🌐 После запуска приложение будет доступно:"
echo "   http://localhost:3000        - Главная страница"
echo "   http://localhost:3000/app    - Приложение"
echo "   http://localhost:3000/api/test - Тест базы данных"
echo ""
echo "⚠️  Если возникли проблемы:"
echo "   1. Проверьте настройки в .env.local"
echo "   2. Убедитесь что Docker контейнер запущен: docker ps"
echo "   3. Проверьте логи: docker-compose logs"