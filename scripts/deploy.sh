#!/bin/bash
# 🚀 DEPLOYMENT SCRIPT - Правильное обновление на production

set -e

echo "🚀 ОБНОВЛЕНИЕ PRODUCTION"
echo "======================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Создать бэкап uploads volume
echo -e "${YELLOW}1. Создание бэкапа uploads...${NC}"
if [ -f "./scripts/backup-uploads-volume.sh" ]; then
    chmod +x ./scripts/backup-uploads-volume.sh
    ./scripts/backup-uploads-volume.sh || echo "⚠️ Бэкап uploads пропущен"
else
    echo "⚠️ Скрипт бэкапа uploads не найден, пропуск"
fi
echo ""

# 2. Создать бэкап MongoDB
echo -e "${YELLOW}2. Создание бэкапа MongoDB...${NC}"
if [ -f "./scripts/backup-mongodb.sh" ]; then
    chmod +x ./scripts/backup-mongodb.sh
    ./scripts/backup-mongodb.sh || echo "⚠️ Бэкап MongoDB пропущен"
else
    echo "⚠️ Скрипт бэкапа MongoDB не найден, пропуск"
fi
echo ""

# 3. Остановить контейнеры
echo -e "${YELLOW}3. Остановка контейнеров...${NC}"
docker compose down
echo -e "${GREEN}✅ Контейнеры остановлены${NC}"
echo ""

# 4. Обновить код
echo -e "${YELLOW}4. Обновление кода...${NC}"
git pull origin main
echo -e "${GREEN}✅ Код обновлён${NC}"
echo ""

# 5. Проверить существование volume
echo -e "${YELLOW}5. Проверка volume...${NC}"
if docker volume inspect apipicassostudioru_uploads_data >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Volume существует${NC}"
else
    echo -e "${YELLOW}⚠️ Volume не найден. Создание...${NC}"
    docker volume create apipicassostudioru_uploads_data
    
    # Инициализация volume из ./uploads если есть файлы
    if [ -d "./uploads" ]; then
        echo "Инициализация volume из ./uploads..."
        chmod +x ./scripts/init-uploads-volume.sh
        ./scripts/init-uploads-volume.sh || echo "Инициализация пропущена"
    fi
fi
echo ""

# 6. Пересобрать образ
echo -e "${YELLOW}6. Пересборка образа...${NC}"
docker compose build --no-cache api
echo -e "${GREEN}✅ Образ пересобран${NC}"
echo ""

# 7. Запустить контейнеры
echo -e "${YELLOW}7. Запуск контейнеров...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Контейнеры запущены${NC}"
echo ""

# 8. Ожидание запуска
echo -e "${YELLOW}8. Ожидание запуска приложения (15 секунд)...${NC}"
sleep 15
echo ""

# 9. Проверка health
echo -e "${YELLOW}9. Проверка работоспособности...${NC}"
HEALTH=$(curl -s http://localhost:5000/health || echo "ERROR")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ API работает!${NC}"
    echo ""
    echo "Информация об uploads:"
    echo "$HEALTH" | grep -o '"uploads":{[^}]*}' || echo "Информация об uploads недоступна"
else
    echo "⚠️ API не отвечает или вернул ошибку"
    echo "Проверьте логи: docker logs photo-booking-api"
fi
echo ""

echo "════════════════════════════════════════"
echo -e "${GREEN}🎉 DEPLOYMENT ЗАВЕРШЁН!${NC}"
echo "════════════════════════════════════════"
echo ""
echo "Полезные команды:"
echo "  docker logs photo-booking-api -f    # Логи в реальном времени"
echo "  docker compose ps                   # Статус контейнеров"
echo "  curl http://localhost:5000/health   # Проверка API"
