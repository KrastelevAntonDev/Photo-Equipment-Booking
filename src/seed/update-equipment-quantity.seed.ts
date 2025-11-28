import { connectDB, getDB } from '../config/database';
import { Equipment } from '../modules/equipment/domain/equipment.entity';

/**
 * Данные оборудования с количеством
 * Используем точные названия из fileconverts.json
 */
const equipmentData: Array<{ name: string; totalQuantity: number }> = [
  { name: 'Осветитель Aputure Amaran 300c RGB', totalQuantity: 10 },
  { name: 'Осветитель Aputure Light Storm (LS) 600x Pro', totalQuantity: 3 },
  { name: 'Осветитель Aputure Storm 1200x', totalQuantity: 2 },
  { name: 'Светодиодная трубка Amaran PT4c', totalQuantity: 5 },
  { name: 'Софтбокс Aputure Light Dome III 90 см', totalQuantity: 10 },
  { name: 'Софтбокс Aputure Light Octadome 120', totalQuantity: 5 },
  { name: 'Софтбокс Aputure Lantern 90', totalQuantity: 5 },
  { name: 'Шторки Aputure Barn Doors с Bowens байонетом', totalQuantity: 5 },
  { name: 'Осветитель Aputure STORM 80c', totalQuantity: 6 },
  { name: 'Осветитель Aputure Light Storm (LS) 600C Pro II', totalQuantity: 5 },
  { name: 'Светодиодный коврик Aputure Amaran F21c', totalQuantity: 5 },
  { name: 'Светодиодный коврик Aputure Amaran F22c', totalQuantity: 5 },
  { name: 'Спотлайт Amaran Spotlight SE 19 (Lens Kit)', totalQuantity: 1 },
  { name: 'Cпотлайт Aputure Spotlight Mount 26', totalQuantity: 1 },
  { name: 'Спотлайт Amaran Spotlight SE 36 (Lens Kit)', totalQuantity: 1 },
  { name: 'Диафрагма Aputure Spotlight SE Iris', totalQuantity: 3 },
  { name: 'Линза Френеля Aputure Fresnel 2X', totalQuantity: 5 },
  { name: 'Линза Френеля Aputure CF4 Fresnel для STORM 80c', totalQuantity: 5 },
  { name: 'Осветитель Aputure Nova P600C Kit (с кейсом)', totalQuantity: 2 },
  { name: 'Стойка KUPO 546M K -STAND JUNIOR BOOM STAND', totalQuantity: 2 },
  { name: 'Стойка KUPO 195 BABY KIT STAND', totalQuantity: 30 },
  { name: 'Стойка со штангой KUPO CS-40MKB MASTER C-STAND GRIP ARM 134-235 см', totalQuantity: 20 },
  { name: 'Стойка KUPO 226MH MASTER COMBO HD STAND SILVER', totalQuantity: 13 },
  { name: 'Комплект колес KUPO KC-080R для круглых ножек 22мм', totalQuantity: 13 },
  { name: 'Кронштейн KUPO KCP-610 FOAMCORE FORK для пенопласта', totalQuantity: 10 },
  { name: 'Флаг KUPO KT-2436FW FULL FRAME ARTIFICAL SILK', totalQuantity: 10 },
  { name: 'Флаг KUPO KT-2436FBD FULL FRAME BLACK DENIM', totalQuantity: 10 },
  { name: 'Зажим KUPO KCP-604 SUPER VISER CLAMP END JAW 4"', totalQuantity: 10 },
  { name: 'Зажим KUPO KCP-607 SUPER VISER CLAMP END JAW 9"', totalQuantity: 5 },
  { name: 'Зажим KUPO KCP-700 SUPER CONVI CLAMP SILVER W/ KCP-7SDL SADDLE', totalQuantity: 6 },
  { name: 'Перекладина телескопическая KUPO KCP-636B BIG BOOM', totalQuantity: 2 },
  { name: 'Стойка с редукторной колонной KUPO 484', totalQuantity: 2 },
];

/**
 * Обновление количества оборудования в базе данных
 */
