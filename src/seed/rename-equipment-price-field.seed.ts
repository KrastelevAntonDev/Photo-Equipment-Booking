import { connectDB, getDB } from '@/config/database';

/**
 * Миграция: переименование поля pricePerHour → pricePerDay в коллекции equipment
 * 
 * Причина: цена оборудования теперь фиксированная за сутки (24 часа),
 * не зависит от длительности бронирования
 */
async function renameEquipmentPriceField() {
  await connectDB();
  const db = getDB();
  const equipment = db.collection('equipment');

  console.log('🔄 Переименование pricePerHour → pricePerDay в equipment...');

  const result = await equipment.updateMany(
    { pricePerHour: { $exists: true } },
    { $rename: { pricePerHour: 'pricePerDay' } }
  );

  console.log(`✅ Обновлено документов: ${result.modifiedCount}`);
  console.log('✅ Миграция завершена');

  process.exit(0);
}

renameEquipmentPriceField().catch((err) => {
  console.error('❌ Ошибка миграции:', err);
  process.exit(1);
});
