import { connectDB } from '@config/database';
import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';
import { EquipmentMongoRepository } from '@modules/equipment/infrastructure/equipment.mongo.repository';
import fs from 'fs';
import path from 'path';

// Нормализация имени для сравнения
function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
}

// Сканирование файлов в папке
async function scanImagesInFolder(folderPath: string): Promise<string[]> {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const files: string[] = [];
  const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      // Проверяем что это изображение
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
        files.push(entry.name);
      }
    }
  }

  return files.sort(); // Сортируем по имени файла
}

// Получение изображений для комнаты из файловой системы
async function getRoomImagesFromFS(roomName: string): Promise<string[]> {
  // В Docker: /app/dist/public/uploads/
  // Локально: путь от dist или src
  const isProduction = process.env.NODE_ENV === 'production';
  let uploadsBase: string;
  
  if (isProduction) {
    // В продакшене путь от /app/dist
    uploadsBase = '/app/dist/public/uploads/rooms';
  } else {
    // Локально от dist или src
    const projectRoot = path.join(__dirname, '..', '..');
    uploadsBase = path.join(projectRoot, 'public', 'uploads', 'rooms');
  }

  if (!fs.existsSync(uploadsBase)) {
    console.warn(`⚠️  Папка uploads не найдена: ${uploadsBase}`);
    return [];
  }

  const normalizedTarget = normalize(roomName);
  const baseEntries = await fs.promises.readdir(uploadsBase, { withFileTypes: true });

  // Ищем папку которая соответствует имени комнаты
  const matchedDir = baseEntries.find(e => 
    e.isDirectory() && normalize(e.name) === normalizedTarget
  );

  if (!matchedDir) {
    return [];
  }

  const roomDir = path.join(uploadsBase, matchedDir.name);
  const files = await scanImagesInFolder(roomDir);

  // Формируем URL в правильном формате
  return files.map(file => 
    `/public/uploads/rooms/${encodeURIComponent(matchedDir.name)}/${encodeURIComponent(file)}`
  );
}

// Получение изображений для оборудования из файловой системы
async function getEquipmentImagesFromFS(equipmentName: string): Promise<string[]> {
  // В Docker: /app/dist/public/uploads/
  // Локально: путь от dist или src
  const isProduction = process.env.NODE_ENV === 'production';
  let uploadsBase: string;
  
  if (isProduction) {
    // В продакшене путь от /app/dist
    uploadsBase = '/app/dist/public/uploads/equipment';
  } else {
    // Локально от dist или src
    const projectRoot = path.join(__dirname, '..', '..');
    uploadsBase = path.join(projectRoot, 'public', 'uploads', 'equipment');
  }

  if (!fs.existsSync(uploadsBase)) {
    console.warn(`⚠️  Папка uploads не найдена: ${uploadsBase}`);
    return [];
  }

  const normalizedTarget = normalize(equipmentName);
  const baseEntries = await fs.promises.readdir(uploadsBase, { withFileTypes: true });

  // Ищем папку которая соответствует имени оборудования
  const matchedDir = baseEntries.find(e => 
    e.isDirectory() && normalize(e.name) === normalizedTarget
  );

  if (!matchedDir) {
    return [];
  }

  const eqDir = path.join(uploadsBase, matchedDir.name);
  const files = await scanImagesInFolder(eqDir);

  // Формируем URL в правильном формате
  return files.map(file => 
    `/public/uploads/equipment/${encodeURIComponent(matchedDir.name)}/${encodeURIComponent(file)}`
  );
}

// Проверка что URL валиден (есть папка с именем сущности)
function isValidImageUrl(url: string, entityName: string, type: 'room' | 'equipment'): boolean {
  const pattern = type === 'room' 
    ? /\/public\/uploads\/rooms\/([^/]+)\/(.+)$/
    : /\/public\/uploads\/equipment\/([^/]+)\/(.+)$/;
  
  const match = url.match(pattern);
  if (!match) return false;

  const [, folderName] = match;
  const decodedFolder = decodeURIComponent(folderName);
  
  // Проверяем что имя папки соответствует имени сущности
  return normalize(decodedFolder) === normalize(entityName);
}

