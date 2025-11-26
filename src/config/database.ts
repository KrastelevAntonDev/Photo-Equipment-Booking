import { MongoClient, Db } from 'mongodb';
import { env } from './env';
let db: Db;

export const connectDB = async () => {
  try {
    // If MONGODB_URI already contains port (like mongodb://host:27017), use it as-is
    // Otherwise, append MONGODB_PORT to MONGODB_URI
    const uri = env.MONGODB_URI.includes(':27017') || env.MONGODB_URI.includes(':') && env.MONGODB_URI.split(':').length > 2
      ? env.MONGODB_URI
      : env.MONGODB_URI + env.MONGODB_PORT;

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