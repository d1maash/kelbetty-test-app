version: '3.8'

services:
  # PostgreSQL база данных для продакшена
  postgres:
    image: postgres:15-alpine
    container_name: kelbetty-postgres-prod
    environment:
      POSTGRES_DB: kelbetty
      POSTGRES_USER: kelbetty_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - kelbetty-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kelbetty_user -d kelbetty"]
      interval: 10s
      timeout: 5s
      retries: 5
    # Не экспонируем порт в продакшене для безопасности
    # ports:
    #   - "5432:5432"

  # Database migrations for production
  migrate:
    image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG:-latest}
    container_name: kelbetty-migrate-prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://kelbetty_user:${POSTGRES_PASSWORD}@postgres:5432/kelbetty?schema=public
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - kelbetty-network
    command: >
      sh -c "
        echo '🗄️ Generating Prisma client...' &&
        npx prisma generate &&
        echo '🔄 Running database migrations...' &&
        npx prisma db push &&
        echo '✅ Database migrations completed!'
      "
    restart: "no"

  # Next.js приложение для продакшена
  app:
    image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG:-latest}
    container_name: kelbetty-app-prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://kelbetty_user:${POSTGRES_PASSWORD}@postgres:5432/kelbetty?schema=public
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_CLERK_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      - NEXT_PUBLIC_CLERK_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_SIGN_UP_URL}
      - NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      - NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CLERK_PRO_PLAN_ID=${CLERK_PRO_PLAN_ID}
      - MAX_FILE_SIZE=${MAX_FILE_SIZE}
      - UPLOAD_DIR=${UPLOAD_DIR}
    volumes:
      - uploads_data:/app/public/uploads
    depends_on:
      postgres:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    restart: unless-stopped
    networks:
      - kelbetty-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/test"]
      interval: 30s
      timeout: 10s
      retries: 3
    # Ограничиваем ресурсы
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  # Nginx reverse proxy для продакшена
  nginx:
    image: nginx:alpine
    container_name: kelbetty-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - nginx_logs:/var/log/nginx
      - uploads_data:/var/www/uploads:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - kelbetty-network
    # Ограничиваем ресурсы
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
        reservations:
          memory: 128M
          cpus: '0.1'

  # Мониторинг - Prometheus (опционально)
  prometheus:
    image: prom/prometheus:latest
    container_name: kelbetty-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - kelbetty-network
    profiles:
      - monitoring

  # Мониторинг - Grafana (опционально)
  grafana:
    image: grafana/grafana:latest
    container_name: kelbetty-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - kelbetty-network
    profiles:
      - monitoring

  # Бэкап базы данных
  backup:
    image: postgres:15-alpine
    container_name: kelbetty-backup
    environment:
      - PGPASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh:ro
    depends_on:
      - postgres
    networks:
      - kelbetty-network
    # Запускаем бэкап по расписанию
    command: >
      sh -c "
        while true; do
          echo 'Creating backup...'
          pg_dump -h postgres -U kelbetty_user kelbetty > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql
          echo 'Backup completed'
          # Удаляем старые бэкапы (старше 7 дней)
          find /backups -name 'backup_*.sql' -mtime +7 -delete
          sleep 86400
        done
      "
    restart: unless-stopped
    profiles:
      - backup

volumes:
  postgres_data:
    driver: local
  uploads_data:
    driver: local
  nginx_logs:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

networks:
  kelbetty-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
