#!/bin/bash
# Скрипт для инициализации Docker volume с существующими файлами
# Используется при первом развёртывании на новом сервере

set -e

VOLUME_NAME="apipicassostudioru_uploads_data"
SOURCE_DIR="./uploads"

echo "🔍 Проверка состояния volume '$VOLUME_NAME'..."

# Проверить существование volume
if ! docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
    echo "📦 Volume не существует. Создание..."
    docker volume create "$VOLUME_NAME"
fi

# Проверить, пустой ли volume
echo "📊 Подсчёт файлов в volume..."
FILE_COUNT=$(docker run --rm \
    -v "$VOLUME_NAME:/data" \
    alpine sh -c 'find /data -type f 2>/dev/null | wc -l' || echo "0")

echo "Найдено файлов: $FILE_COUNT"

if [ "$FILE_COUNT" = "0" ]; then
    echo "📁 Volume пустой. Копирование файлов из $SOURCE_DIR..."
    
    if [ ! -d "$SOURCE_DIR" ]; then
        echo "⚠️  Директория $SOURCE_DIR не найдена."
        echo "Пропуск копирования. Volume останется пустым."
        echo "Файлы будут создаваться при загрузке через API."
        exit 0
    fi
    
    # Копируем файлы в volume
    docker run --rm \
        -v "$(pwd)/$SOURCE_DIR:/source:ro" \
        -v "$VOLUME_NAME:/target" \
        alpine sh -c '
            echo "Копирование equipment..."
            if [ -d /source/equipment ]; then
                mkdir -p /target/equipment
                cp -rv /source/equipment/. /target/equipment/
            fi
            
            echo "Копирование rooms..."
            if [ -d /source/rooms ]; then
                mkdir -p /target/rooms
                cp -rv /source/rooms/. /target/rooms/
            fi
            
            echo "✅ Копирование завершено!"
        '
    
    # Показать статистику
    echo ""
    echo "📈 Статистика после копирования:"
    docker run --rm \
        -v "$VOLUME_NAME:/data" \
        alpine sh -c '
            echo "Всего файлов: $(find /data -type f | wc -l)"
            echo "Размер: $(du -sh /data | cut -f1)"
            echo ""
            echo "Структура директорий:"
            ls -lah /data/
        '
else
    echo "✅ Volume уже содержит $FILE_COUNT файл(ов)."
    echo "Копирование пропущено для предотвращения перезаписи."
    echo ""
    echo "Текущая структура:"
    docker run --rm \
        -v "$VOLUME_NAME:/data" \
        alpine ls -lah /data/
fi

echo ""
echo "🎉 Готово! Volume '$VOLUME_NAME' готов к использованию."
