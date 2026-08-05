'use strict';

const { getDb } = require('./client');

const formatRecord = (record) => {
  if (!record) return null;
  const { _id, ...rest } = record;
  return rest;
};

const examRepository = {
  findById: async (id) => {
    const db = await getDb();
    const record = await db.collection('exams').findOne({ id });
    return formatRecord(record);
  },
  
  list: async () => {
    const db = await getDb();
    const records = await db.collection('exams').find().toArray();
    return records.map(formatRecord);
  },
  
  create: async (exam) => {
    const db = await getDb();
    const record = { ...exam };
    await db.collection('exams').insertOne({ ...record });
    return record;
  },
  
  update: async (id, patch) => {
    const db = await getDb();
    const existing = await db.collection('exams').findOne({ id });
    if (!existing) return null;
    
    const merged = { ...formatRecord(existing), ...patch, id, updatedAt: new Date().toISOString() };
    await db.collection('exams').updateOne({ id }, { $set: merged });
    return merged;
  },
  
  delete: async (id) => {
    const db = await getDb();
    await db.collection('exams').deleteOne({ id });
  },
  
  reset: async () => {
    const db = await getDb();
    await db.collection('exams').deleteMany({});
  },
};

module.exports = examRepository;
