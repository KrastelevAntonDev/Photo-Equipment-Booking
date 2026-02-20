import { connectDB, getDB } from '@/config/database';
import { ObjectId } from 'mongodb';

/**
 * Скрипт для пересчета totalPrice всех бронирований с 12 февраля 2026
 * 
 * Логика:
 * 1. Находит все bookings начиная с 12.02.2026 (не удаленные)
 * 2. Для каждого бронирования пересчитывает totalPrice:
 *    - Комната: по часам/получасам с учетом тарифов (пятница 17:00+, выходные, праздники)
 *    - Оборудование: фиксированная цена за единицу * quantity (НЕ умножается на часы)
 *    - Гримерные: цена за час * quantity * hours (ПО часам)
 *    - Наценка за людей (people): если указано
 * 3. Применяет промокод если есть (discount)
 * 4. Пересчитывает статусы оплаты
 * 
 * Использование:
 * npx ts-node src/scripts/recalculate-bookings-from-feb12.ts --dry-run  # Показать что будет изменено
 * npx ts-node src/scripts/recalculate-bookings-from-feb12.ts            # Применить изменения
 */

interface BookingUpdate {
  _id: ObjectId;
  oldTotalPrice: number;
  oldOriginalPrice?: number;
  newTotalPrice: number;
  newOriginalPrice: number;
  paidAmount: number;
  roomPrice: number;
  equipmentPrice: number;
  makeupRoomsPrice: number;
  peopleSurcharge: number;
  discount?: number;
  oldPaymentStatus: string;
  newPaymentStatus: string;
  oldIsPaid: boolean;
  newIsPaid: boolean;
  oldIsHalfPaid: boolean | undefined;
  newIsHalfPaid: boolean;
}

// Расчет стоимости комнаты по часам
function resolveRoomRate(room: any, dt: Date): number {
  const pricing = room.pricing;
  if (!pricing) return room.pricePerHour || 0;

  function pickRate(...rates: (number | undefined)[]): number {
    for (const r of rates) {
      if (typeof r === 'number' && r > 0) return r;
    }
    return room.pricePerHour || 0;
  }

  // Moscow timezone offset
  const mskOffset = 3 * 60; // +3 hours
  const localDt = new Date(dt.getTime() + mskOffset * 60 * 1000);

  const dayOfWeek = localDt.getUTCDay(); // 0=Sunday, 6=Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // TODO: add holidays check if needed
  const isHoliday = false;

  if (isWeekend || isHoliday) {
    return pickRate(
      pricing.weekend_holiday_00_24,
      pricing.weekday_12_24,
      pricing.weekday_00_12,
      room.pricePerHour
    );
  }

  // Friday after 17:00 MSK
  if (dayOfWeek === 5) {
    const hour = localDt.getUTCHours();
    if (hour >= 17) {
      return pickRate(
        pricing.weekend_holiday_00_24,
        pricing.weekday_12_24,
        pricing.weekday_00_12,
        room.pricePerHour
      );
    }
  }

  const hour = localDt.getUTCHours();
  const isMorning = hour < 12;

  return pickRate(
    isMorning ? pricing.weekday_00_12 : pricing.weekday_12_24,
    isMorning ? pricing.weekday_12_24 : pricing.weekday_00_12,
    pricing.weekend_holiday_00_24,
    room.pricePerHour
  );
}

// Наценка за людей
function calculatePeopleSurcharge(basePrice: number, people: string): number {
  let surchargePercent = 0;

  switch (people) {
    case 'up-to-15':
      surchargePercent = 10;
      break;
    case 'up-to-20':
      surchargePercent = 20;
      break;
    case 'up-to-30':
      surchargePercent = 30;
      break;
    case 'more-than-30':
      surchargePercent = 40;
      break;
    default:
      surchargePercent = 0;
  }

  return Math.round(basePrice * (1 + surchargePercent / 100) * 100) / 100;
}

