import { connectDB, getDB } from '@/config/database';

/**
 * Миграция: устанавливаем isAvailable = true для всех существующих залов
 * 
 * Причина: добавили логику отображения залов только с isAvailable: true
 * Все существующие залы должны быть доступны по умолчанию
 */
async function setRoomsAvailable() {
  await connectDB();
  const db = getDB();
  const rooms = db.collection('rooms');

  console.log('🔄 Установка isAvailable = true для существующих залов...');

  const result = await rooms.updateMany(
    { isAvailable: { $exists: false } },
    { $set: { isAvailable: true, updatedAt: new Date() } }
  );

  console.log(`✅ Обновлено залов: ${result.modifiedCount}`);
  console.log('✅ Миграция завершена');

  process.exit(0);
}

setRoomsAvailable().catch((err) => {
  console.error('❌ Ошибка миграции:', err);
  process.exit(1);
});
