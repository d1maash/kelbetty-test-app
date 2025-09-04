# 🚀 Простой деплой на VPS сервер

Этот документ описывает простой способ развертывания Kelbetty на VPS сервере с автоматическим деплоем через GitHub Actions.

## 📋 Требования

- VPS сервер с Ubuntu/Debian
- Root доступ к серверу
- GitHub репозиторий с кодом

## 🔧 Настройка сервера

### 1. Подключение к серверу

```bash
ssh root@YOUR_SERVER_IP
# Введите пароль от сервера
```

### 2. Автоматическая настройка

```bash
# Скачайте и запустите скрипт настройки
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/kelbetty-app-test/main/scripts/setup-server.sh | bash
```

Или вручную:

```bash
# Клонируйте репозиторий
cd /home
git clone https://github.com/YOUR_USERNAME/kelbetty-app-test.git kelbetty-test-app
cd kelbetty-test-app

# Запустите скрипт настройки
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 3. Настройка переменных окружения

```bash
cd /home/kelbetty-test-app
cp env.production.example .env.production
nano .env.production
```

Заполните реальные значения:
```bash
# Database
POSTGRES_PASSWORD=your_secure_password

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_secret

# Gemini API
GEMINI_API_KEY=your_gemini_key

# Clerk Pro Plan
CLERK_PRO_PLAN_ID=your_pro_plan_id
```

## 🔑 Настройка GitHub Secrets

Добавьте в настройки репозитория (`Settings > Secrets and variables > Actions`):

### Обязательные секреты:
```bash
SERVER_IP=your_server_ip_address
SERVER_SSH_KEY=your_private_ssh_key
```

### Как получить SSH ключ:
```bash
# На сервере выполните:
cat /root/.ssh/id_rsa
# Скопируйте весь вывод и добавьте как SERVER_SSH_KEY
```

## 🚀 Первый запуск

### 1. Запуск приложения

```bash
cd /home/kelbetty-test-app
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Проверка работы

```bash
# Проверка статуса контейнеров
docker-compose -f docker-compose.prod.yml ps

# Проверка логов
docker-compose -f docker-compose.prod.yml logs -f app

# Проверка API
curl http://localhost/api/test
```

### 3. Проверка в браузере

Откройте `http://YOUR_SERVER_IP` в браузере

## 🔄 Автоматический деплой

После настройки, деплой происходит автоматически:

### Автоматический деплой:
- Push в `main` ветку → автоматический деплой
- Создание тега `v1.0.0` → автоматический релиз

### Ручной деплой:
1. Перейдите в `Actions` в GitHub
2. Выберите `Deploy - Развертывание на продакшен`
3. Нажмите `Run workflow`

## 📊 Мониторинг

### Проверка статуса:
```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats

# Логи приложения
docker-compose -f docker-compose.prod.yml logs -f app

# Логи Nginx
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Автоматические бэкапы:
```bash
# Просмотр логов бэкапов
tail -f /var/log/kelbetty-backup.log

# Ручной бэкап
cd /home/kelbetty-test-app
./scripts/backup.sh production
```

## 🛠️ Управление

### Systemd сервис:
```bash
# Запуск
systemctl start kelbetty

# Остановка
systemctl stop kelbetty

# Статус
systemctl status kelbetty

# Перезапуск
systemctl restart kelbetty
```

### Docker команды:
```bash
# Остановка всех сервисов
docker-compose -f docker-compose.prod.yml down

# Перезапуск приложения
docker-compose -f docker-compose.prod.yml restart app

# Обновление образов
docker-compose -f docker-compose.prod.yml pull

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔒 Безопасность

### Firewall:
```bash
# Проверка статуса
ufw status

# Открыть порты
ufw allow ssh
ufw allow 80
ufw allow 443
```

### SSL сертификаты:
```bash
# Установка Let's Encrypt
apt install certbot

# Получение сертификата
certbot certonly --standalone -d your-domain.com

# Копирование сертификатов
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /home/kelbetty-test-app/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /home/kelbetty-test-app/ssl/key.pem
```

## 🚨 Устранение неполадок

### Проблемы с деплоем:
```bash
# Проверка SSH подключения
ssh root@YOUR_SERVER_IP

# Проверка Git
cd /home/kelbetty-test-app
git status
git pull origin main
```

### Проблемы с Docker:
```bash
# Перезапуск Docker
systemctl restart docker

# Очистка неиспользуемых образов
docker system prune -a

# Проверка места на диске
df -h
docker system df
```

### Проблемы с приложением:
```bash
# Проверка логов
docker-compose -f docker-compose.prod.yml logs app

# Проверка базы данных
docker-compose -f docker-compose.prod.yml exec postgres psql -U kelbetty_user -d kelbetty

# Перезапуск приложения
docker-compose -f docker-compose.prod.yml restart app
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Проверьте ресурсы: `docker stats`
4. Проверьте место на диске: `df -h`

---

**Примечание**: Этот метод подходит для простого развертывания. Для высоконагруженных приложений рекомендуется дополнительная настройка мониторинга и масштабирования.
