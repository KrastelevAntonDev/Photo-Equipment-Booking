#!/bin/bash
# Тест сохранности файлов при пересборке Docker

set -e

echo "🧪 ТЕСТ СОХРАННОСТИ ФАЙЛОВ"
echo "=========================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VOLUME_NAME="apipicassostudioru_uploads_data"
TEST_FILE="PERSISTENCE_TEST.txt"
TEST_CONTENT="This file proves persistence works! Created at $(date)"

echo -e "${YELLOW}Шаг 1: Проверка volume${NC}"
if docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Volume существует${NC}"
else
    echo -e "${YELLOW}⚠️  Volume не найден. Создание...${NC}"
    docker volume create "$VOLUME_NAME"
fi
echo ""

echo -e "${YELLOW}Шаг 2: Создание тестового файла в volume${NC}"
docker run --rm \
    -v "$VOLUME_NAME:/data" \
    alpine sh -c "echo '$TEST_CONTENT' > /data/$TEST_FILE"
echo -e "${GREEN}✅ Тестовый файл создан${NC}"
echo ""

echo -e "${YELLOW}Шаг 3: Проверка содержимого файла${NC}"
CONTENT_BEFORE=$(docker run --rm \
    -v "$VOLUME_NAME:/data" \
    alpine cat "/data/$TEST_FILE")
echo "Содержимое: $CONTENT_BEFORE"
echo -e "${GREEN}✅ Файл читается${NC}"
echo ""

echo -e "${YELLOW}Шаг 4: Остановка контейнеров${NC}"
docker compose down
echo -e "${GREEN}✅ Контейнеры остановлены${NC}"
echo ""

echo -e "${YELLOW}Шаг 5: Проверка что файл всё ещё существует${NC}"
CONTENT_AFTER_DOWN=$(docker run --rm \
    -v "$VOLUME_NAME:/data" \
    alpine cat "/data/$TEST_FILE")
if [ "$CONTENT_BEFORE" = "$CONTENT_AFTER_DOWN" ]; then
    echo -e "${GREEN}✅ Файл сохранился после остановки контейнеров!${NC}"
else
    echo -e "${RED}❌ ОШИБКА: Содержимое изменилось!${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Шаг 6: Пересборка образа${NC}"
docker compose build --no-cache api
echo -e "${GREEN}✅ Образ пересобран${NC}"
echo ""

echo -e "${YELLOW}Шаг 7: Проверка что файл всё ещё существует после пересборки${NC}"
CONTENT_AFTER_BUILD=$(docker run --rm \
    -v "$VOLUME_NAME:/data" \
    alpine cat "/data/$TEST_FILE")
if [ "$CONTENT_BEFORE" = "$CONTENT_AFTER_BUILD" ]; then
    echo -e "${GREEN}✅ Файл сохранился после пересборки образа!${NC}"
else
    echo -e "${RED}❌ ОШИБКА: Содержимое изменилось!${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Шаг 8: Запуск контейнеров${NC}"
docker compose up -d
echo -e "${GREEN}✅ Контейнеры запущены${NC}"
echo ""

echo -e "${YELLOW}Шаг 9: Ожидание запуска контейнера (10 секунд)${NC}"
sleep 10
echo ""

echo -e "${YELLOW}Шаг 10: Проверка файла внутри запущенного контейнера${NC}"
CONTENT_IN_CONTAINER=$(docker exec photo-booking-api cat /app/dist/public/uploads/$TEST_FILE 2>/dev/null || echo "ERROR")
if [ "$CONTENT_BEFORE" = "$CONTENT_IN_CONTAINER" ]; then
    echo -e "${GREEN}✅ Файл доступен в контейнере!${NC}"
    echo "Содержимое: $CONTENT_IN_CONTAINER"
else
    echo -e "${RED}❌ ОШИБКА: Файл не найден в контейнере или содержимое отличается${NC}"
    echo "Ожидалось: $CONTENT_BEFORE"
    echo "Получено: $CONTENT_IN_CONTAINER"
    exit 1
fi
echo ""

echo -e "${YELLOW}Шаг 11: Очистка - удаление тестового файла${NC}"
docker exec photo-booking-api rm /app/dist/public/uploads/$TEST_FILE
echo -e "${GREEN}✅ Тестовый файл удалён${NC}"
echo ""

echo "═══════════════════════════════════════════"
echo -e "${GREEN}🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "Результаты:"
echo "✅ Volume сохраняется после docker compose down"
echo "✅ Volume сохраняется после docker compose build"
echo "✅ Файлы доступны в новом контейнере"
echo "✅ Содержимое файлов не изменяется"
echo ""
echo -e "${GREEN}🛡️  ГАРАНТИЯ: Ваши фотографии в безопасности!${NC}"
