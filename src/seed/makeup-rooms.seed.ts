import { getDB } from '@/config/database';

async function seedMakeupRooms() {
  const db = getDB();
  const collection = db.collection('makeuprooms');

  // Проверяем, есть ли уже данные
  const count = await collection.countDocuments();
  if (count > 0) {
    console.log('✅ Makeup rooms already exist, skipping seed');
    return;
  }

  const makeupRooms = [
    {
      name: 'Гримерный стол',
      description: 'Профессиональный гримерный стол с зеркалом и освещением',
      pricePerHour: 500,
      totalQuantity: 5,
      bookedQuantity: 0,
      images: [],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
    {
      name: 'ВИП-гримерная',
      description: 'Отдельная VIP-гримерная комната с профессиональным оборудованием',
      pricePerHour: 2500,
      totalQuantity: 1,
      bookedQuantity: 0,
      images: [],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

  await collection.insertMany(makeupRooms);
  console.log('✅ Makeup rooms seeded successfully');
}

// Если запускается напрямую
if (require.main === module) {
  const { connectDB, closeDB } = require('@/config/database');
  connectDB()
    .then(() => seedMakeupRooms())
    .then(() => closeDB())
    .then(() => process.exit(0))
    .catch((err: Error) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}

export { seedMakeupRooms };