async function updateEquipmentQuantities(): Promise<void> {
  try {
    // Подключаемся к базе данных
    await connectDB();
    
    const db = getDB();
    const equipmentCollection = db.collection<Equipment>('equipment');

    console.log('🔄 Начинаю обновление количества оборудования...\n');

    let updated = 0;
    let notFound = 0;
    let errors = 0;

    for (const item of equipmentData) {
      try {
        // Функция для нормализации имени (убираем префиксы, лишние пробелы, приводим к нижнему регистру)
        const normalizeName = (name: string): string => {
          return name
            .toLowerCase()
            .replace(/^(осветитель|софтбокс|стойка|зажим|флаг|кронштейн|комплект|журавль|перекладина|линза|светодиодная|светодиодный|спотлайт|диафрагма|коврик|трубка|шторки|чайник|юбка|с\s+штангой|с\s+редукторной|с\s+кейсом)\s+/i, '')
            .replace(/\s*\([^)]*\)\s*/g, ' ') // Убираем скобки и их содержимое
            .replace(/[^\w\sа-яё]/gi, ' ') // Заменяем спецсимволы на пробелы
            .replace(/\s+/g, ' ')
            .trim();
        };

        // Функция для извлечения ключевых слов (игнорируем короткие слова и стоп-слова)
        const getKeywords = (name: string): string[] => {
          const stopWords = new Set(['для', 'с', 'и', 'или', 'на', 'в', 'из', 'к', 'от', 'до', 'по', 'со', 'под']);
          return normalizeName(name)
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));
        };

        const searchKeywords = getKeywords(item.name);
        
        // Получаем все оборудование для более гибкого поиска
        const allEquipment = await equipmentCollection.find({ isDeleted: { $ne: true } }).toArray();
        
        // Ищем по нормализованным именам (точное совпадение)
        const normalizedSearchName = normalizeName(item.name);
        let equipment = allEquipment.find(eq => {
          const normalizedDbName = normalizeName(eq.name);
          return normalizedDbName === normalizedSearchName;
        });

        // Если не найдено, пробуем поиск по ключевым словам
        if (!equipment) {
          let bestMatch: { equipment: typeof allEquipment[0]; score: number } | null = null;
          
          for (const eq of allEquipment) {
            const dbKeywords = getKeywords(eq.name);
            
            // Считаем количество совпадающих ключевых слов
            const matchingKeywords = searchKeywords.filter(sk => 
              dbKeywords.some(dk => {
                // Точное совпадение
                if (dk === sk) return true;
                // Одно слово содержит другое
                if (dk.includes(sk) || sk.includes(dk)) return true;
                // Частичное совпадение (минимум 4 символа)
                if (sk.length >= 4 && dk.length >= 4) {
                  const minLen = Math.min(sk.length, dk.length);
                  const maxLen = Math.max(sk.length, dk.length);
                  // Если разница в длине не более 30%, считаем похожими
                  if (maxLen - minLen <= maxLen * 0.3) {
                    // Проверяем общие символы
                    const commonChars = sk.split('').filter(c => dk.includes(c)).length;
                    return commonChars >= minLen * 0.7;
                  }
                }
                return false;
              })
            );
            
            // Вычисляем score (процент совпадения)
            const score = matchingKeywords.length / Math.max(searchKeywords.length, dbKeywords.length);
            
            // Если совпадает минимум 60% ключевых слов
            if (score >= 0.6 && (!bestMatch || score > bestMatch.score)) {
              bestMatch = { equipment: eq, score };
            }
          }
          
          if (bestMatch && bestMatch.equipment._id) {
            equipment = bestMatch.equipment;
            console.log(`🔍 Найдено по ключевым словам (score: ${(bestMatch.score * 100).toFixed(0)}%): "${item.name}" -> "${equipment.name}"`);
          }
        }

        if (!equipment || !equipment._id) {
          console.log(`⚠️  Не найдено: "${item.name}"`);
          notFound++;
          continue;
        }

        if (!equipment) {
          console.log(`⚠️  Не найдено: "${item.name}"`);
          notFound++;
          continue;
        }

        // Вычисляем доступное количество (если bookedQuantity уже есть, иначе 0)
        const bookedQuantity = equipment.bookedQuantity || 0;
        const availableQuantity = Math.max(0, item.totalQuantity - bookedQuantity);

        // Обновляем оборудование
        await equipmentCollection.updateOne(
          { _id: equipment._id },
          {
            $set: {
              totalQuantity: item.totalQuantity,
              bookedQuantity: bookedQuantity, // Сохраняем текущее забронированное количество
              availableQuantity: availableQuantity,
              updatedAt: new Date(),
            },
          }
        );

        console.log(`✅ Обновлено: "${item.name}" - Всего: ${item.totalQuantity}, Забронировано: ${bookedQuantity}, Доступно: ${availableQuantity}`);
        updated++;
      } catch (error: any) {
        console.error(`❌ Ошибка при обновлении "${item.name}":`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Итоги обновления:');
    console.log(`   ✅ Обновлено: ${updated}`);
    console.log(`   ⚠️  Не найдено: ${notFound}`);
    console.log(`   ❌ Ошибок: ${errors}`);
    console.log(`\n✨ Обновление завершено!\n`);
  } catch (error: any) {
    console.error('❌ Критическая ошибка:', error);
    throw error;
  }
}

// Запуск скрипта
if (require.main === module) {
  updateEquipmentQuantities()
    .then(() => {
      console.log('✅ Скрипт выполнен успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка выполнения скрипта:', error);
      process.exit(1);
    });
}

export { updateEquipmentQuantities };

