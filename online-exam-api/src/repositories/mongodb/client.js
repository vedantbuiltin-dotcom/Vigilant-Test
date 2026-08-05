'use strict';

const { MongoClient } = require('mongodb');
const env = require('../../config/env');
const logger = require('../../config/logger');

let client = null;
let db = null;

const connect = async () => {
  if (client) return db;
  
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI must be defined in the environment variables');
  }

  try {
    client = new MongoClient(env.mongodbUri);
    await client.connect();
    db = client.db();
    
    // Create unique index on 'id' across all collections for UUID lookup compatibility
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('exams').createIndex({ id: 1 }, { unique: true });
    await db.collection('questions').createIndex({ id: 1 }, { unique: true });
    await db.collection('submissions').createIndex({ id: 1 }, { unique: true });
    await db.collection('questions').createIndex({ examId: 1 });
    await db.collection('submissions').createIndex({ userId: 1 });
    await db.collection('submissions').createIndex({ examId: 1, userId: 1 });

    logger.info('Connected to MongoDB cluster');
    return db;
  } catch (err) {
    logger.error('Failed to connect to MongoDB', err);
    throw err;
  }
};

const getDb = async () => {
  if (!db) {
    await connect();
  }
  return db;
};

const close = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed');
  }
};

module.exports = {
  connect,
  getDb,
  close,
};
