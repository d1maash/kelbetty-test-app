# 🐳 Docker развертывание Kelbetty

Этот документ описывает, как развернуть приложение Kelbetty с помощью Docker и Docker Compose.

## 📋 Требования

- Docker (версия 20.10+)
- Docker Compose (версия 2.0+)
- Минимум 2GB свободной оперативной памяти
- Минимум 5GB свободного места на диске

## 🚀 Быстрый старт

### 1. Подготовка окружения

```bash
# Клонируйте репозиторий (если еще не сделано)
git clone <your-repo-url>
cd kelbetty-app-test

# Создайте файл с переменными окружения
cp docker.env.example .env
```

### 2. Настройка переменных окружения

Отредактируйте файл `.env` и добавьте ваши реальные ключи API:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Pro Plan
CLERK_PRO_PLAN_ID=your_pro_plan_id_here
```

### 3. Запуск приложения

```bash
# Автоматический запуск (рекомендуется)
./docker-start.sh

# Или вручную
docker-compose up --build -d
```

### 4. Доступ к приложению

- **Основное приложение**: http://localhost
- **Next.js напрямую**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## 🏗️ Архитектура

Приложение состоит из трех основных сервисов:

### 1. PostgreSQL (postgres)
- **Образ**: postgres:15-alpine
- **Порт**: 5432
- **База данных**: kelbetty
- **Пользователь**: kelbetty_user
- **Пароль**: kelbetty_password

### 2. Next.js приложение (app)
- **Порт**: 3000
- **Сборка**: из Dockerfile
- **Переменные окружения**: из .env файла
- **Volumes**: uploads для загруженных файлов

### 3. Nginx (nginx)
- **Образ**: nginx:alpine
- **Порты**: 80 (HTTP), 443 (HTTPS)
- **Роль**: Reverse proxy и статические файлы
- **Конфигурация**: nginx/nginx.conf

## 📁 Структура файлов

```
├── Dockerfile                 # Образ Next.js приложения
├── docker-compose.yml         # Конфигурация всех сервисов
├── docker.env.example         # Пример переменных окружения
├── docker-start.sh           # Скрипт автоматического запуска
├── nginx/
│   ├── nginx.conf            # Основная конфигурация Nginx
│   └── conf.d/
│       └── kelbetty.conf     # Конфигурация сайта
└── DOCKER_README.md          # Этот файл
```

## 🔧 Управление контейнерами

### Основные команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Перезапуск конкретного сервиса
docker-compose restart app

# Просмотр логов
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f postgres

# Выполнение команд в контейнере
docker-compose exec app npx prisma db push
docker-compose exec app npm run build
```

### Работа с базой данных

```bash
# Подключение к PostgreSQL
docker-compose exec postgres psql -U kelbetty_user -d kelbetty

# Выполнение миграций
docker-compose exec app npx prisma db push

# Генерация Prisma клиента
docker-compose exec app npx prisma generate

# Открытие Prisma Studio
docker-compose exec app npx prisma studio
```

## 🔍 Мониторинг и отладка

### Проверка статуса

```bash
# Статус всех контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Проверка здоровья сервисов
docker-compose exec app wget -q --spider http://localhost:3000/api/test
```

### Логи

```bash
# Все логи
docker-compose logs

# Логи конкретного сервиса
docker-compose logs app
docker-compose logs nginx
docker-compose logs postgres

# Следить за логами в реальном времени
docker-compose logs -f app
```

## 🛠️ Разработка

### Пересборка после изменений

```bash
# Пересборка и перезапуск
docker-compose up --build -d

# Только пересборка образа
docker-compose build app
```

### Отладка

```bash
# Запуск в интерактивном режиме
docker-compose run --rm app sh

# Просмотр файлов в контейнере
docker-compose exec app ls -la /app
```

## 🔒 Безопасность

### Продакшен настройки

1. **Измените пароли базы данных** в docker-compose.yml
2. **Настройте SSL сертификаты** в nginx/conf.d/kelbetty.conf
3. **Ограничьте доступ к портам** (уберите 5432 из внешнего доступа)
4. **Используйте Docker secrets** для чувствительных данных

### SSL/HTTPS

Для настройки HTTPS раскомментируйте и настройте HTTPS сервер в `nginx/conf.d/kelbetty.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... остальная конфигурация
}
```

## 🚨 Устранение неполадок

### Частые проблемы

1. **Порт уже используется**
   ```bash
   # Проверьте, что порты свободны
   lsof -i :80
   lsof -i :3000
   lsof -i :5432
   ```

2. **Ошибки базы данных**
   ```bash
   # Пересоздайте базу данных
   docker-compose down -v
   docker-compose up -d
   ```

3. **Проблемы с загрузкой файлов**
   ```bash
   # Проверьте права доступа к volumes
   docker-compose exec app ls -la /app/public/uploads
   ```

4. **Nginx не запускается**
   ```bash
   # Проверьте конфигурацию
   docker-compose exec nginx nginx -t
   ```

### Очистка

```bash
# Удаление всех контейнеров и volumes
docker-compose down -v

# Удаление всех образов
docker-compose down --rmi all

# Полная очистка Docker
docker system prune -a
```

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь, что все переменные окружения настроены
3. Проверьте, что порты не заняты другими приложениями
4. Убедитесь, что у вас достаточно ресурсов (RAM, диск)

---

**Примечание**: Этот Docker setup предназначен для разработки и тестирования. Для продакшена рекомендуется дополнительная настройка безопасности, мониторинга и резервного копирования.
