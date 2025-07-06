import config from '../configurations/config'; 
import * as logger from '#utils/logger'; 
import mongoose from 'mongoose';

const mongoUri = config.clientOptions.mongoUri;
let isConnected = false;

/**
 * Connects to the MongoDB database using Mongoose.
 * This function should be called once during bot initialization.
 */
export async function connectToDatabase() {
  if (isConnected) {
    logger.debug('MongoDB is already connected.');
    return;
  }

  if (!mongoUri) {
    logger.fatal('MongoDB URI is not defined. Please set mongoUri in your config or environment variables.');
    process.exit(1);
    return;
  }

  logger.info('Attempting to connect to MongoDB...');

  try {
    mongoose.set('strictQuery', true); 
    await mongoose.connect(mongoUri);

    isConnected = true;

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
    /* process.exit(1); */
  }
};

mongoose.connection.on('connected', () => {
  logger.success('MongoDB connection established.');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected.');
  isConnected = true;
});

/**
 * Closes the MongoDB connection.
 * Should be called during graceful shutdown of the application.
 */
export async function disconnectFromDatabase() {
  if (isConnected) {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed successfully.');
      isConnected = false;
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error.message);
    }
  } else {
    logger.debug('MongoDB connection already closed or not established.');
  }
};

/**
 * Checks if the database is currently connected.
 * @returns {boolean} True if connected, false otherwise.
 */
export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1; 
};