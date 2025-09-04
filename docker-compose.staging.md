version: '3.8'

services:
  # PostgreSQL база данных для staging
  postgres:
    image: postgres:15-alpine
    container_name: kelbetty-postgres-staging
    environment:
      POSTGRES_DB: kelbetty_staging
      POSTGRES_USER: kelbetty_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5433:5432"  # Другой порт для staging
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - kelbetty-staging-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kelbetty_user -d kelbetty_staging"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Database migrations for staging
  migrate:
    image: ${REGISTRY}/${IMAGE_NAME}:staging
    container_name: kelbetty-migrate-staging
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=postgresql://kelbetty_user:${POSTGRES_PASSWORD}@postgres:5432/kelbetty_staging?schema=public
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - kelbetty-staging-network
    command: >
      sh -c "
        echo '🗄️ Generating Prisma client...' &&
        npx prisma generate &&
        echo '🔄 Running database migrations...' &&
        npx prisma db push &&
        echo '✅ Database migrations completed!'
      "
    restart: "no"

  # Next.js приложение для staging
  app:
    image: ${REGISTRY}/${IMAGE_NAME}:staging
    container_name: kelbetty-app-staging
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=postgresql://kelbetty_user:${POSTGRES_PASSWORD}@postgres:5432/kelbetty_staging?schema=public
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
    ports:
      - "3001:3000"  # Другой порт для staging
    volumes:
      - uploads_staging_data:/app/public/uploads
    depends_on:
      postgres:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    restart: unless-stopped
    networks:
      - kelbetty-staging-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/test"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx reverse proxy для staging
  nginx:
    image: nginx:alpine
    container_name: kelbetty-nginx-staging
    ports:
      - "8080:80"  # Другой порт для staging
    volumes:
      - ./nginx/nginx.staging.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - nginx_staging_logs:/var/log/nginx
      - uploads_staging_data:/var/www/uploads:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - kelbetty-staging-network

volumes:
  postgres_staging_data:
  uploads_staging_data:
  nginx_staging_logs:

networks:
  kelbetty-staging-network:
    driver: bridge
