# KelBetty - ИИ Редактор Документов

Современное приложение для создания и редактирования документов с помощью искусственного интеллекта, которое сохраняет ваш уникальный стиль форматирования.

## Особенности

- 🤖 **ИИ-редактирование** с сохранением стиля документа
- 📝 **Умное форматирование** - ИИ анализирует и сохраняет структуру документа
- 📁 **Загрузка файлов** - поддержка Word, PowerPoint, Excel, PDF
- 🗄️ **База данных PostgreSQL** для надежного хранения документов
- 🔐 **Безопасная авторизация** через Clerk
- 💳 **Система подписок** с планами Free и Pro
- 🌙 **Темная/светлая тема** с автоматическим переключением
- 📱 **Адаптивный дизайн** для всех устройств

## Технологии

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Prisma ORM, PostgreSQL
- **UI**: ShadCN UI, Radix UI
- **Авторизация**: Clerk
- **ИИ**: Google Gemini API
- **Загрузка файлов**: React Dropzone, Mammoth, PDF-Parse, XLSX
- **Стилизация**: Tailwind CSS с кастомными градиентами

## Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd kelbetty-app-test
```

2. **Установите зависимости**
```bash
npm install --legacy-peer-deps
```

3. **Запустите PostgreSQL через Docker**
```bash
# Запуск базы данных
docker-compose up -d

# Проверьте, что контейнер запущен
docker ps
```

4. **Настройте переменные окружения**

Создайте файл `.env.local` в корне проекта:

```env
# Database
DATABASE_URL="postgresql://kelbetty_user:kelbetty_password@localhost:5432/kelbetty?schema=public"

# Clerk Keys (получите на https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# Gemini API (получите на https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Pro Plan ID (настройте в Clerk)
CLERK_PRO_PLAN_ID=cplan_31yPUkRmM61c6bZJxWpb0wFzE8L

# Upload settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

5. **Настройте базу данных**
```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma db push

# (Опционально) Просмотр данных через Prisma Studio
npx prisma studio
```

6. **Запустите проект**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Настройка Clerk

1. Создайте аккаунт на [Clerk.com](https://clerk.com)
2. Создайте новое приложение
3. Скопируйте ключи в `.env.local`
4. Настройте план подписки с ID `cplan_31yPUkRmM61c6bZJxWpb0wFzE8L`

## Настройка Gemini API

1. Перейдите на [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Создайте API ключ
3. Добавьте ключ в `.env.local`

## Структура проекта

```
kelbetty-app-test/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Страницы авторизации
│   ├── api/               # API маршруты
│   ├── app/               # Главное приложение
│   ├── enterprise/        # Корпоративная страница
│   └── pricing/           # Страница с ценами
├── components/            # React компоненты
│   ├── document/          # Компоненты редактора
│   └── ui/                # UI компоненты
├── lib/                   # Утилиты и конфигурация
└── types/                 # TypeScript типы
```

## Доступные скрипты

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для продакшена
- `npm run start` - запуск продакшен сборки
- `npm run lint` - проверка кода

## Функциональность

### Редактор документов
- Создание и редактирование документов
- Форматирование текста (жирный, курсив, списки, заголовки)
- Автосохранение изменений в PostgreSQL
- Экспорт документов

### Загрузка файлов
- **Word документы** (.doc, .docx) - полное извлечение текста
- **PowerPoint презентации** (.ppt, .pptx) - извлечение текста слайдов
- **Excel таблицы** (.xls, .xlsx) - извлечение данных из ячеек
- **PDF документы** - извлечение текстового содержимого
- **Текстовые файлы** (.txt) - прямое чтение
- Drag & Drop интерфейс для удобной загрузки
- Прогресс-бар загрузки файлов

### ИИ-помощник
- Редактирование текста с сохранением стиля
- Анализ структуры документа
- Умные предложения по улучшению
- Чат-интерфейс для взаимодействия
- Интеграция с Google Gemini API

### База данных
- Надежное хранение документов в PostgreSQL
- Связь документов с пользователями через Clerk
- Метаданные файлов (размер, тип, имя)
- История изменений документов

### Система подписок
- **Free**: 5 документов в месяц, базовые функции
- **Pro**: Неограниченные документы, расширенные функции
- **Enterprise**: Корпоративные функции, персональная поддержка

## Устранение проблем

### Ошибка "Module not found: Can't resolve 'fs'"

Если вы столкнулись с этой ошибкой, убедитесь что:

1. Парсинг файлов происходит только на серверной стороне (в API routes)
2. Next.js конфигурация правильно настроена для исключения Node.js модулей из клиентской сборки
3. Клиентские компоненты используют только `lib/file-utils.ts`, а не `lib/file-parsers.ts`

### Проблемы с базой данных

1. Убедитесь, что Docker запущен: `docker ps`
2. Перезапустите контейнер: `docker-compose down && docker-compose up -d`
3. Примените миграции: `npx prisma db push`

## Развертывание

Приложение готово для развертывания на Vercel:

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения
3. Настройте PostgreSQL в продакшене (например, Supabase, Neon, или Railway)
4. Разверните приложение

## Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории.

## Лицензия

MIT License
