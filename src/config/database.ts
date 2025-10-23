import { MongoClient, Db } from 'mongodb';
import { env } from './env';
let db: Db;

export const connectDB = async () => {
  try {
    const uri = env.MONGODB_URI + env.MONGODB_PORT;

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