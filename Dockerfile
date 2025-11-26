# Используем Node.js 20 LTS
FROM node:20-alpine AS builder

# Устанавливаем pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем приложение
RUN pnpm build

# Production образ
FROM node:20-alpine

# Устанавливаем pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копируем package.json
COPY package.json pnpm-lock.yaml ./

# Устанавливаем только production зависимости
RUN pnpm install --prod --frozen-lockfile

# Копируем собранное приложение из builder (включая dist/public)
COPY --from=builder /app/dist ./dist

# Копируем seed файлы
COPY --from=builder /app/info.csv /app/new-info.csv /app/fileconverts.json ./

# Копируем фотографии
COPY --from=builder /app/uploads ./dist/public/uploads

# Создаём директорию для uploads (если ещё не существует)
RUN mkdir -p /app/dist/public/uploads/equipment /app/dist/public/uploads/rooms

# Создаём директорию для uploads (если ещё не существует)
RUN mkdir -p /app/dist/public/uploads/equipment /app/dist/public/uploads/rooms

# Переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

# Запускаем приложение
CMD ["node", "dist/app.js"]