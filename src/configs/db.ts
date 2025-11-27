// src/config/db.ts
import mongoose from 'mongoose';
import { envConfiguration } from './env.config';

const { MONGO_URI } = envConfiguration;

export async function dbConnection() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error', err);
    process.exit(1);
  }
}
