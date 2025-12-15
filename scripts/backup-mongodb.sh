#!/bin/bash
# Скрипт для создания резервной копии MongoDB

set -e

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mongodb_backup_$DATE"
KEEP_DAYS=30

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🗄️  Создание резервной копии MongoDB...${NC}"

# Создать директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# Получить credentials из переменных окружения или использовать defaults
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep MONGO | xargs)
fi

MONGO_USERNAME=${MONGO_USERNAME:-admin}
MONGO_PASSWORD=${MONGO_PASSWORD:-password}
MONGODB_NAME=${MONGODB_NAME:-myDB}

echo "База данных: $MONGODB_NAME"
echo "Пользователь: $MONGO_USERNAME"
echo ""

# Создать бэкап через mongodump
echo -e "${YELLOW}Запуск mongodump...${NC}"
docker exec photo-booking-mongodb mongodump \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    --db="$MONGODB_NAME" \
    --out="/tmp/$BACKUP_NAME"

# Скопировать бэкап из контейнера
echo -e "${YELLOW}Копирование бэкапа из контейнера...${NC}"
docker cp photo-booking-mongodb:/tmp/$BACKUP_NAME "$BACKUP_DIR/"

# Создать архив
echo -e "${YELLOW}Создание архива...${NC}"
cd "$BACKUP_DIR"
tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

# Удалить временные файлы из контейнера
docker exec photo-booking-mongodb rm -rf "/tmp/$BACKUP_NAME"

# Проверить размер
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)
echo -e "${GREEN}✅ Архив создан: $BACKUP_SIZE${NC}"

# Удалить старые бэкапы
echo -e "${YELLOW}🧹 Удаление бэкапов старше $KEEP_DAYS дней...${NC}"
DELETED=$(find "$BACKUP_DIR" -name "mongodb_backup_*.tar.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
echo "Удалено файлов: $DELETED"

# Показать список бэкапов
echo ""
echo -e "${GREEN}📋 Доступные резервные копии MongoDB:${NC}"
ls -lht "$BACKUP_DIR"/mongodb_backup_*.tar.gz 2>/dev/null | head -10 || echo "Нет бэкапов"

echo ""
echo -e "${GREEN}🎉 Резервное копирование MongoDB завершено!${NC}"
echo "Файл: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
