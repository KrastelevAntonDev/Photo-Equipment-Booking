import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
let db: Db;

export const connectDB = async () => {
  console.log(12);
  
  try {
		const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:';  
		const MONGODB_PORT = process.env.MONGODB_PORT || '27017';  
		const MONGODB_NAME = process.env.MONGODB_NAME || 'myDB'
		const uri = MONGODB_URI + MONGODB_PORT
    console.log(uri);
    
		const client = new MongoClient(uri);
    await client.connect();
    db = client.db(MONGODB_NAME);
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