async function addImagesToRooms() {
  const roomRepository = new RoomMongoRepository();
  
  console.log('🖼️  Обработка изображений залов...\n');
  
  const rooms = await roomRepository.findAllIncludingDeleted();
  let updatedCount = 0;
  let cleanedCount = 0;
  
  for (const room of rooms) {
    const roomName = room.name.trim();
    const roomId = room._id!.toString();
    
    // 1. Удаляем битые URL (без правильной структуры папок)
    if (room.images && room.images.length > 0) {
      const validImages = room.images.filter(url => isValidImageUrl(url, roomName, 'room'));
      const invalidCount = room.images.length - validImages.length;
      
      if (invalidCount > 0) {
        console.log(`🧹 ${roomName}: удалено ${invalidCount} битых URL`);
        await roomRepository.updateRoom(roomId, { images: validImages });
        cleanedCount++;
      }
    }
    
    // 2. Сканируем реальные файлы из папки
    const fsImages = await getRoomImagesFromFS(roomName);
    
    if (fsImages.length > 0) {
      // Обновляем images из файловой системы
      await roomRepository.updateRoom(roomId, { images: fsImages });
      console.log(`✅ ${roomName}: установлено ${fsImages.length} изображений из ФС`);
      updatedCount++;
    } else {
      // Если папки нет - очищаем images
      await roomRepository.updateRoom(roomId, { images: [] });
      console.log(`⚠️  ${roomName}: папка не найдена, images очищен`);
    }
  }
  
  console.log(`\n✨ Обновлено залов: ${updatedCount}/${rooms.length}`);
  console.log(`🧹 Очищено битых URL: ${cleanedCount}`);
}

async function addImagesToEquipment() {
  const equipmentRepository = new EquipmentMongoRepository();
  
  console.log('\n🖼️  Обработка изображений оборудования...\n');
  
  const equipment = await equipmentRepository.findAllIncludingDeleted();
  let updatedCount = 0;
  let cleanedCount = 0;
  
  for (const item of equipment) {
    const itemName = item.name.trim();
    const itemId = item._id!.toString();
    
    // 1. Проверяем и удаляем битый URL (если есть старое поле image)
    if (item.image && !isValidImageUrl(item.image, itemName, 'equipment')) {
      console.log(`🧹 ${itemName}: удален битый URL из поля image`);
      await equipmentRepository.updateEquipment(itemId, { image: '' });
      cleanedCount++;
    }
    
    // 2. Проверяем и чистим массив images (если есть)
    if (item.images && item.images.length > 0) {
      const validImages = item.images.filter(url => isValidImageUrl(url, itemName, 'equipment'));
      const invalidCount = item.images.length - validImages.length;
      
      if (invalidCount > 0) {
        console.log(`🧹 ${itemName}: удалено ${invalidCount} битых URL из images`);
        await equipmentRepository.updateEquipment(itemId, { images: validImages });
        cleanedCount++;
      }
    }
    
    // 3. Сканируем реальные файлы из папки
    const fsImages = await getEquipmentImagesFromFS(itemName);
    
    if (fsImages.length > 0) {
      // Устанавливаем первую картинку в image, все в images
      await equipmentRepository.updateEquipment(itemId, { 
        image: fsImages[0],
        images: fsImages 
      });
      console.log(`✅ ${itemName}: установлено ${fsImages.length} изображений из ФС`);
      updatedCount++;
    } else {
      // Если папки нет - очищаем
      await equipmentRepository.updateEquipment(itemId, { 
        image: '',
        images: [] 
      });
      console.log(`⚠️  ${itemName}: папка не найдена, images очищен`);
    }
  }
  
  console.log(`\n✨ Обновлено оборудования: ${updatedCount}/${equipment.length}`);
  console.log(`🧹 Очищено битых URL: ${cleanedCount}`);
}

async function add_image() {
  try {
    console.log('🚀 Запуск скрипта добавления изображений...\n');
    
    await connectDB();
    
    // Добавляем изображения в залы
    await addImagesToRooms();
    
    // Добавляем изображения в оборудование
    await addImagesToEquipment();
    
    console.log('\n✅ Готово! Изображения успешно добавлены.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

// Запуск
add_image();