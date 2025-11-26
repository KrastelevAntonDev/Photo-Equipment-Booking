import { connectDB } from '@config/database';
import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';
import { EquipmentMongoRepository } from '@modules/equipment/infrastructure/equipment.mongo.repository';

// Конфигурация изображений для залов
const roomImages: Record<string, string[]> = {
  'АВАНГАРД': [
    '/public/uploads/rooms/avangard_1.jpg',
    '/public/uploads/rooms/avangard_2.jpg',
    '/public/uploads/rooms/avangard_3.jpg',
  ],
  'АФРОДИТА': [
    '/public/uploads/rooms/afrodita_1.jpg',
    '/public/uploads/rooms/afrodita_2.jpg',
    '/public/uploads/rooms/afrodita_3.jpg',
  ],
  'БИСТРО': [
    '/public/uploads/rooms/bistro_1.jpg',
    '/public/uploads/rooms/bistro_2.jpg',
  ],
  '2 ЛИКА': [
    '/public/uploads/rooms/2lika_1.jpg',
    '/public/uploads/rooms/2lika_2.jpg',
  ],
  'КРИПТОН': [
    '/public/uploads/rooms/krypton_1.jpg',
    '/public/uploads/rooms/krypton_2.jpg',
  ],
  'ЛОФТ РУМ': [
    '/public/uploads/rooms/loft_room_1.jpg',
    '/public/uploads/rooms/loft_room_2.jpg',
    '/public/uploads/rooms/loft_room_3.jpg',
  ],
  'МАНУФАКТУРА': [
    '/public/uploads/rooms/manufaktura_1.jpg',
    '/public/uploads/rooms/manufaktura_2.jpg',
  ],
  'МУЛЕН РУЖ': [
    '/public/uploads/rooms/moulin_rouge_1.jpg',
    '/public/uploads/rooms/moulin_rouge_2.jpg',
  ],
  'НЬЮ-ЙОРК': [
    '/public/uploads/rooms/new_york_1.jpg',
    '/public/uploads/rooms/new_york_2.jpg',
  ],
  'ОДИССЕЙ': [
    '/public/uploads/rooms/odyssey_1.jpg',
    '/public/uploads/rooms/odyssey_2.jpg',
  ],
  'ПАЛАЦЦО': [
    '/public/uploads/rooms/palazzo_1.jpg',
    '/public/uploads/rooms/palazzo_2.jpg',
  ],
  'ПАНОРАМА': [
    '/public/uploads/rooms/panorama_1.jpg',
    '/public/uploads/rooms/panorama_2.jpg',
  ],
  'ПРОВАНС': [
    '/public/uploads/rooms/provence_1.jpg',
    '/public/uploads/rooms/provence_2.jpg',
  ],
  'САВОЙЯ': [
    '/public/uploads/rooms/savoy_1.jpg',
    '/public/uploads/rooms/savoy_2.jpg',
  ],
  'СКАНДИНАВИЯ': [
    '/public/uploads/rooms/scandinavia_1.jpg',
    '/public/uploads/rooms/scandinavia_2.jpg',
  ],
  'СОУЛ': [
    '/public/uploads/rooms/soul_1.jpg',
    '/public/uploads/rooms/soul_2.jpg',
  ],
  'СТУДИЯ 33': [
    '/public/uploads/rooms/studio33_1.jpg',
    '/public/uploads/rooms/studio33_2.jpg',
  ],
  'ТЕХНОЛАБ': [
    '/public/uploads/rooms/technolab_1.jpg',
    '/public/uploads/rooms/technolab_2.jpg',
  ],
  'УРБАН ХОЛЛ': [
    '/public/uploads/rooms/urban_hall_1.jpg',
    '/public/uploads/rooms/urban_hall_2.jpg',
  ],
  'ЦИКЛОРАМА': [
    '/public/uploads/rooms/cyclorama_1.jpg',
    '/public/uploads/rooms/cyclorama_2.jpg',
  ],
  'ШАЛЕ': [
    '/public/uploads/rooms/chalet_1.jpg',
    '/public/uploads/rooms/chalet_2.jpg',
  ],
  'ЭДЕМ': [
    '/public/uploads/rooms/eden_1.jpg',
    '/public/uploads/rooms/eden_2.jpg',
  ],
  'ОАЗИС': [
    '/public/uploads/rooms/oasis_1.jpg',
    '/public/uploads/rooms/oasis_2.jpg',
  ],
  'ОСТЕРИЯ': [
    '/public/uploads/rooms/osteria_1.jpg',
    '/public/uploads/rooms/osteria_2.jpg',
  ],
  'ПОДКАСТНАЯ': [
    '/public/uploads/rooms/podcastnaya_1.jpg',
    '/public/uploads/rooms/podcastnaya_2.jpg',
  ],
  'ПЬЕР': [
    '/public/uploads/rooms/pierre_1.jpg',
    '/public/uploads/rooms/pierre_2.jpg',
  ],
  'РАЙ': [
    '/public/uploads/rooms/paradise_1.jpg',
    '/public/uploads/rooms/paradise_2.jpg',
  ],
  'САТУРН': [
    '/public/uploads/rooms/saturn_1.jpg',
    '/public/uploads/rooms/saturn_2.jpg',
  ],
  'АМСТЕРДАМ': [
    '/public/uploads/rooms/amsterdam_1.jpg',
    '/public/uploads/rooms/amsterdam_2.jpg',
  ],
  'ЛОНДОН': [
    '/public/uploads/rooms/london_1.jpg',
    '/public/uploads/rooms/london_2.jpg',
  ],
  'МАРАКЕШ': [
    '/public/uploads/rooms/marrakech_1.jpg',
    '/public/uploads/rooms/marrakech_2.jpg',
  ],
  'МАРРАКЕШ': [
    '/public/uploads/rooms/marrakech_1.jpg',
    '/public/uploads/rooms/marrakech_2.jpg',
  ],
  'САНТОРИНИ': [
    '/public/uploads/rooms/santorini_1.jpg',
    '/public/uploads/rooms/santorini_2.jpg',
  ],
  'СИЦИЛИЯ': [
    '/public/uploads/rooms/sicily_1.jpg',
    '/public/uploads/rooms/sicily_2.jpg',
  ],
  'БРУКЛИН': [
    '/public/uploads/rooms/brooklyn_1.jpg',
    '/public/uploads/rooms/brooklyn_2.jpg',
  ],
  'ХРОМ': [
    '/public/uploads/rooms/chrome_1.jpg',
    '/public/uploads/rooms/chrome_2.jpg',
  ],
  'ЗАЛ ЧАЙКОВСКИЙ': [
    '/public/uploads/rooms/tchaikovsky_hall_1.jpg',
    '/public/uploads/rooms/tchaikovsky_hall_2.jpg',
    '/public/uploads/rooms/tchaikovsky_hall_3.jpg',
  ],
  'НИАГАРА': [
    '/public/uploads/rooms/niagara_1.jpg',
    '/public/uploads/rooms/niagara_2.jpg',
  ],
  'ДИОД': [
    '/public/uploads/rooms/diod_1.jpg',
    '/public/uploads/rooms/diod_2.jpg',
  ],
  'КИОТО': [
    '/public/uploads/rooms/kyoto_1.jpg',
    '/public/uploads/rooms/kyoto_2.jpg',
  ],
  'ШАНХАЙ': [
    '/public/uploads/rooms/shanghai_1.jpg',
    '/public/uploads/rooms/shanghai_2.jpg',
  ],
};

