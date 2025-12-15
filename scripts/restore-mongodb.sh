#!/bin/bash
# Скрипт для восстановления MongoDB из резервной копии

set -e

BACKUP_DIR="/backups/mongodb"

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${YELLOW}📋 Использование: $0 <файл_бэкапа>${NC}"
    echo ""
    echo "Доступные резервные копии:"
    ls -lht "$BACKUP_DIR"/mongodb_backup_*.tar.gz 2>/dev/null || echo "Нет бэкапов"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    # Попробовать найти в BACKUP_DIR
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo -e "${RED}❌ Файл не найден: $BACKUP_FILE${NC}"
        exit 1
    fi
fi

# Получить credentials из переменных окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep MONGO | xargs)
fi

MONGO_USERNAME=${MONGO_USERNAME:-admin}
MONGO_PASSWORD=${MONGO_PASSWORD:-password}
MONGODB_NAME=${MONGODB_NAME:-myDB}

echo -e "${RED}⚠️  ВНИМАНИЕ: Это действие ПЕРЕЗАПИШЕТ базу данных '$MONGODB_NAME'${NC}"
echo "Файл бэкапа: $BACKUP_FILE"
echo ""
read -p "Продолжить? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Отменено."
    exit 0
fi

# Остановить API (чтобы не было операций записи)
echo -e "${YELLOW}🛑 Остановка API...${NC}"
docker compose stop api

# Распаковать архив во временную директорию
TMP_DIR=$(mktemp -d)
echo -e "${YELLOW}📦 Распаковка бэкапа...${NC}"
tar xzf "$BACKUP_FILE" -C "$TMP_DIR"

# Найти директорию с бэкапом
BACKUP_DIR_NAME=$(ls "$TMP_DIR" | head -1)

# Скопировать в контейнер
echo -e "${YELLOW}📤 Копирование в контейнер...${NC}"
docker cp "$TMP_DIR/$BACKUP_DIR_NAME" photo-booking-mongodb:/tmp/restore

# Восстановить через mongorestore
echo -e "${YELLOW}🔄 Восстановление базы данных...${NC}"
docker exec photo-booking-mongodb mongorestore \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    --db="$MONGODB_NAME" \
    --drop \
    "/tmp/restore/$MONGODB_NAME"

# Очистить временные файлы
echo -e "${YELLOW}🧹 Очистка...${NC}"
docker exec photo-booking-mongodb rm -rf /tmp/restore
rm -rf "$TMP_DIR"

# Запустить API
echo -e "${YELLOW}🚀 Запуск API...${NC}"
docker compose start api

echo ""
echo -e "${GREEN}✅ Восстановление завершено!${NC}"
echo "База данных '$MONGODB_NAME' восстановлена из бэкапа"
echo ""
echo "Проверьте работоспособность: curl http://localhost:5000/health"
