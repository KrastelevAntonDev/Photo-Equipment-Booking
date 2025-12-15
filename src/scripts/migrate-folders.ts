import fs from 'fs';
import path from 'path';
import { sanitizeFolderName } from '@shared/utils/folder.utils';

/**
 * Скрипт для миграции папок uploads:
 * Переименовывает папки с небезопасными именами (пробелы, спецсимволы)
 * в безопасные имена (дефисы вместо пробелов)
 */

const isProduction = process.env.NODE_ENV === 'production';
const projectRoot = isProduction 
  ? path.join(__dirname, '..', '..') 
  : path.join(__dirname, '..', '..');

const roomsPath = path.join(projectRoot, 'public', 'uploads', 'rooms');
const equipmentPath = path.join(projectRoot, 'public', 'uploads', 'equipment');

function migrateFolders(basePath: string, type: string): number {
  if (!fs.existsSync(basePath)) {
    console.log(`⚠️  Папка не найдена: ${basePath}`);
    return 0;
  }

  const folders = fs.readdirSync(basePath, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  let migratedCount = 0;

  for (const folder of folders) {
    const oldName = folder.name;
    const newName = sanitizeFolderName(oldName);

    if (oldName === newName) {
      console.log(`✓ Пропуск: ${oldName} (уже безопасное имя)`);
      continue;
    }

    const oldPath = path.join(basePath, oldName);
    const newPath = path.join(basePath, newName);

    try {
      if (fs.existsSync(newPath)) {
        console.log(`⚠️  Папка уже существует: ${newName}`);
        console.log(`   Объединяем содержимое...`);
        
        // Копируем файлы из старой папки в новую
        const files = fs.readdirSync(oldPath);
        for (const file of files) {
          const srcFile = path.join(oldPath, file);
          const destFile = path.join(newPath, file);
          if (!fs.existsSync(destFile)) {
            fs.copyFileSync(srcFile, destFile);
          }
        }
        
        // Удаляем старую папку
        fs.rmSync(oldPath, { recursive: true });
        console.log(`✅ Объединено и удалено: ${oldName}`);
      } else {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Переименовано: ${oldName} → ${newName}`);
      }
      
      migratedCount++;
    } catch (error: any) {
      console.error(`❌ Ошибка при миграции ${oldName}:`, error.message);
    }
  }

  return migratedCount;
}

async function main() {
  console.log('📁 Миграция папок uploads');
  console.log('=========================');
  console.log('');

  console.log('🏠 Миграция папок rooms...');
  const roomsCount = migrateFolders(roomsPath, 'rooms');
  console.log(`   Обработано: ${roomsCount}`);
  console.log('');

  console.log('🔧 Миграция папок equipment...');
  const equipmentCount = migrateFolders(equipmentPath, 'equipment');
  console.log(`   Обработано: ${equipmentCount}`);
  console.log('');

  console.log('🎉 Миграция завершена!');
  console.log(`   Всего мигрировано папок: ${roomsCount + equipmentCount}`);
  console.log('');
  console.log('⚠️  ВАЖНО: Теперь запустите обновление URL в базе данных:');
  console.log('   npm run seed:images');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Ошибка:', err);
    process.exit(1);
  });
