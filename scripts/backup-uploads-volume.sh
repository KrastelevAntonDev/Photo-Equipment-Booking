#!/bin/bash
# Скрипт для создания резервной копии uploads volume
# Рекомендуется запускать через cron ежедневно

set -e

VOLUME_NAME="apipicassostudioru_uploads_data"
BACKUP_DIR="/backups/uploads"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="uploads_$DATE.tar.gz"
KEEP_DAYS=30

echo "🔐 Создание резервной копии volume '$VOLUME_NAME'..."

# Создать директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# Создать архив
echo "📦 Создание архива $BACKUP_FILE..."
docker run --rm \
    -v "$VOLUME_NAME:/data:ro" \
    -v "$BACKUP_DIR:/backup" \
    alpine tar czf "/backup/$BACKUP_FILE" -C /data .

# Проверить размер
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo "✅ Архив создан: $BACKUP_SIZE"

# Удалить старые бэкапы
echo "🧹 Удаление бэкапов старше $KEEP_DAYS дней..."
DELETED=$(find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
echo "Удалено файлов: $DELETED"

# Показать список бэкапов
echo ""
echo "📋 Доступные резервные копии:"
ls -lh "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null || echo "Нет бэкапов"

echo ""
echo "🎉 Резервное копирование завершено!"
