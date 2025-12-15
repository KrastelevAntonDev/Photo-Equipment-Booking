#!/bin/bash
# Скрипт для восстановления uploads volume из резервной копии

set -e

VOLUME_NAME="apipicassostudioru_uploads_data"
BACKUP_DIR="/backups/uploads"

if [ -z "$1" ]; then
    echo "📋 Использование: $0 <файл_бэкапа>"
    echo ""
    echo "Доступные резервные копии:"
    ls -lht "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null || echo "Нет бэкапов"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    # Попробовать найти в BACKUP_DIR
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "❌ Файл не найден: $BACKUP_FILE"
        exit 1
    fi
fi

echo "⚠️  ВНИМАНИЕ: Это действие ПЕРЕЗАПИШЕТ все файлы в volume '$VOLUME_NAME'"
echo "Файл бэкапа: $BACKUP_FILE"
echo ""
read -p "Продолжить? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Отменено."
    exit 0
fi

# Остановить контейнеры, использующие volume
echo "🛑 Остановка контейнеров..."
docker compose down

# Очистить volume
echo "🧹 Очистка volume..."
docker run --rm \
    -v "$VOLUME_NAME:/data" \
    alpine sh -c 'rm -rf /data/*'

# Восстановить из бэкапа
echo "📦 Восстановление файлов..."
docker run --rm \
    -v "$VOLUME_NAME:/data" \
    -v "$(dirname $BACKUP_FILE):/backup:ro" \
    alpine tar xzf "/backup/$(basename $BACKUP_FILE)" -C /data

# Показать статистику
echo ""
echo "📈 Статистика после восстановления:"
docker run --rm \
    -v "$VOLUME_NAME:/data" \
    alpine sh -c '
        echo "Всего файлов: $(find /data -type f | wc -l)"
        echo "Размер: $(du -sh /data | cut -f1)"
        echo ""
        echo "Структура директорий:"
        ls -lah /data/
    '

echo ""
echo "✅ Восстановление завершено!"
echo "Запустите контейнеры: docker compose up -d"
