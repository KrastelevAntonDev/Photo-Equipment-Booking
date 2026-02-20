import { connectDB, getDB } from '@/config/database';
import { ObjectId } from 'mongodb';

/**
 * Скрипт для исправления totalPrice для бронирований с 50% оплатой
 * 
 * Логика:
 * 1. Находит все bookings с bookingPaymentMethod === "card-50"
 * 2. Фильтрует только те, где paidAmount > 0
 * 3. Устанавливает правильную totalPrice = paidAmount * 2 (так как paidAmount это 50% от totalPrice)
 * 4. Пересчитывает paymentStatus, isPaid, isHalfPaid
 * 
 * Использование:
 * npx ts-node src/scripts/fix-card50-prices.ts --dry-run  # Показать что будет изменено
 * npx ts-node src/scripts/fix-card50-prices.ts            # Применить изменения
 */

interface BookingUpdate {
  _id: ObjectId;
  oldTotalPrice: number;
  newTotalPrice: number;
  paidAmount: number;
  oldPaymentStatus: string;
  newPaymentStatus: string;
  oldIsPaid: boolean;
  newIsPaid: boolean;
  oldIsHalfPaid: boolean | undefined;
  newIsHalfPaid: boolean;
}

async function fixCard50Prices(dryRun: boolean = false) {
  await connectDB();
  const db = getDB();

  console.log('🔍 Поиск бронирований с card-50 и paidAmount > 0...\n');

  // Находим все bookings с card-50 и paidAmount > 0
  const bookings = await db.collection('bookings')
    .find({
      bookingPaymentMethod: 'card-50',
      paidAmount: { $gt: 0 },
      isDeleted: { $ne: true }
    })
    .toArray();

  if (bookings.length === 0) {
    console.log('✅ Не найдено бронирований для исправления');
    process.exit(0);
  }

  console.log(`Найдено бронирований: ${bookings.length}\n`);

  const updates: BookingUpdate[] = [];
  let correctCount = 0;

  for (const booking of bookings) {
    const oldTotalPrice = booking.totalPrice || 0;
    const paidAmount = booking.paidAmount || 0;
    
    // Правильная totalPrice = paidAmount * 2 (так как оплачено 50%)
    const newTotalPrice = Math.round(paidAmount * 2 * 100) / 100;

    // Проверяем, нужно ли обновление (разница больше 1 рубля)
    if (Math.abs(oldTotalPrice - newTotalPrice) < 1) {
      correctCount++;
      continue;
    }

    // Пересчитываем статусы оплаты на основе новой totalPrice
    const fullyPaid = paidAmount + 1e-6 >= newTotalPrice;
    const newPaymentStatus = fullyPaid ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
    
    // Определяем половинную оплату: считаем половинной если оплачено 45%-55% от общей суммы
    const halfThreshold = newTotalPrice * 0.5;
    const newIsHalfPaid = !fullyPaid && paidAmount >= halfThreshold * 0.9 && paidAmount <= halfThreshold * 1.1;

    updates.push({
      _id: booking._id,
      oldTotalPrice,
      newTotalPrice,
      paidAmount,
      oldPaymentStatus: booking.paymentStatus || 'unknown',
      newPaymentStatus,
      oldIsPaid: booking.isPaid || false,
      newIsPaid: fullyPaid,
      oldIsHalfPaid: booking.isHalfPaid,
      newIsHalfPaid
    });
  }

  if (updates.length === 0) {
    console.log('✅ Все бронирования уже имеют правильную totalPrice');
    console.log(`Проверено: ${bookings.length}, правильных: ${correctCount}\n`);
    process.exit(0);
  }

  // Показываем что будет изменено
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('📋 СПИСОК ИЗМЕНЕНИЙ:\n');
  
  let totalDifference = 0;
  
  for (const update of updates) {
    const difference = update.newTotalPrice - update.oldTotalPrice;
    totalDifference += Math.abs(difference);
    const diffIcon = difference > 0 ? '↑' : '↓';
    
    console.log(`${diffIcon} ID: ${update._id}`);
    console.log(`   TotalPrice:     ${update.oldTotalPrice.toFixed(2)} ₽ → ${update.newTotalPrice.toFixed(2)} ₽ (${difference > 0 ? '+' : ''}${difference.toFixed(2)} ₽)`);
    console.log(`   PaidAmount:     ${update.paidAmount.toFixed(2)} ₽ (50% от новой totalPrice)`);
    console.log(`   PaymentStatus:  ${update.oldPaymentStatus} → ${update.newPaymentStatus}`);
    console.log(`   IsPaid:         ${update.oldIsPaid} → ${update.newIsPaid}`);
    console.log(`   IsHalfPaid:     ${update.oldIsHalfPaid} → ${update.newIsHalfPaid}`);
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('📊 СТАТИСТИКА:\n');
  console.log(`Всего проверено:           ${bookings.length}`);
  console.log(`Нужно обновить:            ${updates.length}`);
  console.log(`Уже правильные:            ${correctCount}`);
  console.log(`Общая разница в ценах:     ${totalDifference.toFixed(2)} ₽\n`);

  if (dryRun) {
    console.log('🔎 DRY-RUN режим: изменения НЕ применены');
    console.log('Чтобы применить изменения, запустите без --dry-run\n');
    process.exit(0);
  }

  // Применяем изменения
  console.log('💾 Применение изменений...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    try {
      await db.collection('bookings').updateOne(
        { _id: update._id },
        {
          $set: {
            totalPrice: update.newTotalPrice,
            paymentStatus: update.newPaymentStatus,
            isPaid: update.newIsPaid,
            isHalfPaid: update.newIsHalfPaid,
            updatedAt: new Date()
          }
        }
      );
      successCount++;
      console.log(`✓ ${update._id}: обновлено`);
    } catch (error) {
      errorCount++;
      console.error(`✗ ${update._id}: ошибка - ${error}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
  console.log('✅ ЗАВЕРШЕНО\n');
  console.log(`Успешно обновлено:  ${successCount}`);
  console.log(`Ошибок:             ${errorCount}\n`);

  process.exit(0);
}

// Проверяем аргументы командной строки
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

if (isDryRun) {
  console.log('🔎 Запуск в DRY-RUN режиме (без применения изменений)\n');
}

fixCard50Prices(isDryRun).catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
