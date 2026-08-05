'use strict';

const { getDb } = require('./client');

const formatRecord = (record) => {
  if (!record) return null;
  const { _id, ...rest } = record;
  return rest;
};

const submissionRepository = {
  findById: async (id) => {
    const db = await getDb();
    const record = await db.collection('submissions').findOne({ id });
    return formatRecord(record);
  },
  
  findByUser: async (userId) => {
    const db = await getDb();
    const records = await db.collection('submissions').find({ userId }).toArray();
    return records.map(formatRecord);
  },
  
  findByExamAndUser: async (examId, userId) => {
    const db = await getDb();
    const records = await db.collection('submissions').find({ examId, userId }).toArray();
    return records.map(formatRecord);
  },
  
  create: async (submission) => {
    const db = await getDb();
    const record = { ...submission };
    await db.collection('submissions').insertOne({ ...record });
    return record;
  },
  
  reset: async () => {
    const db = await getDb();
    await db.collection('submissions').deleteMany({});
  },
};

module.exports = submissionRepository;