async function recalculateBookings(dryRun: boolean = false) {
  await connectDB();
  const db = getDB();

  console.log('🔍 Поиск бронирований с 12 февраля 2026...\n');

  const cutoffDate = new Date('2026-02-12T00:00:00.000Z');

  // Находим все bookings начиная с cutoffDate
  const bookings = await db.collection('bookings')
    .find({
      createdAt: { $gte: cutoffDate },
      isDeleted: { $ne: true }
    })
    .toArray();

  if (bookings.length === 0) {
    console.log('✅ Не найдено бронирований для пересчета');
    process.exit(0);
  }

  console.log(`Найдено бронирований: ${bookings.length}\n`);

  const updates: BookingUpdate[] = [];
  let correctCount = 0;
  let errorCount = 0;

  for (const booking of bookings) {
    try {
      const oldTotalPrice = booking.totalPrice || 0;
      const oldOriginalPrice = booking.originalPrice;
      const paidAmount = booking.paidAmount || 0;

      // Получаем комнату
      const room = await db.collection('rooms').findOne({ _id: new ObjectId(booking.roomId) });
      if (!room) {
        console.error(`❌ [${booking._id}] Room not found: ${booking.roomId}`);
        errorCount++;
        continue;
      }

      const startDate = new Date(booking.start);
      const endDate = new Date(booking.end);

      // 1. Рассчитываем стоимость комнаты по времени
      let roomTotalPrice = 0;
      let cursor = new Date(startDate);
      while (cursor < endDate) {
        const nextHour = new Date(cursor);
        nextHour.setMinutes(0, 0, 0);
        if (nextHour <= cursor) nextHour.setHours(nextHour.getHours() + 1);
        const segmentEnd = endDate < nextHour ? endDate : nextHour;
        const segmentHours = (segmentEnd.getTime() - cursor.getTime()) / 36e5;

        const roomRate = resolveRoomRate(room, cursor);
        roomTotalPrice += roomRate * segmentHours;

        cursor = segmentEnd;
      }

      // 2. Рассчитываем стоимость оборудования (фиксированная цена * quantity)
      let equipmentTotalPrice = 0;
      if (booking.equipment && booking.equipment.length > 0) {
        for (const item of booking.equipment) {
          const eq = await db.collection('equipment').findOne({ 
            _id: new ObjectId(item.equipmentId) 
          });
          if (eq) {
            equipmentTotalPrice += (eq.pricePerDay || 0) * (item.quantity || 1);
          }
        }
      }

      // 3. Рассчитываем стоимость гримерных (цена за час * quantity * hours)
      let makeupRoomsTotalPrice = 0;
      if (booking.makeupRooms && booking.makeupRooms.length > 0) {
        for (const item of booking.makeupRooms) {
          const mr = await db.collection('makeup_rooms').findOne({ 
            _id: new ObjectId(item.makeupRoomId) 
          });
          if (mr) {
            makeupRoomsTotalPrice += (mr.pricePerHour || 0) * (item.quantity || 1) * (item.hours || 1);
          }
        }
      }

      // Базовая цена без наценки за людей
      let basePrice = roomTotalPrice + equipmentTotalPrice + makeupRoomsTotalPrice;
      basePrice = Math.round(basePrice * 100) / 100;

      // 4. Применяем наценку за людей
      let priceWithPeopleSurcharge = basePrice;
      let peopleSurchargeAmount = 0;
      if (booking.people && booking.people !== 'up-to-10') {
        priceWithPeopleSurcharge = calculatePeopleSurcharge(basePrice, booking.people);
        peopleSurchargeAmount = priceWithPeopleSurcharge - basePrice;
      }

      // Это и есть originalPrice (до применения промокода)
      const newOriginalPrice = priceWithPeopleSurcharge;

      // 5. Применяем промокод если есть
      let newTotalPrice = newOriginalPrice;
      let discountAmount = 0;

      if (booking.discount && booking.discount > 0) {
        discountAmount = Math.round(newOriginalPrice * (booking.discount / 100) * 100) / 100;
        newTotalPrice = Math.round((newOriginalPrice - discountAmount) * 100) / 100;
      }

      // Проверяем, нужно ли обновление (разница больше 0.5 рубля)
      if (Math.abs(oldTotalPrice - newTotalPrice) < 0.5) {
        correctCount++;
        continue;
      }

      // Пересчитываем статусы оплаты
      const fullyPaid = paidAmount + 1e-6 >= newTotalPrice;
      const newPaymentStatus = fullyPaid ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
      
      // Определяем половинную оплату
      const halfThreshold = newTotalPrice * 0.5;
      const newIsHalfPaid = !fullyPaid && paidAmount >= halfThreshold * 0.9 && paidAmount <= halfThreshold * 1.1;

      updates.push({
        _id: booking._id,
        oldTotalPrice,
        oldOriginalPrice,
        newTotalPrice,
        newOriginalPrice,
        paidAmount,
        roomPrice: Math.round(roomTotalPrice * 100) / 100,
        equipmentPrice: Math.round(equipmentTotalPrice * 100) / 100,
        makeupRoomsPrice: Math.round(makeupRoomsTotalPrice * 100) / 100,
        peopleSurcharge: Math.round(peopleSurchargeAmount * 100) / 100,
        discount: discountAmount,
        oldPaymentStatus: booking.paymentStatus || 'unknown',
        newPaymentStatus,
        oldIsPaid: booking.isPaid || false,
        newIsPaid: fullyPaid,
        oldIsHalfPaid: booking.isHalfPaid,
        newIsHalfPaid
      });
    } catch (error) {
      console.error(`❌ [${booking._id}] Ошибка расчета: ${error}`);
      errorCount++;
    }
  }

  if (updates.length === 0) {
    console.log('✅ Все бронирования уже имеют правильную totalPrice');
    console.log(`Проверено: ${bookings.length}, правильных: ${correctCount}, ошибок: ${errorCount}\n`);
    process.exit(0);
  }

  // Показываем что будет изменено
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('📋 СПИСОК ИЗМЕНЕНИЙ:\n');
  
  let totalDifference = 0;
  
  for (const update of updates) {
    const difference = update.newTotalPrice - update.oldTotalPrice;
    totalDifference += Math.abs(difference);
    const diffIcon = difference > 0 ? '↑' : difference < 0 ? '↓' : '=';
    
    console.log(`${diffIcon} ID: ${update._id}`);
    console.log(`   Старая totalPrice:      ${update.oldTotalPrice.toFixed(2)} ₽`);
    console.log(`   Новая totalPrice:       ${update.newTotalPrice.toFixed(2)} ₽ (${difference > 0 ? '+' : ''}${difference.toFixed(2)} ₽)`);
    console.log(`   ├─ Комната:             ${update.roomPrice.toFixed(2)} ₽`);
    console.log(`   ├─ Оборудование:        ${update.equipmentPrice.toFixed(2)} ₽`);
    console.log(`   ├─ Гримерные:           ${update.makeupRoomsPrice.toFixed(2)} ₽`);
    if (update.peopleSurcharge > 0) {
      console.log(`   ├─ Наценка за людей:    ${update.peopleSurcharge.toFixed(2)} ₽`);
    }
    if (update.discount && update.discount > 0) {
      console.log(`   ├─ Скидка (промокод):   -${update.discount.toFixed(2)} ₽`);
      console.log(`   └─ OriginalPrice:       ${update.newOriginalPrice.toFixed(2)} ₽`);
    }
    console.log(`   PaidAmount:             ${update.paidAmount.toFixed(2)} ₽`);
    console.log(`   PaymentStatus:          ${update.oldPaymentStatus} → ${update.newPaymentStatus}`);
    console.log(`   IsPaid:                 ${update.oldIsPaid} → ${update.newIsPaid}`);
    console.log(`   IsHalfPaid:             ${update.oldIsHalfPaid} → ${update.newIsHalfPaid}`);
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('📊 СТАТИСТИКА:\n');
  console.log(`Всего проверено:           ${bookings.length}`);
  console.log(`Нужно обновить:            ${updates.length}`);
  console.log(`Уже правильные:            ${correctCount}`);
  console.log(`Ошибок при расчете:        ${errorCount}`);
  console.log(`Общая разница в ценах:     ${totalDifference.toFixed(2)} ₽\n`);

  if (dryRun) {
    console.log('🔎 DRY-RUN режим: изменения НЕ применены');
    console.log('Чтобы применить изменения, запустите без --dry-run\n');
    process.exit(0);
  }

  // Применяем изменения
  console.log('💾 Применение изменений...\n');

  let successCount = 0;
  let updateErrorCount = 0;

  for (const update of updates) {
    try {
      const updateFields: any = {
        totalPrice: update.newTotalPrice,
        originalPrice: update.newOriginalPrice,
        paymentStatus: update.newPaymentStatus,
        isPaid: update.newIsPaid,
        isHalfPaid: update.newIsHalfPaid,
        updatedAt: new Date()
      };

      await db.collection('bookings').updateOne(
        { _id: update._id },
        { $set: updateFields }
      );
      successCount++;
      console.log(`✓ ${update._id}: обновлено`);
    } catch (error) {
      updateErrorCount++;
      console.error(`✗ ${update._id}: ошибка - ${error}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
  console.log('✅ ЗАВЕРШЕНО\n');
  console.log(`Успешно обновлено:  ${successCount}`);
  console.log(`Ошибок:             ${updateErrorCount}\n`);

  process.exit(0);
}

// Проверяем аргументы командной строки
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

if (isDryRun) {
  console.log('🔎 Запуск в DRY-RUN режиме (без применения изменений)\n');
}

recalculateBookings(isDryRun).catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
