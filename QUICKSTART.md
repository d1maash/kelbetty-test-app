# 🚀 Быстрый запуск KelBetty

## 📋 Что нужно сделать:

### 1. Проверьте Docker
```bash
docker ps
```
Если PostgreSQL не запущен:
```bash
docker-compose up -d
```

### 2. Проверьте переменные окружения
```bash
npm run check-env
```

### 3. Настройте базу данных
```bash
npm run db:push
```

### 4. Запустите приложение
```bash
npm run dev
```

## 🔧 Если что-то не работает:

### Проблема с базой данных:
```bash
# Перезапустить контейнер
docker-compose down && docker-compose up -d

# Подождать 10 секунд и повторить
npm run db:push
```

### Проблема с переменными окружения:
1. Скопируйте `env.example` в `.env.local`
2. Заполните настоящие ключи:
   - Clerk: https://clerk.com
   - Gemini: https://ai.google.dev

### Проблема с Clerk:
- Замените `your_clerk_publishable_key_here` на настоящий ключ
- Замените `your_clerk_secret_key_here` на настоящий секрет

## 🧪 Тестирование:

### Тест базы данных:
http://localhost:3000/api/test

### Тест загрузки файлов:
http://localhost:3000/test-upload

### Тест ИИ:
http://localhost:3000/api/test-ai

## 📱 Страницы приложения:

- **Главная**: http://localhost:3000
- **Приложение**: http://localhost:3000/app  
- **Цены**: http://localhost:3000/pricing
- **Enterprise**: http://localhost:3000/enterprise

## ⚡ Полезные команды:

```bash
npm run check-env      # Проверка переменных
npm run db:studio      # Просмотр базы данных
npm run docker:up      # Запуск PostgreSQL
npm run docker:down    # Остановка PostgreSQL
```

## 🐛 Типичные ошибки:

1. **"Invalid publishable key"** → Настройте Clerk ключи
2. **"DATABASE_URL not found"** → Проверьте .env.local
3. **"Can't resolve 'fs'"** → Перезапустите сервер
4. **"Invalid time value"** → Исправлено в последней версии

---

💡 **Совет**: Используйте `npm run dev` вместо `npx next dev` - он автоматически загружает переменные окружения!
