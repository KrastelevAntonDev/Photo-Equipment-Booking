import { MongoClient, Db } from 'mongodb';
import { env } from './env';
let db: Db;

export const connectDB = async () => {
  try {
    // Формируем строку подключения с авторизацией
    let uri = `mongodb://mongodb:27017/${env.MONGODB_NAME}`;
    // Добавляем аутентификацию, если заданы credentials
    if (env.MONGO_USERNAME && env.MONGO_PASSWORD) {
      uri = `mongodb://${env.MONGO_USERNAME}:${encodeURIComponent(env.MONGO_PASSWORD)}@mongodb:27017/${env.MONGODB_NAME}?authSource=admin`;
    }

    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(env.MONGODB_NAME);
    console.log('Connected to MongoDB');
    return true
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};