# 🧪 ТЕСТ: Что удаляет docker compose down -v?

## Официальная документация Docker:

```
-v, --volumes    Remove named volumes declared in the "volumes"
                 section of the Compose file and anonymous
                 volumes attached to containers
```

## ⚠️ КРИТИЧЕСКИ ВАЖНО!

Согласно официальной документации Docker Compose:

### `docker compose down -v` УДАЛЯЕТ:

1. **Named volumes** (именованные volumes) объявленные в секции `volumes`
2. **Anonymous volumes** (анонимные volumes) прикреплённые к контейнерам

### В нашем случае:

```yaml
volumes:
  uploads_data:  # ← ИМЕНОВАННЫЙ VOLUME
    driver: local
```

## 🔴 ПРАВИЛЬНЫЙ ОТВЕТ:

### ДА! `docker compose down -v` УДАЛИТ фотки!

Потому что `uploads_data` это **именованный volume**, объявленный в секции `volumes` 
в docker-compose.yml.

## ✅ БЕЗОПАСНЫЕ КОМАНДЫ:

```bash
# Остановить контейнеры БЕЗ удаления volumes
docker compose down

# Перезапустить контейнеры
docker compose restart

# Пересобрать образ
docker compose build

# Остановить и запустить заново
docker compose down
docker compose up -d
```

## 🎯 КАК ЗАЩИТИТЬСЯ:

### Вариант 1: Никогда не использовать `-v`
Просто запомните: **ВСЕГДА** используйте `docker compose down` БЕЗ флагов.

### Вариант 2: Внешний volume (вне docker-compose.yml)
Создать volume вручную и не объявлять его в docker-compose.yml:

```bash
# Создать volume вручную
docker volume create uploads_data

# В docker-compose.yml использовать как external:
volumes:
  uploads_data:
    external: true  # ← Помечен как внешний
```

С флагом `external: true` volume **НЕ будет удалён** при `docker compose down -v`!

## 🛡️ РЕКОМЕНДАЦИЯ:

Изменить `docker-compose.yml`:

```yaml
volumes:
  mongo_data:
    driver: local
  redis_data:
    driver: local
  uploads_data:
    external: true  # ← ЗАЩИТА от случайного удаления
```

И создать volume вручную при первом развёртывании:
```bash
docker volume create apipicassostudioru_uploads_data
```

Тогда даже `docker compose down -v` **НЕ удалит** фотки!
