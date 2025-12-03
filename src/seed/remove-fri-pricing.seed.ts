import { connectDB, getDB } from '@/config/database';

async function run() {
  try {
    await connectDB();
    const db = getDB();
    const rooms = db.collection('rooms');

    // Удаляем поле pricing.fri_17_24 у всех документов
    const result = await rooms.updateMany(
      { 'pricing.fri_17_24': { $exists: true } },
      { $unset: { 'pricing.fri_17_24': '' } }
    );

    console.log(`Removed pricing.fri_17_24 from ${result.modifiedCount} rooms`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to remove fri_17_24 from rooms:', err);
    process.exit(1);
  }
}

run();
