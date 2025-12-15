# 🚀 ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ ЗАПУСКА

## 📋 БЫСТРАЯ ИНСТРУКЦИЯ

### На production сервере:

```bash
# 1. Остановить контейнеры
docker compose down

# 2. Обновить код
git pull

# 3. Создать volume если его ещё нет (только первый раз!)
docker volume create apipicassostudioru_uploads_data

# 4. Пересобрать образ
docker compose build --no-cache

# 5. Запустить
docker compose up -d

# 6. Проверить
curl http://localhost:5000/health
```

---

## 🤖 АВТОМАТИЧЕСКИЙ DEPLOYMENT

Ещё проще - используйте готовый скрипт:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Скрипт автоматически:
- ✅ Создаст бэкап
- ✅ Остановит контейнеры
- ✅ Обновит код
- ✅ Проверит/создаст volume
- ✅ Пересоберёт образ
- ✅ Запустит контейнеры
- ✅ Проверит работоспособность

---

## 📝 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ

### Первый запуск (если volume ещё не создан):

```bash
# 1. Зайти на сервер
ssh user@your-server

# 2. Перейти в папку проекта
cd /path/to/photo-booking-api

# 3. Обновить код (если нужно)
git pull

# 4. Создать volume ВРУЧНУЮ
docker volume create apipicassostudioru_uploads_data

# 5. Инициализировать volume файлами из репозитория (опционально)
chmod +x scripts/init-uploads-volume.sh
./scripts/init-uploads-volume.sh

# 6. Запустить
docker compose up -d --build

# 7. Проверить
docker logs photo-booking-api -f
```

### Обновление (когда volume уже существует):

```bash
# 1. Зайти на сервер
ssh user@your-server

# 2. Перейти в папку проекта
cd /path/to/photo-booking-api

# 3. Остановить (БЕЗ -v!)
docker compose down

# 4. Обновить код
git pull

# 5. Пересобрать образ
docker compose build --no-cache

# 6. Запустить
docker compose up -d

# 7. Проверить
curl http://localhost:5000/health
docker logs photo-booking-api --tail 50
```

---

## 🚀 Быстрые команды

### Автоматический деплой (РЕКОМЕНДУЕТСЯ):
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Что делает:**
- ✅ Бэкап uploads (фотографии)
- ✅ Бэкап MongoDB (база данных)
- ✅ Остановка контейнеров
- ✅ Обновление кода
- ✅ Пересборка образа
- ✅ Запуск и проверка

---

### Вариант 1: Всё одной командой
```bash
docker compose down && git pull && docker compose build --no-cache && docker compose up -d
```

### Вариант 2: С проверкой
```bash
docker compose down && \
git pull && \
docker compose build --no-cache && \
docker compose up -d && \
sleep 10 && \
curl http://localhost:5000/health
```

### Вариант 3: С бэкапом (вручную)
```bash
# Бэкап uploads
./scripts/backup-uploads-volume.sh

# Бэкап MongoDB
./scripts/backup-mongodb.sh

# Деплой
docker compose down && \
git pull && \
docker compose build --no-cache && \
docker compose up -d
```

---

## 🔍 ПРОВЕРКА ПОСЛЕ ЗАПУСКА

```bash
# 1. Проверить что контейнеры запущены
docker compose ps

# Ожидаемый результат:
# NAME                    STATUS
# photo-booking-api       Up 2 minutes (healthy)
# photo-booking-mongodb   Up 2 minutes (healthy)
# photo-booking-redis     Up 2 minutes (healthy)

# 2. Проверить логи
docker logs photo-booking-api --tail 50

# Должны быть строки:
# ✅ Database connected
# ✅ Redis connected

# 3. Проверить API
curl http://localhost:5000/health

# Ожидаемый ответ:
# {
#   "status": "ok",
#   "uploads": {
#     "accessible": true,
#     "fileCount": 150
#   }
# }

# 4. Проверить что volume примонтирован
docker exec photo-booking-api ls -lah /app/dist/public/uploads

# Должны быть папки:
# drwxr-xr-x equipment/
# drwxr-xr-x rooms/
```

---

## 🆘 ЧТО ДЕЛАТЬ ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК

### Контейнер не запускается

```bash
# Посмотреть логи
docker logs photo-booking-api

# Посмотреть все контейнеры
docker compose ps -a

# Перезапустить
docker compose restart api
```

### API не отвечает

```bash
# Проверить что порт открыт
netstat -tulpn | grep 5000

# Проверить внутри контейнера
docker exec photo-booking-api wget -q -O- http://localhost:5000/health

# Перезапустить
docker compose restart api
```

### Volume не найден

```bash
# Создать вручную
docker volume create apipicassostudioru_uploads_data

# Проверить
docker volume ls | grep uploads

# Перезапустить контейнеры
docker compose up -d
```

### Фотки не отображаются

```bash
# Проверить что volume примонтирован
docker exec photo-booking-api mount | grep uploads

# Проверить содержимое
docker exec photo-booking-api ls -la /app/dist/public/uploads/equipment

# Проверить доступность через HTTP
curl -I http://localhost:5000/public/uploads/equipment/Name/image.jpg
```

---

## ✅ ЧЕКЛИСТ УСПЕШНОГО DEPLOYMENT

- [ ] Контейнеры запущены (`docker compose ps`)
- [ ] API отвечает на /health
- [ ] `uploads.accessible = true`
- [ ] Логи без ошибок
- [ ] Volume примонтирован
- [ ] Фотки доступны через HTTP
- [ ] База данных подключена
- [ ] Redis подключён

---

## 🎯 РЕКОМЕНДАЦИИ

### ✅ Делайте:

1. **Всегда** делайте бэкап перед обновлением
2. **Проверяйте** health endpoint после запуска
3. **Смотрите** логи при первом запуске
4. **Используйте** готовый скрипт deploy.sh

### ❌ Не делайте:

1. **Не** используйте флаг `-v` при `docker compose down`
2. **Не** удаляйте volume вручную без бэкапа
3. **Не** останавливайте контейнеры во время загрузки файлов
4. **Не** забывайте создать volume при первом запуске

---

## 📞 ЕСЛИ НУЖНА ПОМОЩЬ

Отправьте вывод этих команд:

```bash
docker compose ps
docker logs photo-booking-api --tail 100
docker volume ls
curl http://localhost:5000/health
```
