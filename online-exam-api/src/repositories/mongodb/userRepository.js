'use strict';

const { getDb } = require('./client');

// Helper to remove MongoDB internal _id when returning objects
const formatRecord = (record) => {
  if (!record) return null;
  const { _id, ...rest } = record;
  return rest;
};

const userRepository = {
  findByEmail: async (email) => {
    const db = await getDb();
    const record = await db.collection('users').findOne({ email: String(email).toLowerCase() });
    return formatRecord(record);
  },

  findById: async (id) => {
    const db = await getDb();
    const record = await db.collection('users').findOne({ id });
    return formatRecord(record);
  },

  create: async (user) => {
    const db = await getDb();
    const record = { ...user, email: user.email.toLowerCase() };
    await db.collection('users').insertOne({ ...record }); // spreading to avoid mutating original with _id
    return record;
  },

  list: async () => {
    const db = await getDb();
    const records = await db.collection('users').find().toArray();
    return records.map(formatRecord);
  },

  reset: async () => {
    const db = await getDb();
    await db.collection('users').deleteMany({});
  },
};

module.exports = userRepository;