// Конфигурация изображений для оборудования
const equipmentImages: Record<string, string> = {
  // Освещение
  'Profoto D2': '/public/uploads/equipment/profoto_d2.jpg',
  'Godox SL-60W': '/public/uploads/equipment/godox_sl60w.jpg',
  'Aputure 300d II': '/public/uploads/equipment/aputure_300d.jpg',
  'Софтбокс': '/public/uploads/equipment/softbox.jpg',
  'Октобокс': '/public/uploads/equipment/octobox.jpg',
  'Рефлектор': '/public/uploads/equipment/reflector.jpg',
  
  // Камеры и объективы
  'Sony A7 III': '/public/uploads/equipment/sony_a7iii.jpg',
  'Canon EOS R5': '/public/uploads/equipment/canon_r5.jpg',
  'Объектив 50mm f/1.4': '/public/uploads/equipment/lens_50mm.jpg',
  'Объектив 85mm f/1.8': '/public/uploads/equipment/lens_85mm.jpg',
  
  // Стабилизация
  'Стедикам': '/public/uploads/equipment/steadicam.jpg',
  'Штатив Manfrotto': '/public/uploads/equipment/tripod_manfrotto.jpg',
  'Слайдер': '/public/uploads/equipment/slider.jpg',
  
  // Аудио
  'Микрофон Rode': '/public/uploads/equipment/rode_mic.jpg',
  'Петличка': '/public/uploads/equipment/lavalier_mic.jpg',
  
  // Фоны и реквизит
  'Бумажный фон': '/public/uploads/equipment/paper_backdrop.jpg',
  'Тканевый фон': '/public/uploads/equipment/fabric_backdrop.jpg',
};

async function addImagesToRooms() {
  const roomRepository = new RoomMongoRepository();
  
  console.log('🖼️  Добавление изображений в залы...');
  
  const rooms = await roomRepository.findAll();
  let updatedCount = 0;
  
  for (const room of rooms) {
    const roomName = room.name.trim();
    const images = roomImages[roomName];
    
    if (images && images.length > 0) {
      // Обновляем только если изображений нет или массив пустой
      if (!room.images || room.images.length === 0) {
        await roomRepository.updateRoom(room._id!.toString(), { images });
        console.log(`✅ ${roomName}: добавлено ${images.length} изображений`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${roomName}: уже есть изображения (${room.images.length})`);
      }
    } else {
      console.log(`⚠️  ${roomName}: нет конфигурации изображений`);
    }
  }
  
  console.log(`\n✨ Обновлено залов: ${updatedCount}/${rooms.length}`);
}

async function addImagesToEquipment() {
  const equipmentRepository = new EquipmentMongoRepository();
  
  console.log('\n🖼️  Добавление изображений в оборудование...');
  
  const equipment = await equipmentRepository.findAll();
  let updatedCount = 0;
  
  for (const item of equipment) {
    const itemName = item.name.trim();
    const image = equipmentImages[itemName];
    
    if (image) {
      // Обновляем только если изображения нет
      if (!item.image) {
        await equipmentRepository.updateEquipment(item._id!.toString(), { image });
        console.log(`✅ ${itemName}: добавлено изображение`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${itemName}: уже есть изображение`);
      }
    } else {
      // Пробуем найти по частичному совпадению
      const matchedKey = Object.keys(equipmentImages).find(key => 
        itemName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(itemName.toLowerCase())
      );
      
      if (matchedKey && !item.image) {
        const matchedImage = equipmentImages[matchedKey];
        await equipmentRepository.updateEquipment(item._id!.toString(), { image: matchedImage });
        console.log(`✅ ${itemName}: добавлено изображение (по совпадению с "${matchedKey}")`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${itemName}: нет конфигурации изображения`);
      }
    }
  }
  
  console.log(`\n✨ Обновлено оборудования: ${updatedCount}/${equipment.length}`);
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