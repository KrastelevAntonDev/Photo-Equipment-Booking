#!/bin/bash
# Скрипт для переименования папок uploads (заменяет пробелы на дефисы)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📁 Миграция папок uploads (пробелы → дефисы)${NC}"
echo ""

# Функция для безопасного переименования папки
rename_folder() {
  local base_path=$1
  local old_name=$2
  local new_name=$3
  
  if [ "$old_name" = "$new_name" ]; then
    return 0
  fi
  
  local old_path="$base_path/$old_name"
  local new_path="$base_path/$new_name"
  
  if [ -d "$new_path" ]; then
    echo -e "${YELLOW}⚠️  Папка уже существует: $new_name${NC}"
    echo "   Объединяем содержимое..."
    # Копируем файлы из старой папки в новую
    cp -r "$old_path"/* "$new_path/" 2>/dev/null || true
    rm -rf "$old_path"
  else
    echo "Переименование: $old_name → $new_name"
    mv "$old_path" "$new_path"
  fi
}

# Миграция внутри Docker контейнера
echo -e "${GREEN}Миграция папок rooms...${NC}"
ROOMS_COUNT=0
while IFS= read -r -d '' folder; do
  folder_name=$(basename "$folder")
  # Заменяем пробелы на дефисы
  safe_name=$(echo "$folder_name" | sed 's/ /-/g' | sed 's/[^a-zA-Z0-9\-\.а-яА-ЯёЁ_]/_/g' | sed 's/__*/_/g' | sed 's/--*/-/g' | sed 's/^[-_]*//g' | sed 's/[-_]*$//g')
  
  if [ "$folder_name" != "$safe_name" ]; then
    docker exec photo-booking-api sh -c "
      if [ -d '/app/dist/public/uploads/rooms/$safe_name' ]; then
        echo '⚠️  Папка существует: $safe_name'
        cp -r '/app/dist/public/uploads/rooms/$folder_name'/* '/app/dist/public/uploads/rooms/$safe_name/' 2>/dev/null || true
        rm -rf '/app/dist/public/uploads/rooms/$folder_name'
      else
        mv '/app/dist/public/uploads/rooms/$folder_name' '/app/dist/public/uploads/rooms/$safe_name'
        echo 'Переименовано: $folder_name → $safe_name'
      fi
    "
    ((ROOMS_COUNT++))
  fi
done < <(docker exec photo-booking-api find /app/dist/public/uploads/rooms -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null || true)

echo -e "${GREEN}✅ Обработано комнат: $ROOMS_COUNT${NC}"
echo ""

echo -e "${GREEN}Миграция папок equipment...${NC}"
EQ_COUNT=0
while IFS= read -r -d '' folder; do
  folder_name=$(basename "$folder")
  # Заменяем пробелы на дефисы
  safe_name=$(echo "$folder_name" | sed 's/ /-/g' | sed 's/[^a-zA-Z0-9\-\.а-яА-ЯёЁ_]/_/g' | sed 's/__*/_/g' | sed 's/--*/-/g' | sed 's/^[-_]*//g' | sed 's/[-_]*$//g')
  
  if [ "$folder_name" != "$safe_name" ]; then
    docker exec photo-booking-api sh -c "
      if [ -d '/app/dist/public/uploads/equipment/$safe_name' ]; then
        echo '⚠️  Папка существует: $safe_name'
        cp -r '/app/dist/public/uploads/equipment/$folder_name'/* '/app/dist/public/uploads/equipment/$safe_name/' 2>/dev/null || true
        rm -rf '/app/dist/public/uploads/equipment/$folder_name'
      else
        mv '/app/dist/public/uploads/equipment/$folder_name' '/app/dist/public/uploads/equipment/$safe_name'
        echo 'Переименовано: $folder_name → $safe_name'
      fi
    "
    ((EQ_COUNT++))
  fi
done < <(docker exec photo-booking-api find /app/dist/public/uploads/equipment -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null || true)

echo -e "${GREEN}✅ Обработано оборудования: $EQ_COUNT${NC}"
echo ""

echo -e "${GREEN}🎉 Миграция завершена!${NC}"
echo "Теперь запустите seed скрипт для обновления URL в базе данных:"
echo "  npm run seed:images"
