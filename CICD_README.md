# 🚀 CI/CD Pipeline для Kelbetty

Этот документ описывает настройку и использование CI/CD пайплайна для автоматического тестирования, сборки и развертывания приложения Kelbetty.

## 📋 Обзор

CI/CD пайплайн состоит из трех основных workflow:

1. **🧪 CI (Continuous Integration)** - тестирование и проверка кода
2. **🏗️ Build** - сборка и публикация Docker образов
3. **🚀 Deploy** - развертывание на staging и production серверы

## 🔧 Настройка

### 1. GitHub Secrets

Добавьте следующие секреты в настройках репозитория (`Settings > Secrets and variables > Actions`):

#### Обязательные секреты:
```bash
# Docker Registry
GITHUB_TOKEN  # Автоматически доступен

# Staging сервер
STAGING_HOST=your-staging-server.com
STAGING_USER=deploy
STAGING_SSH_KEY=your-private-ssh-key
STAGING_URL=https://staging.your-domain.com

# Production сервер
PRODUCTION_HOST=your-production-server.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=your-private-ssh-key
PRODUCTION_URL=https://your-domain.com

# Безопасность
SNYK_TOKEN=your-snyk-token  # Опционально
```

#### Опциональные секреты:
```bash
# Уведомления
SLACK_WEBHOOK_URL=your-slack-webhook
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
EMAIL_TO=admin@your-domain.com
EMAIL_FROM=noreply@your-domain.com
```

### 2. Настройка серверов

#### Staging сервер:
```bash
# Создайте пользователя для деплоя
sudo adduser deploy
sudo usermod -aG docker deploy

# Создайте директорию проекта
sudo mkdir -p /opt/kelbetty-staging
sudo chown deploy:deploy /opt/kelbetty-staging

# Настройте SSH ключи
sudo -u deploy mkdir -p /home/deploy/.ssh
# Добавьте публичный ключ в /home/deploy/.ssh/authorized_keys
```

#### Production сервер:
```bash
# Создайте пользователя для деплоя
sudo adduser deploy
sudo usermod -aG docker deploy

# Создайте директорию проекта
sudo mkdir -p /opt/kelbetty-production
sudo chown deploy:deploy /opt/kelbetty-production

# Настройте SSL сертификаты
sudo mkdir -p /opt/kelbetty-production/ssl
# Поместите сертификаты в ssl/cert.pem и ssl/key.pem

# Настройте SSH ключи
sudo -u deploy mkdir -p /home/deploy/.ssh
# Добавьте публичный ключ в /home/deploy/.ssh/authorized_keys
```

## 🔄 Workflow Описание

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Триггеры:**
- Push в `main`, `dev`, `dev-test` ветки
- Pull Request в `main`, `dev` ветки

**Этапы:**
1. **🔍 Линтинг** - проверка кода с ESLint
2. **🧪 Тестирование** - запуск тестов с PostgreSQL
3. **🐳 Docker сборка** - проверка сборки Docker образа
4. **🔒 Безопасность** - аудит npm и Snyk сканирование

### 2. Build Workflow (`.github/workflows/build.yml`)

**Триггеры:**
- Push в `main` ветку
- Создание тегов `v*`
- Ручной запуск

**Этапы:**
1. **🏗️ Сборка образов** - создание Docker образов для разных платформ
2. **📤 Публикация** - загрузка в GitHub Container Registry
3. **🔒 Сканирование** - проверка безопасности образов
4. **🚀 Релиз** - создание GitHub релиза (для тегов)

### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

**Триггеры:**
- Push в `main` ветку (автоматический деплой на staging)
- Ручной запуск (выбор окружения)

**Этапы:**
1. **✅ Предварительные проверки** - проверка CI статуса
2. **🧪 Staging деплой** - развертывание на staging сервер
3. **🚀 Production деплой** - развертывание на production сервер
4. **🔄 Откат** - автоматический откат при ошибках

## 🚀 Использование

### Автоматический деплой

1. **Staging**: Push в `main` ветку автоматически деплоит на staging
2. **Production**: Создайте тег `v1.0.0` для автоматического релиза

### Ручной деплой

1. Перейдите в `Actions` в GitHub
2. Выберите нужный workflow
3. Нажмите `Run workflow`
4. Выберите окружение и параметры

### Локальный деплой

```bash
# Staging
./scripts/deploy.sh staging

# Production
./scripts/deploy.sh production

# Бэкап
./scripts/backup.sh production
```

## 📊 Мониторинг

### GitHub Actions

- **Статус**: Проверяйте статус в разделе `Actions`
- **Логи**: Просматривайте логи каждого этапа
- **Уведомления**: Настройте уведомления в Slack/Email

### Приложение

- **Health Check**: `GET /api/test`
- **Метрики**: `GET /api/metrics` (если настроено)
- **Логи**: `docker-compose logs -f app`

### Мониторинг серверов

Включите мониторинг в продакшене:
```bash
# Запуск с мониторингом
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Доступ к Grafana
http://your-server:3001
# Логин: admin / пароль из GRAFANA_PASSWORD
```

## 🔒 Безопасность

### Рекомендации:

1. **SSH ключи**: Используйте отдельные ключи для staging/production
2. **Переменные окружения**: Храните секреты в GitHub Secrets
3. **SSL сертификаты**: Используйте Let's Encrypt или коммерческие сертификаты
4. **Firewall**: Ограничьте доступ к портам базы данных
5. **Регулярные обновления**: Обновляйте Docker образы и зависимости

### Проверки безопасности:

- **Snyk**: Сканирование зависимостей
- **Trivy**: Сканирование Docker образов
- **ESLint**: Проверка кода
- **Rate Limiting**: Ограничение запросов в Nginx

## 🛠️ Устранение неполадок

### Частые проблемы:

1. **Ошибки сборки Docker**
   ```bash
   # Проверьте Dockerfile
   docker build -t test .
   ```

2. **Ошибки деплоя**
   ```bash
   # Проверьте SSH подключение
   ssh deploy@your-server
   
   # Проверьте права доступа
   ls -la /opt/kelbetty-production
   ```

3. **Ошибки базы данных**
   ```bash
   # Проверьте подключение
   docker-compose exec postgres psql -U kelbetty_user -d kelbetty
   ```

4. **Ошибки Nginx**
   ```bash
   # Проверьте конфигурацию
   docker-compose exec nginx nginx -t
   
   # Просмотрите логи
   docker-compose logs nginx
   ```

### Откат изменений:

```bash
# Автоматический откат через GitHub Actions
# Или ручной откат:
git revert HEAD
git push origin main
```

## 📈 Масштабирование

### Горизонтальное масштабирование:

1. **Load Balancer**: Добавьте несколько экземпляров приложения
2. **Database**: Настройте репликацию PostgreSQL
3. **CDN**: Используйте CloudFlare или AWS CloudFront
4. **Кэширование**: Добавьте Redis для кэширования

### Вертикальное масштабирование:

1. **Ресурсы**: Увеличьте лимиты в docker-compose.prod.yml
2. **Мониторинг**: Используйте Prometheus + Grafana
3. **Алерты**: Настройте уведомления о превышении лимитов

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в GitHub Actions
2. Проверьте статус серверов
3. Проверьте переменные окружения
4. Обратитесь к команде разработки

---

**Примечание**: Этот CI/CD пайплайн предназначен для продакшена. Для разработки используйте локальные команды из `DOCKER_README.md`.
