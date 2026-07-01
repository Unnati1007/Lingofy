/**
 * Vercel Serverless Entry Point
 *
 * This file wraps the Express app for Vercel's serverless runtime.
 * MongoDB connection is cached across warm invocations to avoid
 * reconnecting on every request (serverless connection pooling).
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app';

const MONGO_URI = process.env.MONGO_URI || '';

// Cache the connection so it is reused across warm Lambda invocations
let isConnected = false;

async function connectToDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGO_URI, {
      // Recommended settings for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('MongoDB connected (serverless)');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Vercel expects a default export of a Node.js http handler
// Express app IS a valid handler (it's a function(req, res))
export default async function handler(req: any, res: any) {
  await connectToDB();
  return app(req, res);
}
