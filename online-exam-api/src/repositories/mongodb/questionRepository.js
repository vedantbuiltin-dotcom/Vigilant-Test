'use strict';

const { getDb } = require('./client');

const formatRecord = (record) => {
  if (!record) return null;
  const { _id, ...rest } = record;
  return rest;
};

const questionRepository = {
  findById: async (id) => {
    const db = await getDb();
    const record = await db.collection('questions').findOne({ id });
    return formatRecord(record);
  },
  
  findByExam: async (examId) => {
    const db = await getDb();
    const records = await db.collection('questions').find({ examId }).toArray();
    return records.map(formatRecord);
  },
  
  listAll: async () => {
    const db = await getDb();
    const records = await db.collection('questions').find({}).toArray();
    return records.map(formatRecord);
  },
  
  create: async (question) => {
    const db = await getDb();
    const record = { ...question };
    await db.collection('questions').insertOne({ ...record });
    return record;
  },
  
  update: async (id, patch) => {
    const db = await getDb();
    const existing = await db.collection('questions').findOne({ id });
    if (!existing) return null;
    
    const merged = { ...formatRecord(existing), ...patch, id, updatedAt: new Date().toISOString() };
    await db.collection('questions').updateOne({ id }, { $set: merged });
    return merged;
  },
  
  delete: async (id) => {
    const db = await getDb();
    await db.collection('questions').deleteOne({ id });
  },
  
  deleteByExam: async (examId) => {
    const db = await getDb();
    const result = await db.collection('questions').deleteMany({ examId });
    return result.deletedCount;
  },
  
  reset: async () => {
    const db = await getDb();
    await db.collection('questions').deleteMany({});
  },
};

module.exports = questionRepository;
